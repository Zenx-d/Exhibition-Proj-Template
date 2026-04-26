# 🚀 Zen Exhibition Platform - Overview

## 🏁 Project Philosophy
The Zen Exhibition Platform is built for the **2026 Annual Technical Exhibition**. It aims to move away from static, boring portfolio sites and towards a high-fidelity, interactive "Exhibition Hall" experience.

Our core values:
1. **Premium Aesthetic**: No plain red/blue/green. We use curated HSL palettes, glassmorphism, and bold typography.
2. **Content Autonomy**: Members should be able to update their own folders without touching the core application code.
3. **Data-Driven Insight**: We don't just show projects; we track how users interact with them.

## 🏗 System Architecture

### Frontend (Next.js 15)
- **App Router**: Leveraging React Server Components for maximum performance.
- **Client Components**: Used sparingly for interactive elements like filters, sliders, and telemetry tracking.
- **Framer Motion**: Powering all transitions and micro-animations.

### Content (Data-as-Code)
- **JSON Registry**: `data/members.json` and `data/projects.json` act as the database for the site structure.
- **Markdown Blueprints**: Project documentation and member bios are stored as `.md` files, allowing for rich formatting and embedded scripts.

### Backend (Telemetry & Storage)
- **Neon DB**: A serverless Postgres database for logging engagement data.
- **PostHog**: A full-suite analytics platform for behavior analysis.
- **Rate Limiting**: Custom server-side logic to prevent database spam.

## 📁 Key Directories

- `app/`: Next.js pages and layouts.
- `components/`: Reusable UI components.
- `content/`: Project-specific markdown documentation.
- `data/`: The "Source of Truth" for all site content.
- `docs/`: Technical and user documentation.
- `lib/`: Server-only utilities (DB, Rate Limit).
- `utils/`: Client/Server shared utilities.
