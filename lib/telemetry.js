'use server';

import { neon } from '@neondatabase/serverless';

/**
 * Creates a database connection.
 * Returns null if no connection string is available.
 */
function getDb() {
  const url = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

/**
 * Initializes the clean, robust schema.
 * We use a single JSONB column for the payload to NEVER encounter "column missing" errors again.
 */
async function initSchema() {
  const sql = getDb();
  if (!sql) return;
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS telemetry_logs (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT,
        event_type TEXT,
        page_path TEXT,
        posthog_id TEXT,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id BIGSERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id BIGSERIAL PRIMARY KEY,
        referrer_tag TEXT,
        source TEXT,
        path TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  } catch (error) {
    console.error('Failed to init telemetry schema:', error);
  }
}

// Fire and forget schema init once per process
if (typeof global !== 'undefined' && !global.telemetrySchemaInitialized) {
  initSchema().then(() => {
    global.telemetrySchemaInitialized = true;
  });
}

import { headers } from 'next/headers';
import { rateLimit } from './rateLimit';


export async function logTelemetryEvent(payload) {
  const sql = getDb();
  if (!sql) return { success: false, error: 'Database not connected' };

  // Rate limit telemetry: 60 events per minute per IP
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  const { success } = rateLimit(`telemetry_${ip}`, 60, 60000);
  if (!success) return { success: false, error: 'Rate limit exceeded' };

  try {
    const { sessionId, eventType, pagePath, posthogId, ...rest } = payload;
    await sql`
      INSERT INTO telemetry_logs (session_id, event_type, page_path, posthog_id, payload)
      VALUES (${sessionId}, ${eventType}, ${pagePath}, ${posthogId || null}, ${JSON.stringify(rest)}::jsonb)
    `;
    return { success: true };
  } catch (error) {
    console.error('Telemetry DB Error:', error);
    return { success: false, error: error.message };
  }
}

export async function logReferral(tag, path, source = 'unknown', metadata = {}) {
  const logPrefix = `[Telemetry:${tag}]`;
  console.log(`${logPrefix} Processing referral from ${source}`);
  
  const sql = getDb();
  if (!sql) {
    console.error(`${logPrefix} Error: Database URL missing in environment`);
    return { success: false, error: 'Database URL missing' };
  }

  try {
    const metaStr = JSON.stringify(metadata || {});
    await sql`
      INSERT INTO referrals (referrer_tag, path, source, metadata)
      VALUES (${tag}, ${path}, ${source}, ${metaStr}::jsonb)
    `;
    console.log(`${logPrefix} Successfully saved to DB`);
    return { success: true };
  } catch (error) {
    console.error(`${logPrefix} DB Insert Error:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function subscribeUser(email, source) {
  console.log(`[Telemetry] New subscription attempt: ${email} from ${source}`);
  const sql = getDb();
  if (!sql) {
    console.error('[Telemetry] Subscription Error: Database connection failed');
    return { success: false, error: 'Database not connected' };
  }

  // Strict rate limit for subscriptions: 3 per minute per IP
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  const { success } = rateLimit(`subscribe_${ip}`, 3, 60000);
  if (!success) {
    console.warn(`[Telemetry] Rate limit hit for ${ip}`);
    return { success: false, error: 'Too many subscription attempts. Please slow down.' };
  }

  try {
    await sql`
      INSERT INTO subscribers (email, source)
      VALUES (${email}, ${source})
      ON CONFLICT (email) DO NOTHING
    `;
    console.log(`[Telemetry] Successfully subscribed: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('[Telemetry] Subscription DB Error:', error.message);
    return { success: false, error: error.message };
  }
}
