'use client';

import { UAParser } from 'ua-parser-js';
import { logTelemetryEvent, logReferral } from '../lib/telemetry';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sha256(message) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return 'unknown';
  try {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'unknown';
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value || ''}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

export function getSessionId() {
  let sessionId = getCookie('telemetry_session');
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    setCookie('telemetry_session', sessionId, 1);
  }
  return sessionId;
}

// ─── Geo cache with Multi-Provider Fallback ──────────────────────────────────
let _geoCache = null;
let _geoFetching = false;
let _geoCallbacks = [];

async function getGeo() {
  if (_geoCache) return _geoCache;
  if (_geoFetching) {
    return new Promise((resolve) => _geoCallbacks.push(resolve));
  }
  _geoFetching = true;

  const providers = [
    {
      url: 'https://geolocation-db.com/json/',
      map: (d) => ({
        country: d.country_name,
        countryCode: d.country_code,
        city: d.city,
        region: d.state,
        latitude: d.latitude,
        longitude: d.longitude,
        ip: d.IPv4,
      })
    },
    {
      url: 'https://ipapi.co/json/',
      map: (d) => ({
        country: d.country_name,
        countryCode: d.country_code,
        city: d.city,
        region: d.region,
        timezone: d.timezone,
        org: d.org,
        latitude: d.latitude,
        longitude: d.longitude,
        ip: d.ip,
      })
    }
  ];

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const d = await res.json();
      const mapped = provider.map(d);
      _geoCache = {
        ...mapped,
        ipHash: await sha256(mapped.ip || '0.0.0.0'),
      };
      if (_geoCache.country) break; // Success
    } catch (e) {
      console.warn(`[Geo] Provider ${provider.url} failed:`, e.message);
    }
  }

  if (!_geoCache) _geoCache = {};
  
  _geoCallbacks.forEach(cb => cb(_geoCache));
  _geoCallbacks = [];
  _geoFetching = false;
  return _geoCache;
}

// ─── Device info ─────────────────────────────────────────────────────────────
let _deviceCache = null;

function getDeviceInfo() {
  if (_deviceCache) return _deviceCache;
  const parser = new UAParser();
  const r = parser.getResult();
  _deviceCache = {
    type: r.device.type || 'desktop',
    vendor: r.device.vendor || null,
    model: r.device.model || null,
    browser: r.browser.name || null,
    browserVersion: r.browser.version || null,
    engine: r.engine.name || null,
    os: r.os.name || null,
    osVersion: r.os.version || null,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    deviceMemory: typeof navigator !== 'undefined' ? navigator.deviceMemory : null,
    hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : null,
    maxTouchPoints: typeof navigator !== 'undefined' ? (navigator.maxTouchPoints ?? 0) : 0,
    touchSupport: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
  };
  return _deviceCache;
}

function getScreenInfo() {
  if (typeof window === 'undefined') return {};
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    physicalWidth: window.screen.width,
    physicalHeight: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
  };
}

function getNetworkInfo() {
  if (typeof navigator === 'undefined') return {};
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return {};
  return {
    type: conn.effectiveType || null,
    downlink: conn.downlink || null,
    rtt: conn.rtt || null,
    saveData: conn.saveData || false,
  };
}

function getPreferences() {
  if (typeof window === 'undefined') return {};
  return {
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    language: navigator.language || null,
    languages: navigator.languages?.join(',') || null,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || null,
  };
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function captureEvent(eventType, eventData = {}, options = {}) {
  if (typeof window === 'undefined') return;
  if (getCookie('cookie-consent') !== 'true') return;

  try {
    let sessionId = getSessionId();

    const [geo, device, screen, network, preferences] = await Promise.all([
      getGeo(),
      Promise.resolve(getDeviceInfo()),
      Promise.resolve(getScreenInfo()),
      Promise.resolve(getNetworkInfo()),
      Promise.resolve(getPreferences()),
    ]);

    const payload = {
      sessionId,
      eventType,
      eventCategory: options.category || inferCategory(eventType),
      eventData,
      pagePath: window.location.pathname,
      geo,
      device,
      screen,
      network,
      preferences,
      timing: options.timing || null,
      perf: options.perf || null,
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      ipHash: geo?.ipHash || null,
    };

    await logTelemetryEvent(payload);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[captureEvent] failed:', err?.message);
    }
  }
}

function inferCategory(eventType) {
  if (['page_view', 'page_leave', 'outbound_click'].includes(eventType)) return 'navigation';
  if (['member_click', 'project_view', 'search', 'filter_used'].includes(eventType)) return 'engagement';
  if (['visibility_change', 'referral_click'].includes(eventType)) return 'system';
  if (['newsletter_signup'].includes(eventType)) return 'form';
  if (['performance'].includes(eventType)) return 'system';
  return 'other';
}

export async function captureSearch(query, resultCount) {
  if (!query) return;
  const hashedQuery = await sha256(query.toLowerCase().trim());
  await captureEvent('search', { queryHash: hashedQuery, resultCount }, { category: 'engagement' });
}

export async function captureReferral(tag) {
  if (typeof window === 'undefined') return;
  
  const geo = await getGeo();
  const sessionId = getSessionId();
  
  return logReferral({
    referrerTag: tag,
    sessionId: sessionId,
    pagePath: window.location.pathname,
    country: geo.country || 'Unknown',
    userAgent: navigator.userAgent
  });
}
