/**
 * SQL SCHEMA — Zen Exhibition Platform
 * Run in Neon Database SQL Editor to create/migrate all required tables.
 * 
 * Version: 3.0 — Full telemetry schema with all collected data points.
 */

-- ═══════════════════════════════════════════════════════════════
-- EXTENSION: Enable UUID generation
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- TABLE: telemetry_events
-- Stores every user interaction event with maximum data fidelity.
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS telemetry_events (
  -- Primary key
  id                      BIGSERIAL PRIMARY KEY,

  -- Session & event identification
  session_id              TEXT        NOT NULL,
  event_type              TEXT        NOT NULL,   -- page_view, page_leave, member_click, project_view, filter_used, search, outbound_click, visibility_change, performance, newsletter_signup
  event_category          TEXT,                   -- navigation, engagement, media, form, system
  event_data              JSONB       DEFAULT '{}'::jsonb,
  page_path               TEXT,

  -- ── Timing ─────────────────────────────────────────────────
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  dwell_seconds           INTEGER,                -- how long user stayed on page
  max_scroll_depth_pct    SMALLINT,               -- 0–100, max scroll %

  -- ── Geographic (via ipapi.co) ───────────────────────────────
  country                 TEXT,
  country_code            TEXT,
  city                    TEXT,
  region                  TEXT,
  latitude                NUMERIC(9,6),
  longitude               NUMERIC(9,6),
  timezone                TEXT,
  org                     TEXT,                   -- ISP/organization name
  ip_hash                 TEXT,                   -- SHA-256 hashed IP

  -- ── Device hardware ────────────────────────────────────────
  device_type             TEXT,                   -- mobile, tablet, desktop
  device_vendor           TEXT,                   -- Apple, Samsung, etc.
  device_model            TEXT,                   -- iPhone 15, Pixel 8, etc.
  browser                 TEXT,
  browser_version         TEXT,
  engine                  TEXT,                   -- Blink, WebKit, Gecko
  os                      TEXT,
  os_version              TEXT,
  pixel_ratio             NUMERIC(4,2),           -- window.devicePixelRatio
  device_memory_gb        NUMERIC(4,1),           -- navigator.deviceMemory
  hardware_concurrency    SMALLINT,               -- CPU core count
  max_touch_points        SMALLINT,
  touch_support           BOOLEAN,

  -- ── Screen ─────────────────────────────────────────────────
  screen_width            SMALLINT,               -- viewport width (innerWidth)
  screen_height           SMALLINT,               -- viewport height (innerHeight)
  physical_screen_width   SMALLINT,               -- screen.width
  physical_screen_height  SMALLINT,               -- screen.height
  screen_avail_width      SMALLINT,
  screen_avail_height     SMALLINT,
  color_depth             SMALLINT,               -- bits per color channel

  -- ── Network ────────────────────────────────────────────────
  connection_type         TEXT,                   -- 4g, 3g, wifi, ethernet, etc.
  connection_downlink     NUMERIC(8,2),           -- Mbps
  connection_rtt          INTEGER,                -- ms round-trip time
  save_data               BOOLEAN,                -- data-saver mode enabled

  -- ── User preferences ────────────────────────────────────────
  color_scheme            TEXT,                   -- dark / light
  reduced_motion          BOOLEAN,
  language                TEXT,                   -- en-US, ne-NP, etc.
  languages               TEXT,                   -- comma-separated accepted langs
  cookie_enabled          BOOLEAN,
  do_not_track            TEXT,                   -- '1', '0', null (not set)

  -- ── Page performance (Navigation Timing API) ────────────────
  performance_load_ms     INTEGER,                -- full page load time
  performance_ttfb_ms     INTEGER,                -- Time to First Byte
  performance_dcl_ms      INTEGER,                -- DOMContentLoaded time

  -- ── Raw context ─────────────────────────────────────────────
  user_agent              TEXT,
  referrer                TEXT
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_te_session     ON telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_te_event_type  ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_te_created_at  ON telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_te_page_path   ON telemetry_events(page_path);
CREATE INDEX IF NOT EXISTS idx_te_country     ON telemetry_events(country);
CREATE INDEX IF NOT EXISTS idx_te_device_type ON telemetry_events(device_type);
CREATE INDEX IF NOT EXISTS idx_te_event_data  ON telemetry_events USING gin(event_data);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: subscribers
-- Stores newsletter email subscriptions.
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscribers (
  id                  BIGSERIAL PRIMARY KEY,
  email               TEXT        NOT NULL UNIQUE,
  subscribed_at       TIMESTAMPTZ DEFAULT NOW(),
  source_path         TEXT,                       -- page where they signed up
  ip_hash             TEXT,
  country             TEXT,
  verified            BOOLEAN     DEFAULT FALSE,
  unsubscribed_at     TIMESTAMPTZ,
  unsubscribed        BOOLEAN     DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sub_email ON subscribers(email);


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — Restrict DB access
-- 
-- IMPORTANT: Enable RLS and use a write-only role for the
-- public NEXT_PUBLIC_ connection. This prevents reads of 
-- sensitive data even if the URL is exposed.
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on both tables
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers      ENABLE ROW LEVEL SECURITY;

-- Create write-only policy: anyone can INSERT, nobody can SELECT/UPDATE/DELETE
-- (unless they are the table owner / superuser)
DROP POLICY IF EXISTS allow_insert_telemetry ON telemetry_events;
CREATE POLICY allow_insert_telemetry
  ON telemetry_events
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS allow_insert_subscribers ON subscribers;
CREATE POLICY allow_insert_subscribers
  ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Block SELECT for anonymous connections
DROP POLICY IF EXISTS deny_select_telemetry ON telemetry_events;
CREATE POLICY deny_select_telemetry
  ON telemetry_events
  FOR SELECT
  USING (false);

DROP POLICY IF EXISTS deny_select_subscribers ON subscribers;
CREATE POLICY deny_select_subscribers
  ON subscribers
  FOR SELECT
  USING (false);


-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Add new columns if upgrading from v1/v2 schema
-- Safe to run on existing tables — uses IF NOT EXISTS pattern.
-- ═══════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Timing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='dwell_seconds') THEN
    ALTER TABLE telemetry_events ADD COLUMN dwell_seconds INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='max_scroll_depth_pct') THEN
    ALTER TABLE telemetry_events ADD COLUMN max_scroll_depth_pct SMALLINT;
  END IF;
  -- Hardware
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='physical_screen_width') THEN
    ALTER TABLE telemetry_events ADD COLUMN physical_screen_width SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='physical_screen_height') THEN
    ALTER TABLE telemetry_events ADD COLUMN physical_screen_height SMALLINT;
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
  -- Category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='event_category') THEN
    ALTER TABLE telemetry_events ADD COLUMN event_category TEXT;
  END IF;
  -- Additional geo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='country_code') THEN
    ALTER TABLE telemetry_events ADD COLUMN country_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='latitude') THEN
    ALTER TABLE telemetry_events ADD COLUMN latitude NUMERIC(9,6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='longitude') THEN
    ALTER TABLE telemetry_events ADD COLUMN longitude NUMERIC(9,6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='org') THEN
    ALTER TABLE telemetry_events ADD COLUMN org TEXT;
  END IF;
  -- Device details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_vendor') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_vendor TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='device_model') THEN
    ALTER TABLE telemetry_events ADD COLUMN device_model TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='engine') THEN
    ALTER TABLE telemetry_events ADD COLUMN engine TEXT;
  END IF;
  -- Screen avail
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_avail_width') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_avail_width SMALLINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_events' AND column_name='screen_avail_height') THEN
    ALTER TABLE telemetry_events ADD COLUMN screen_avail_height SMALLINT;
  END IF;
END $$;
