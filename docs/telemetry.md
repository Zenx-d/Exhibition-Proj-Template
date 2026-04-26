# 📊 Telemetry & Analytics Architecture

The Zen Exhibition Platform uses a dual-layer tracking system to provide high-fidelity analytics while maintaining privacy and reliability.

## 🏗 System Overview

### 1. Primary Layer: PostHog
[PostHog](https://posthog.com/) is our primary analytics engine. It handles:
- **Autocapture**: Clicks, inputs, and standard interactions.
- **Session Replay**: (Optional) Visual recording of user sessions.
- **Geography & Device**: Automatic resolution of country, OS, and browser.
- **Funnels**: Tracking conversion from landing to subscription.

### 2. Secondary Layer: Neon DB (Postgres)
We log critical events directly to a [Neon](https://neon.tech/) database for:
- **Persistent Data**: Owning our most critical data (referrals, subscriptions).
- **Custom Reporting**: Running complex SQL queries that standard analytics tools can't handle.
- **Reliability**: A fallback for when client-side trackers are blocked by ad-blockers.

## 🔍 Key Metrics Tracked

- **Dwell Time**: Measured in seconds per page to identify high-interest content.
- **Scroll Depth**: Tracking how much of a project blueprint a user actually reads.
- **Outbound Clicks**: Monitoring which external resources (GitHub, LinkedIn) users are visiting.
- **Performance**: Capturing DCL (DomContentLoaded) and Load times to ensure the site remains fast.

## 🛡 Privacy & Security

### Data Hashing
To respect user privacy:
- **Search Queries** are SHA-256 hashed before being sent to the database.
- **IP Addresses** are never stored in plain text; we use a salted hash to identify return visitors without storing PII.

### Database Security (RLS)
Since this platform is often deployed as a static export, we utilize **Row-Level Security (RLS)** in Postgres.
- The public connection string only has permission to **INSERT** records.
- **SELECT**, **UPDATE**, and **DELETE** operations are blocked for the public role, ensuring your telemetry data is "write-only" from the client side.

## 🛠 Troubleshooting
If telemetry isn't showing up in your database:
1. Verify `NEXT_PUBLIC_DATABASE_URL` is set in your environment.
2. Check the `telemetry_logs` table in the Neon console.
3. Ensure you have run the `scripts/setup_db.sql` initialization script.
