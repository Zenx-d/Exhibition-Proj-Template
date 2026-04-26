/**
 * SQL SCHEMA — Zen Exhibition Platform
 * Run in Neon Database SQL Editor to create/migrate all required tables.
 * 
 * Version: 3.1 — Full telemetry schema with exhaustive migration block.
 */

-- ═══════════════════════════════════════════════════════════════
-- EXTENSION: Enable UUID generation
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- TABLE: telemetry_events
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS telemetry_events (
  id                      BIGSERIAL PRIMARY KEY,
  session_id              TEXT        NOT NULL,
  event_type              TEXT        NOT NULL,
  event_category          TEXT,
  event_data              JSONB       DEFAULT '{}'::jsonb,
  page_path               TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  dwell_seconds           INTEGER,
  max_scroll_depth_pct    SMALLINT,
  country                 TEXT,
  country_code            TEXT,
  city                    TEXT,
  region                  TEXT,
  latitude                NUMERIC(9,6),
  longitude               NUMERIC(9,6),
  timezone                TEXT,
  org                     TEXT,
  ip_hash                 TEXT,
  device_type             TEXT,
  device_vendor           TEXT,
  device_model            TEXT,
  browser                 TEXT,
  browser_version         TEXT,
  engine                  TEXT,
  os                      TEXT,
  os_version              TEXT,
  pixel_ratio             NUMERIC(4,2),
  device_memory_gb        NUMERIC(4,1),
  hardware_concurrency    SMALLINT,
  max_touch_points        SMALLINT,
  touch_support           BOOLEAN,
  screen_width            SMALLINT,
  screen_height           SMALLINT,
  physical_screen_width   SMALLINT,
  physical_screen_height  SMALLINT,
  screen_avail_width      SMALLINT,
  screen_avail_height     SMALLINT,
  color_depth             SMALLINT,
  connection_type         TEXT,
  connection_downlink     NUMERIC(8,2),
  connection_rtt          INTEGER,
  save_data               BOOLEAN,
  color_scheme            TEXT,
  reduced_motion          BOOLEAN,
  language                TEXT,
  languages               TEXT,
  cookie_enabled          BOOLEAN,
  do_not_track            TEXT,
  performance_load_ms     INTEGER,
  performance_ttfb_ms     INTEGER,
  performance_dcl_ms      INTEGER,
  user_agent              TEXT,
  referrer                TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Add new columns if upgrading
-- ═══════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Basic Meta
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='event_category') THEN
    ALTER TABLE telemetry_events ADD COLUMN event_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='event_data') THEN
    ALTER TABLE telemetry_events ADD COLUMN event_data JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='page_path') THEN
    ALTER TABLE telemetry_events ADD COLUMN page_path TEXT;
  END IF;

  -- Timing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='dwell_seconds') THEN
    ALTER TABLE telemetry_events ADD COLUMN dwell_seconds INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='max_scroll_depth_pct') THEN
    ALTER TABLE telemetry_events ADD COLUMN max_scroll_depth_pct SMALLINT;
  END IF;

  -- Geographic
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='country') THEN
    ALTER TABLE telemetry_events ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='country_code') THEN
    ALTER TABLE telemetry_events ADD COLUMN country_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='city') THEN
    ALTER TABLE telemetry_events ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='region') THEN
    ALTER TABLE telemetry_events ADD COLUMN region TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='latitude') THEN
    ALTER TABLE telemetry_events ADD COLUMN latitude NUMERIC(9,6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='longitude') THEN
    ALTER TABLE telemetry_events ADD COLUMN longitude NUMERIC(9,6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='timezone') THEN
    ALTER TABLE telemetry_events ADD COLUMN timezone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='org') THEN
    ALTER TABLE telemetry_events ADD COLUMN org TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='ip_hash') THEN
    ALTER TABLE telemetry_events ADD COLUMN ip_hash TEXT;
  END IF;

  -- Device
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_type') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_vendor') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_vendor TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_model') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_model TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='browser') THEN
    ALTER TABLE telemetry_events ADD COLUMN browser TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='browser_version') THEN
    ALTER TABLE telemetry_events ADD COLUMN browser_version TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='engine') THEN
    ALTER TABLE telemetry_events ADD COLUMN engine TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='os') THEN
    ALTER TABLE telemetry_events ADD COLUMN os TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='os_version') THEN
    ALTER TABLE telemetry_events ADD COLUMN os_version TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='pixel_ratio') THEN
    ALTER TABLE telemetry_events ADD COLUMN pixel_ratio NUMERIC(4,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_memory_gb') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_memory_gb NUMERIC(4,1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='hardware_concurrency') THEN
    ALTER TABLE telemetry_events ADD COLUMN hardware_concurrency SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='max_touch_points') THEN
    ALTER TABLE telemetry_events ADD COLUMN max_touch_points SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='touch_support') THEN
    ALTER TABLE telemetry_events ADD COLUMN touch_support BOOLEAN;
  END IF;

  -- Screen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_width') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_width SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_height') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_height SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='physical_screen_width') THEN
    ALTER TABLE telemetry_events ADD COLUMN physical_screen_width SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='physical_screen_height') THEN
    ALTER TABLE telemetry_events ADD COLUMN physical_screen_height SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_avail_width') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_avail_width SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_avail_height') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_avail_height SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='color_depth') THEN
    ALTER TABLE telemetry_events ADD COLUMN color_depth SMALLINT;
  END IF;

  -- Network
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='connection_type') THEN
    ALTER TABLE telemetry_events ADD COLUMN connection_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='connection_downlink') THEN
    ALTER TABLE telemetry_events ADD COLUMN connection_downlink NUMERIC(8,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='connection_rtt') THEN
    ALTER TABLE telemetry_events ADD COLUMN connection_rtt INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='save_data') THEN
    ALTER TABLE telemetry_events ADD COLUMN save_data BOOLEAN;
  END IF;

  -- Preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='color_scheme') THEN
    ALTER TABLE telemetry_events ADD COLUMN color_scheme TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='reduced_motion') THEN
    ALTER TABLE telemetry_events ADD COLUMN reduced_motion BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='language') THEN
    ALTER TABLE telemetry_events ADD COLUMN language TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='languages') THEN
    ALTER TABLE telemetry_events ADD COLUMN languages TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='cookie_enabled') THEN
    ALTER TABLE telemetry_events ADD COLUMN cookie_enabled BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='do_not_track') THEN
    ALTER TABLE telemetry_events ADD COLUMN do_not_track TEXT;
  END IF;

  -- Performance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='performance_load_ms') THEN
    ALTER TABLE telemetry_events ADD COLUMN performance_load_ms INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='performance_ttfb_ms') THEN
    ALTER TABLE telemetry_events ADD COLUMN performance_ttfb_ms INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='performance_dcl_ms') THEN
    ALTER TABLE telemetry_events ADD COLUMN performance_dcl_ms INTEGER;
  END IF;

  -- Raw
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='user_agent') THEN
    ALTER TABLE telemetry_events ADD COLUMN user_agent TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='referrer') THEN
    ALTER TABLE telemetry_events ADD COLUMN referrer TEXT;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- TABLE: subscribers & referral_clicks (with RLS)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscribers (
  id                  BIGSERIAL PRIMARY KEY,
  email               TEXT        NOT NULL UNIQUE,
  subscribed_at       TIMESTAMPTZ DEFAULT NOW(),
  source_path         TEXT,
  ip_hash             TEXT,
  country             TEXT,
  verified            BOOLEAN     DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id              BIGSERIAL PRIMARY KEY,
  referrer_tag    TEXT NOT NULL,
  session_id      TEXT,
  page_path       TEXT,
  country         TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Policies
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_insert_telemetry ON telemetry_events;
CREATE POLICY allow_insert_telemetry ON telemetry_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS allow_insert_subscribers ON subscribers;
CREATE POLICY allow_insert_subscribers ON subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS allow_insert_referrals ON referral_clicks;
CREATE POLICY allow_insert_referrals ON referral_clicks FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_te_session ON telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_te_created_at ON telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ref_tag ON referral_clicks(referrer_tag);
