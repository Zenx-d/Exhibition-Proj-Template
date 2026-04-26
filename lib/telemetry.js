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
        path TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  } catch (error) {
    console.error('Failed to init telemetry schema:', error);
  }
}

// Fire and forget schema init
initSchema();

export async function logTelemetryEvent(payload) {
  const sql = getDb();
  if (!sql) return { success: false, error: 'Database not connected' };

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

export async function logReferral(tag, path) {
  const sql = getDb();
  if (!sql) return;

  try {
    await sql`
      INSERT INTO referrals (referrer_tag, path)
      VALUES (${tag}, ${path})
    `;
  } catch (error) {
    console.error('Referral DB Error:', error);
  }
}

export async function subscribeUser(email, source) {
  const sql = getDb();
  if (!sql) return { success: false, error: 'Database not connected' };

  try {
    await sql`
      INSERT INTO subscribers (email, source)
      VALUES (${email}, ${source})
      ON CONFLICT (email) DO NOTHING
    `;
    return { success: true };
  } catch (error) {
    console.error('Subscription DB Error:', error);
    return { success: false, error: error.message };
  }
}
