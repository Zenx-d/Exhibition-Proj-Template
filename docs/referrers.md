# 🔗 Referrer Tags Guide

The Zen Exhibition Platform includes a sophisticated tracking system for attributing traffic to specific users, platforms, or marketing campaigns.

## 🚀 How it Works
When a visitor arrives at the site with a supported URL parameter, the `TelemetryProvider` automatically captures the tag and source, storing them in a secure `sessionStorage` entry. This ensures that:
1. The referral is only counted **once per session**.
2. Attribution is maintained as the user navigates between pages.
3. Conversions (like newsletter signups) can be linked back to the original referrer.

## 🛠 Supported Parameters
The system scans for the following keys in the URL:
- `ref`: General referrer (e.g., `?ref=username`)
- `source`: Platform source (e.g., `?source=twitter`)
- `utm_source`: Standard marketing tag (e.g., `?utm_source=email`)
- `via`: Attribution tag (e.g., `?via=blog`)
- `tag`: Generic tag (e.g., `?tag=spring_promo`)
- `referredby`: Legacy referral tag.

## 📈 Examples

### 1. User Referrals
If you want to track which community member brought in a visitor:
`https://zen-exhibition.com/?ref=zen-master-01`

### 2. Social Media Campaigns
Track traffic from specific platforms:
`https://zen-exhibition.com/?source=linkedin&utm_campaign=launch`

### 3. Cross-Site Linking
If you are linking from a partner site:
`https://zen-exhibition.com/?via=partner_name`

## 📊 Viewing the Data
Referral data is stored in two locations:
1. **PostHog**: Captured as a `referral_click` event with full properties.
2. **Neon DB**: Logged in the `referrals` table with the following schema:
   - `referrer_tag`: The value of the tag (e.g., `zen-master-01`).
   - `source`: The key used (e.g., `ref`).
   - `path`: The landing page path.
   - `metadata`: JSON object containing the full query string and timestamp.

## 🎯 Conversion Attribution
When a user subscribes to the newsletter, the system checks for an active referral tag in their session. If found, the `subscribers` table entry will record the source as `ref:tag on /path`, allowing you to see exactly which influencers or campaigns are driving actual growth.
