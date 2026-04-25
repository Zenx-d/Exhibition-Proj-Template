'use client';

// NOTE: Since this is a static export platform, we are using the Neon serverless driver 
// directly in the browser as requested. 
// WARNING: This exposes the DATABASE_URL in the client-side bundle.

import { neon } from '@neondatabase/serverless';

// In a static export, we can't use process.env.DATABASE_URL at runtime on the client
// unless it's prefixed with NEXT_PUBLIC_. 
const DATABASE_URL = "postgresql://neondb_owner:npg_PHiz9auQtSU2@ep-raspy-feather-ammp27it-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

/**
 * CLIENT-SIDE TELEMETRY LOGGER
 */
export async function logTelemetryEvent(payload) {
  try {
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
    console.error('Failed to log telemetry:', error);
    return { success: false };
  }
}

/**
 * CLIENT-SIDE SUBSCRIPTION
 */
export async function subscribeUser(email) {
  try {
    await sql`
      INSERT INTO subscribers (email) 
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;
    return { success: true };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false };
  }
}
