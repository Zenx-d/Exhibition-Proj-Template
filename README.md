# 🚀 Zen Exhibition Platform

An elite, high-fidelity **Next.js 15** showcase platform designed for modern technical exhibitions, portfolio hosting, and project documentation. Built with a focus on premium aesthetics, zero-code content management, and robust telemetry.

![Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070)

## ✨ Key Features

- **💎 Premium Aesthetics**: High-contrast, glassmorphic design with reactive hover effects and fluid animations.
- **📄 Zero-Code Content**: Manage members, projects, and site configuration entirely via JSON and Markdown.
- **⚡ Dynamic Markdown Engine**: Support for embedded HTML and JavaScript within Markdown files for interactive project blueprints.
- **📊 Robust Telemetry**: Integrated PostHog tracking and Neon DB storage for dwell time, scroll depth, and interaction metrics.
- **🔗 Smart Referrer Tracking**: Advanced tracking for `ref`, `source`, and UTM parameters to analyze traffic origins.
- **📱 Responsive Excellence**: Perfectly optimized for everything from mobile devices to large-format 4K exhibition displays.
- **🛡️ Secure & Scalable**: Neon DB with Row-Level Security (RLS) ensures data integrity even in static exports.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Neon DB](https://neon.tech/) (Serverless Postgres)
- **Analytics**: [PostHog](https://posthog.com/)
- **Content**: Markdown (Remark/Rehype) & JSON

---

## 📖 Documentation

For detailed guides on how to use and extend the platform, check out the `docs/` folder:

- [**🚀 Project Overview**](./docs/overview.md) - Philosophy and architecture.
- [**✍️ Content Management**](./docs/content-management.md) - Managing members and projects.
- [**📊 Telemetry & Analytics**](./docs/telemetry.md) - How tracking and security work.
- [**🔗 Referrer Tags Guide**](./docs/referrers.md) - Attributing traffic and conversions.
- [**🚀 Deployment Guide**](./docs/deployment.md) - Hosting on Vercel or static providers.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- A Neon DB project
- A PostHog project (optional, but recommended)

### 2. Installation
```bash
git clone https://github.com/Zenx-d/Exhibition-Proj-Template.git
cd Exhibition-Proj-Template
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root:
```env
# Neon Database URL (Required for Telemetry)
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_DATABASE_URL=postgres://user:password@host/dbname?sslmode=require

# PostHog API Key (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### 4. Database Setup
Run the SQL script found in `scripts/setup_db.sql` in your Neon console to initialize the tables and RLS policies.

### 5. Start Developing
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 👥 Content Management

### Managing Members
Members are autonomous content blocks stored in `data/members/`.
1. **Directory**: Create a folder in `data/members/` named after the member's ID.
2. **Metadata**: Add a `.json` file (e.g., `john-doe.json`) for profile info.
3. **Bio**: Add a `.md` file for their long-form story.
4. **Registry**: Add the ID to `data/members.json`.

### Managing Projects
1. **Metadata**: Define projects in `data/projects.json`.
2. **Blueprints**: Create a `.md` file in `content/projects/` matching the project ID.
3. **Associations**: Link members to projects using their IDs in the `projects.json` file.

---

## 📊 Analytics & Referrer Tags

The platform automatically tracks visitors. You can use the following URL parameters to track referrals:
- `?ref=username`
- `?source=twitter`
- `?utm_source=newsletter`

All data is safely stored in **PostHog** and your **Neon DB** for deep analysis.

---

## 🏗️ Architecture

- **`components/`**: Atomic UI components and layout wrappers.
- **`lib/`**: Server-side logic, database connections, and rate limiting.
- **`utils/`**: Client-side helpers for telemetry and markdown parsing.
- **`data/`**: Central source of truth for site content and member registry.
- **`content/`**: Markdown-based blueprints for projects.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🌟 Acknowledgments

Developed with ⚡ for the **2026 Annual Exhibition**.

---

**GitHub Tags**: `nextjs`, `tailwindcss`, `markdown`, `exhibition-platform`, `telemetry`, `portfolio-template`, `neon-db`, `posthog`, `framer-motion`, `serverless`
