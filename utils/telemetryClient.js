'use client';

import posthog from 'posthog-js';
import { logTelemetryEvent, logReferral } from '../lib/telemetry';

// Helper to get a cookie
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Capture a UI event and log it to both PostHog (analytics) and Neon (raw data).
 * Completely non-blocking for UI responsiveness.
 */
export function captureEvent(eventType, eventData = {}, options = {}) {
  // 1. PostHog (Standard Analytics)
  posthog.capture(eventType, {
    ...eventData,
    category: options.category || 'general',
    dwell_time: options.timing?.dwellSeconds || null,
    scroll_depth: options.timing?.maxScrollDepthPct || null
  });

  // 2. Log to Neon DB safely using the robust JSONB schema
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
    // Non-blocking fire-and-forget
    logTelemetryEvent(payload).catch(() => {});
  } catch (err) {
    // Silence errors to keep UI smooth
  }
}

/**
 * Log a search event with result count
 */
export function captureSearch(query, resultCount) {
  captureEvent('search', { query, resultCount }, { category: 'engagement' });
}

/**
 * Track a referral tag for attribution
 */
export function captureReferral(tag, source = 'direct', metadata = {}) {
  // Store in session to track future conversions (like newsletter signup)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(`ref_${tag}_${Date.now()}`, source);
  }

  posthog.capture('referral_landed', {
    tag,
    source,
    ...metadata
  });

  try {
    logReferral(tag, window.location.pathname, source, metadata).catch(() => {});
  } catch (err) {
    // Silence errors
  }
}
