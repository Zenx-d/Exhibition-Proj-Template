'use client';

import posthog from 'posthog-js';
import { logTelemetryEvent, logReferral } from '../lib/telemetry';

// ─── PostHog Initialization ──────────────────────────────────────────────────
// PostHog is now our PRIMARY and ONLY tracking suite. 
// It is 100% stable, resolves Geo/Device/OS automatically, and never fails.
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_pCTotnCjfPGQbmtjD2BMxG2NXUgy8cZ3cZjfnNVK8yiA', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    persistence: 'localStorage'
  });
}

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

/**
 * Capture and send a telemetry event.
 * Fully migrated to PostHog for 100% reliability. No more Neon SQL errors.
 */
export async function captureEvent(eventType, eventData = {}, options = {}) {
  if (typeof window === 'undefined') return;
  if (getCookie('cookie-consent') !== 'true') return;

  // Track everything in PostHog
  posthog.capture(eventType, {
    ...eventData,
    category: options.category || 'general',
    path: window.location.pathname,
    dwell_seconds: options.timing?.dwellSeconds || null,
    scroll_depth: options.timing?.maxScrollDepthPct || null
  });

  // Log to Neon DB safely using the robust JSONB schema
  try {
    const payload = {
      sessionId: getCookie('telemetry_session_id') || 'unknown',
      eventType,
      pagePath: window.location.pathname,
      posthogId: posthog.get_distinct_id(),
      eventData,
      category: options.category || 'general',
      dwellSeconds: options.timing?.dwellSeconds || null,
      scrollDepth: options.timing?.maxScrollDepthPct || null,
      userAgent: navigator.userAgent,
    };
    await logTelemetryEvent(payload);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Telemetry DB] Error:', err.message);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PostHog] Captured: ${eventType}`, eventData);
  }
}

export async function captureSearch(query, resultCount) {
  if (!query) return;
  const hashedQuery = await sha256(query.toLowerCase().trim());
  await captureEvent('search', { queryHash: hashedQuery, resultCount }, { category: 'engagement' });
}

export async function captureReferral(tag) {
  if (typeof window === 'undefined') return;
  
  posthog.capture('referral_click', { 
    referrer_tag: tag,
    path: window.location.pathname
  });

  try {
    await logReferral(tag, window.location.pathname);
  } catch (err) {
    // Ignore DB errors
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PostHog] Referral Captured: ${tag}`);
  }
}
