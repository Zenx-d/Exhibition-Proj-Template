# 🚀 Deployment Guide

The Zen Exhibition Platform is optimized for modern cloud providers like **Vercel**, but can be deployed anywhere that supports Next.js or static hosting.

## 🌩 Recommended: Vercel Deployment

Vercel is the native home of Next.js and provides the best support for this platform's features (Server Actions, Rate Limiting, etc.).

1. **Connect Repository**: Connect your GitHub/GitLab repo to Vercel.
2. **Environment Variables**: Add the following in the Vercel Dashboard:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `NEXT_PUBLIC_DATABASE_URL`: Same as above (for client-side telemetry).
   - `NEXT_PUBLIC_POSTHOG_KEY`: (Optional) Your PostHog project key.
3. **Build Settings**: The defaults will work (`npm run build`).

## 📦 Static Export (GitHub Pages / Netlify)

If you prefer a 100% static site without a server:

1. **Update Config**: In `next.config.mjs`, add `output: 'export'`.
2. **Database Limitation**: Telemetry logged via Server Actions will **not** work in a static export. You must rely purely on **PostHog** for tracking.
3. **Build**:
   ```bash
   npm run build
   ```
4. **Deploy**: Upload the `out/` folder to your provider.

## 🗄 Database Setup (Neon)

Before deploying, ensure your database is ready:

1. **Create Project**: Sign up at [neon.tech](https://neon.tech).
2. **Run Schema**: Open the SQL Console in Neon and paste the contents of `scripts/setup_db.sql`.
3. **Enable RLS**: If you are using the `NEXT_PUBLIC_DATABASE_URL` in the client, you **must** enable Row-Level Security on your tables to prevent unauthorized access.
   ```sql
   ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Public Insert" ON telemetry_logs FOR INSERT WITH CHECK (true);
   ```

## 📈 Analytics Setup (PostHog)

1. Create a project at [posthog.com](https://posthog.com).
2. Copy your Project API Key to `NEXT_PUBLIC_POSTHOG_KEY`.
3. Enable "Autocapture" in the PostHog settings to start seeing data immediately.
