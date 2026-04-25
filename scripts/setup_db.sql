-- TELEMETRY EVENTS TABLE
CREATE TABLE IF NOT EXISTS telemetry_events (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  event_type TEXT,
  event_data JSONB,
  page_path TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  user_agent TEXT,
  referrer TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_session_id ON telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON telemetry_events(created_at);

-- SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
