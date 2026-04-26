'use client';

import posthog from 'posthog-js';

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

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PostHog] Referral Captured: ${tag}`);
  }
}
