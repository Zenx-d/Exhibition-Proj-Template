'use client';

/**
 * TELEMETRY & DATA PERSISTENCE SERVICE — v3.2
 * 
 * FIX LOG:
 * - Added explicit ::jsonb cast for event_data.
 * - Added detailed error logging for non-production environments.
 * - Suppressed Neon browser warning.
 * - Sanitized connection string.
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL?.trim();

function s(val, maxLen = 255) {
  if (val == null) return null;
  return String(val).replace(/\0/g, '').slice(0, maxLen);
}

function n(val) {
  if (val == null || val === '' || isNaN(Number(val))) return null;
  return Number(val);
}

function b(val) {
  if (val == null) return null;
  return Boolean(val);
}

export async function logTelemetryEvent(payload) {
  if (typeof window === 'undefined' || !DATABASE_URL) return { success: false };

  try {
    const sql = neon(DATABASE_URL, { disableWarningInBrowsers: true });
    
    const {
      sessionId, eventType, eventCategory, eventData, pagePath,
      geo, device, userAgent, referrer, ipHash,
      timing, screen: scr, network, preferences, perf
    } = payload;

    // Use a try-catch specifically for the SQL to catch schema mismatches
    await sql`
      INSERT INTO telemetry_events (
        session_id, event_type, event_category, event_data, page_path,
        dwell_seconds, max_scroll_depth_pct,
        country, country_code, city, region, timezone, org,
        latitude, longitude, ip_hash,
        device_type, device_vendor, device_model,
        browser, browser_version, engine, os, os_version,
        pixel_ratio, device_memory_gb, hardware_concurrency,
        max_touch_points, touch_support,
        screen_width, screen_height,
        physical_screen_width, physical_screen_height,
        screen_avail_width, screen_avail_height, color_depth,
        connection_type, connection_downlink, connection_rtt, save_data,
        color_scheme, reduced_motion, language, languages,
        cookie_enabled, do_not_track,
        performance_load_ms, performance_ttfb_ms, performance_dcl_ms,
        user_agent, referrer
      ) VALUES (
        ${s(sessionId, 64)}, ${s(eventType, 64)}, ${s(eventCategory, 64)},
        ${JSON.stringify(eventData || {})}::jsonb, ${s(pagePath, 512)},
        ${n(timing?.dwellSeconds)}, ${n(timing?.maxScrollDepthPct)},
        ${s(geo?.country)}, ${s(geo?.countryCode, 5)}, ${s(geo?.city)},
        ${s(geo?.region)}, ${s(geo?.timezone, 64)}, ${s(geo?.org)},
        ${n(geo?.latitude)}, ${n(geo?.longitude)}, ${s(ipHash, 64)},
        ${s(device?.type, 32)}, ${s(device?.vendor)}, ${s(device?.model)},
        ${s(device?.browser)}, ${s(device?.browserVersion, 32)},
        ${s(device?.engine, 32)}, ${s(device?.os)}, ${s(device?.osVersion, 64)},
        ${n(device?.pixelRatio)}, ${n(device?.deviceMemory)}, ${n(device?.hardwareConcurrency)},
        ${n(device?.maxTouchPoints)}, ${b(device?.touchSupport)},
        ${n(scr?.width)}, ${n(scr?.height)},
        ${n(scr?.physicalWidth)}, ${n(scr?.physicalHeight)},
        ${n(scr?.availWidth)}, ${n(scr?.availHeight)}, ${n(scr?.colorDepth)},
        ${s(network?.type, 32)}, ${n(network?.downlink)}, ${n(network?.rtt)}, ${b(network?.saveData)},
        ${s(preferences?.colorScheme, 16)}, ${b(preferences?.reducedMotion)},
        ${s(preferences?.language, 32)}, ${s(preferences?.languages, 255)},
        ${b(preferences?.cookieEnabled)}, ${s(preferences?.doNotTrack, 8)},
        ${n(perf?.loadMs)}, ${n(perf?.ttfbMs)}, ${n(perf?.dclMs)},
        ${s(userAgent, 512)}, ${s(referrer, 512)}
      )
    `;
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.group('📊 Telemetry Error');
      console.error('Message:', error.message);
      console.error('Check if your Neon database has the latest schema from scripts/schema.sql');
      console.groupEnd();
    }
    return { success: false };
  }
}

export async function subscribeUser(email, meta = {}) {
  if (typeof window === 'undefined' || !DATABASE_URL) return { success: false };

  try {
    const sql = neon(DATABASE_URL, { disableWarningInBrowsers: true });
    await sql`
      INSERT INTO subscribers (email, source_path, ip_hash, country)
      VALUES (
        ${s(email, 254)},
        ${s(meta.sourcePath || window.location.pathname, 512)},
        ${s(meta.ipHash, 64)},
        ${s(meta.country)}
      )
      ON CONFLICT (email) DO NOTHING
    `;
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Subscription Error]', error.message);
    }
    return { success: false, error: 'db_error' };
  }
}

/**
 * Log a referral click.
 */
export async function logReferral(data) {
  if (typeof window === 'undefined' || !DATABASE_URL) return { success: false };

  try {
    const sql = neon(DATABASE_URL, { disableWarningInBrowsers: true });
    await sql`
      INSERT INTO referral_clicks (referrer_tag, session_id, page_path, country, user_agent)
      VALUES (
        ${s(data.referrerTag, 128)},
        ${s(data.sessionId, 64)},
        ${s(data.pagePath, 512)},
        ${s(data.country, 128)},
        ${s(data.userAgent, 512)}
      )
    `;
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Referral Error]', error.message);
    }
    return { success: false };
  }
}
