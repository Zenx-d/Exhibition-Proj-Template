'use client';

/**
 * TELEMETRY & DATA PERSISTENCE SERVICE
 * Designed for Next.js 15 Static Export
 */

import { neon } from '@neondatabase/serverless';

// Use NEXT_PUBLIC_ for client-side accessibility in static builds
const DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

/**
 * EMAIL VALIDATOR
 * Ensures proper real email format and filters out obviously fake ones.
 */
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return false;
  
  // Filter out common fake/throwaway patterns if necessary
  const blacklistedDomains = ['test.com', 'example.com', 'fake.com'];
  const domain = email.split('@')[1];
  if (blacklistedDomains.includes(domain)) return false;
  
  return true;
}

/**
 * CLIENT-SIDE TELEMETRY LOGGER
 */
export async function logTelemetryEvent(payload) {
  if (typeof window === 'undefined' || !DATABASE_URL) return { success: false };

  try {
    const sql = neon(DATABASE_URL);
    const {
      sessionId, eventType, eventData, pagePath,
      geo, device, userAgent, referrer, ipHash
    } = payload;

    await sql`
      INSERT INTO telemetry_events (
        session_id, event_type, event_data, page_path,
        country, city, region,
        device_type, browser, browser_version, os, os_version,
        screen_width, screen_height,
        user_agent, referrer, ip_hash
      ) VALUES (
        ${sessionId}, ${eventType}, ${JSON.stringify(eventData)}, ${pagePath},
        ${geo?.country || null}, ${geo?.city || null}, ${geo?.region || null},
        ${device?.type || 'desktop'}, ${device?.browser || null}, ${device?.browserVersion || null},
        ${device?.os || null}, ${device?.osVersion || null},
        ${device?.screenWidth || null}, ${device?.screenHeight || null},
        ${userAgent}, ${referrer}, ${ipHash}
      )
    `;
    return { success: true };
  } catch (error) {
    console.error('Telemetry logging failed:', error);
    return { success: false };
  }
}

/**
 * CLIENT-SIDE SUBSCRIPTION
 */
export async function subscribeUser(email) {
  if (typeof window === 'undefined' || !DATABASE_URL) return { success: false };
  
  if (!isValidEmail(email)) {
    return { success: false, error: 'invalid_email' };
  }

  try {
    const sql = neon(DATABASE_URL);
    await sql`
      INSERT INTO subscribers (email) 
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;
    return { success: true };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, error: 'db_error' };
  }
}
