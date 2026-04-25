'use client';

import { UAParser } from 'ua-parser-js';
import { logTelemetryEvent } from '../lib/telemetry';

// HELPER: SHA-256 Hashing for IP and Search
async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HELPER: Get Cookie Value
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// HELPER: Set Cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
}

/**
 * Capture and send telemetry data if consent is given.
 */
export async function captureEvent(eventType, eventData = {}) {
  // Check Consent
  if (getCookie('cookie-consent') !== 'true') return;

  try {
    // 1. Get/Create Session ID
    let sessionId = getCookie('telemetry_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCookie('telemetry_session', sessionId, 1); // 24 hours
    }

    // 2. Capture Device Info
    const parser = new UAParser();
    const result = parser.getResult();
    const device = {
      type: result.device.type || 'desktop',
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    };

    // 3. Capture Geo Info (via ipapi.co)
    // NOTE: This might be blocked by some ad-blockers, so we wrap it.
    let geo = {};
    let ipHash = 'unknown';
    try {
      const response = await fetch('https://ipapi.co/json/');
      const geoData = await response.json();
      geo = {
        country: geoData.country_name,
        city: geoData.city,
        region: geoData.region,
      };
      ipHash = await sha256(geoData.ip);
    } catch (e) {
      console.warn('Geo fetch failed, proceeding without IP info.');
    }

    // 4. Prepare Payload
    const payload = {
      sessionId,
      eventType,
      eventData,
      pagePath: window.location.pathname,
      geo,
      device,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ipHash,
    };

    // 5. Send to Server Action
    await logTelemetryEvent(payload);

  } catch (error) {
    console.error('Telemetry capture failed:', error);
  }
}

/**
 * Handle Search Events (with hashed queries)
 */
export async function captureSearch(query, resultCount) {
  const hashedQuery = await sha256(query.toLowerCase().trim());
  await captureEvent('search', { queryHash: hashedQuery, resultCount });
}
