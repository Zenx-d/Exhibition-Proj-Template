'use server';

import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';
import { rateLimit } from './rateLimit';

// Singleton DB Client
let cachedSql = null;
function getDb() {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cachedSql = neon(url);
  return cachedSql;
}

/**
 * Optimized Telemetry Subsystem
 * Reduces DB latency and ensures 100% reliability for exhibition data.
 */
async function ensureSchema() {
  if (global._zenSchemaInited) return;
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
    global._zenSchemaInited = true;
    console.log('[Zen Telemetry] Schema Verified');
  } catch (error) {
    console.error('[Zen Telemetry] Schema Init Error:', error);
  }
}

export async function logTelemetryEvent(payload) {
  const sql = getDb();
  if (!sql) return { success: false };

  // Background schema check
  ensureSchema();

  try {
    const { sessionId, eventType, pagePath, posthogId, ...rest } = payload;
    const ip = (await headers()).get('x-forwarded-for') || 'unknown';
    
    // Non-blocking rate limit
    const { success } = rateLimit(`telemetry_${ip}`, 100, 60000);
    if (!success) return { success: false, error: 'Rate limit' };

    await sql`
      INSERT INTO telemetry_logs (session_id, event_type, page_path, posthog_id, payload)
      VALUES (${sessionId}, ${eventType}, ${pagePath}, ${posthogId || null}, ${JSON.stringify(rest)}::jsonb)
    `;
    return { success: true };
  } catch (error) {
    console.error('[Zen Telemetry] Log Error:', error);
    return { success: false };
  }
}

export async function logReferral(tag, path, source = 'unknown', metadata = {}) {
  const sql = getDb();
  if (!sql) return { success: false };
  
  ensureSchema();

  try {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown';
    const { success } = rateLimit(`referral_${ip}`, 20, 60000);
    if (!success) return { success: false };

    await sql`
      INSERT INTO referrals (referrer_tag, path, source, metadata)
      VALUES (${tag}, ${path}, ${source}, ${JSON.stringify(metadata)}::jsonb)
    `;
    return { success: true };
  } catch (error) {
    console.error('[Zen Telemetry] Referral Error:', error);
    return { success: false };
  }
}

export async function subscribeUser(email, source) {
  const sql = getDb();
  if (!sql) return { success: false, error: 'DB Offline' };

  ensureSchema();

  try {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown';
    const { success: limitSuccess } = rateLimit(`subscribe_${ip}`, 5, 60000);
    if (!limitSuccess) return { success: false, error: 'Too many attempts' };

    if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' };

    const result = await sql`
      INSERT INTO subscribers (email, source)
      VALUES (${email}, ${source})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;

    if (result.length === 0) return { success: false, error: 'Already subscribed!' };
    return { success: true };
  } catch (error) {
    console.error('[Zen Telemetry] Subscribe Error:', error);
    return { success: false, error: 'Database error' };
  }
}
