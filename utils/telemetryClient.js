'use client';

import { UAParser } from 'ua-parser-js';
import { logTelemetryEvent } from '../lib/telemetry';

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

// ─── Geo cache (fetched once per session) ────────────────────────────────────
let _geoCache = null;
let _geoFetching = false;
let _geoCallbacks = [];

async function getGeo() {
  if (_geoCache) return _geoCache;
  if (_geoFetching) {
    return new Promise((resolve) => _geoCallbacks.push(resolve));
  }
  _geoFetching = true;
  try {
    // Switch to freeipapi.com for maximum compatibility and CORS support
    const res = await fetch('https://freeipapi.com/api/json/', { signal: AbortSignal.timeout(4000) });
    const d = await res.json();
    
    _geoCache = {
      country: d.countryName,
      countryCode: d.countryCode,
      city: d.cityName,
      region: d.regionName,
      timezone: d.timeZone,
      org: d.as || d.isp,
      latitude: d.latitude,
      longitude: d.longitude,
      ipHash: await sha256(d.ipAddress),
    };
  } catch (err) {
    console.warn('[Geo] lookup failed, falling back to empty:', err.message);
    _geoCache = {};
  }
  _geoCallbacks.forEach(cb => cb(_geoCache));
  _geoCallbacks = [];
  _geoFetching = false;
  return _geoCache;
}

// ─── Device info (computed once) ─────────────────────────────────────────────
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
    pixelRatio: window.devicePixelRatio || 1,
    deviceMemory: navigator.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    touchSupport: navigator.maxTouchPoints > 0,
  };
  return _deviceCache;
}

function getScreenInfo() {
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

/**
 * Capture and send a telemetry event.
 * Returns silently if consent not given or SSR.
 */
export async function captureEvent(eventType, eventData = {}, options = {}) {
  if (typeof window === 'undefined') return;
  if (getCookie('cookie-consent') !== 'true') return;

  try {
    // Session management
    let sessionId = getCookie('telemetry_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCookie('telemetry_session', sessionId, 1);
    }

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
    // Silent fail — telemetry must never break the app
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[captureEvent] failed silently:', err?.message);
    }
  }
}

function inferCategory(eventType) {
  if (['page_view', 'page_leave', 'outbound_click'].includes(eventType)) return 'navigation';
  if (['member_click', 'project_view', 'search', 'filter_used'].includes(eventType)) return 'engagement';
  if (['visibility_change'].includes(eventType)) return 'system';
  if (['newsletter_signup'].includes(eventType)) return 'form';
  if (['performance'].includes(eventType)) return 'system';
  return 'other';
}

/**
 * Capture a search event with hashed query for privacy.
 */
export async function captureSearch(query, resultCount) {
  if (!query) return;
  const hashedQuery = await sha256(query.toLowerCase().trim());
  await captureEvent('search', { queryHash: hashedQuery, resultCount }, { category: 'engagement' });
}
