# 🚀 Zen Exhibition Platform 2026

Welcome to the **Zen Exhibition Platform** – an elite, high-fidelity Next.js 15 showcase designed for modern technical exhibitions.

## 🎨 Design Philosophy
The platform utilizes an **expansive, high-contrast aesthetic** designed to look premium on both standard laptops and large-format monitors.
- **Elite Typography:** Bold, tracking-tighter headers for maximum impact.
- **Dynamic Sizing:** A "Golden Ratio" layout (1440px-1600px) that balances density and breathability.
- **Glassmorphism:** Smooth, translucent surfaces with reactive hover effects and animations.

---

## 🛠️ Content Architecture
Everything is managed via **JSON** and **Markdown**, allowing for zero-code updates.

### 1. Global Config (`data/config.json`)
Manage site-wide titles, hero text, and exhibition-wide stats (Projects, Members, Costs).

### 2. Members (`data/members.json` & `data/members/`)
- Each member has a directory named after their ID (e.g., `zen-01`).
- Inside is a `zen-01.json` for metadata and a `zen-01.md` for their full biography.
- Control visibility by setting `state: "active"` or `"hidden"` in `data/members.json`.

### 3. Projects (`data/projects.json` & `content/projects/`)
- Projects are registered in `data/projects.json`.
- Link multiple members to a single project via their IDs.
- High-fidelity documentation is stored as `.md` files in `content/projects/`.

---

## ⚡ Dynamic Markdown Engine
Our Markdown engine supports **Embedded HTML**.
- **Secure by Default:** Inline `<script>` tags are disabled to prevent XSS vulnerabilities. Use `<iframe>` for custom interactive widgets.
- **Theme Awareness:** All markdown elements (code blocks, tables, blockquotes) automatically synchronize with the site's light/dark mode.
- **HTML Embedding:** Support for `<iframe>`, `<video>`, and custom `<div>` structures with automatic responsive scaling.

---

## 🚦 Troubleshooting

### "Module Not Found" Error
If you encounter a `MODULE_NOT_FOUND` or `Cannot find module './XXX.js'` error during development:
1. Stop the dev server (`Ctrl+C`).
2. Run `rm -rf .next` to clear the Next.js cache.
3. Restart with `npm run dev`.

### Styles Not Updating
We use **Tailwind v4** and **Next.js 15**. If styles seem out of sync:
1. Ensure the `globals.css` is correctly importing `@import "tailwindcss";`.
2. Clear your browser cache or try an Incognito window to bypass HMR artifacts.

---

## 🚀 Deployment
This platform is optimized for **Static Export**.
\`\`\`bash
npm run build
\`\`\`
The resulting `out/` directory can be deployed to any static hosting provider (GitHub Pages, Vercel, Netlify).

---

Developed with ⚡ for the 2026 Annual Exhibition.
