-- 🚀 ZEN EXHIBITION PLATFORM - DATABASE SCHEMA
-- This script initializes the telemetry and referral tracking system.

-- 1. Telemetry Logs (High-Fidelity Tracking)
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT,
  event_type TEXT,
  page_path TEXT,
  posthog_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscribers (Newsletter Management)
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Referrals (Source & User Attribution)
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_tag TEXT,
  source TEXT,
  path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_page_path ON telemetry_logs(page_path);
CREATE INDEX IF NOT EXISTS idx_referral_tag ON referrals(referrer_tag);
CREATE INDEX IF NOT EXISTS idx_subscriber_email ON subscribers(email);

-- 🛡️ Security Note (For Neon/Supabase/Postgres)
-- If using Neon with public access, ensure RLS (Row-Level Security) is enabled.
-- Example:
-- ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Insert only for everyone" ON telemetry_logs FOR INSERT WITH CHECK (true);
