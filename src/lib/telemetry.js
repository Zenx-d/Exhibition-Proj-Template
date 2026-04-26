'use server';

import { Client } from '@neondatabase/serverless';

// Singleton connection to avoid cold start latency
let globalClient = null;
let isSchemaInitialized = false;

async function getClient() {
  if (globalClient) return globalClient;
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  globalClient = client;
  return client;
}

/**
 * Ensures the telemetry table exists with a robust JSONB schema.
 * Only runs once per server instance.
 */
async function ensureSchema() {
  if (isSchemaInitialized) return;
  
  try {
    const client = await getClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        event_type TEXT,
        page_path TEXT,
        posthog_id TEXT,
        event_data JSONB,
        category TEXT,
        dwell_seconds FLOAT,
        scroll_depth FLOAT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_telemetry_session ON telemetry_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_telemetry_type ON telemetry_events(event_type);
    `);
    isSchemaInitialized = true;
  } catch (err) {
    console.error('[Telemetry Server Error] Schema Init Failed:', err.message);
  }
}

export async function logTelemetryEvent(payload) {
  try {
    // Background schema check (non-blocking for the first event)
    ensureSchema().catch(() => {});
    
    const client = await getClient();
    const { 
      sessionId, eventType, pagePath, posthogId, eventData, 
      category, dwellSeconds, scrollDepth, userAgent 
    } = payload;

    await client.query(
      `INSERT INTO telemetry_events (
        session_id, event_type, page_path, posthog_id, event_data, 
        category, dwell_seconds, scroll_depth, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        sessionId, eventType, pagePath, posthogId, JSON.stringify(eventData), 
        category, dwellSeconds, scrollDepth, userAgent
      ]
    );

    return { success: true };
  } catch (err) {
    console.error('[Telemetry Server Error] Logging Failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function logReferral(tag, pagePath, source, metadata) {
  return logTelemetryEvent({
    sessionId: 'referral_system',
    eventType: 'referral_visit',
    pagePath,
    posthogId: 'server_generated',
    eventData: { tag, source, ...metadata },
    category: 'referral',
    dwellSeconds: null,
    scrollDepth: null,
    userAgent: 'Server-Side'
  });
}

export async function subscribeUser(email, source) {
  try {
    const client = await getClient();
    
    // Create subscribers table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(
      'INSERT INTO newsletter_subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email, source]
    );

    return { success: true };
  } catch (err) {
    console.error('[Newsletter Error] Subscription Failed:', err.message);
    return { success: false, error: err.message };
  }
}
