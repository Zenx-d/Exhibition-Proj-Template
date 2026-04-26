# 🚀 Zen Exhibition - Full Contributor & Admin Guide

This guide contains everything you need to know to maintain, scale, and secure the Zen Exhibition platform.

---

## 👥 Managing Members

Members are autonomous content blocks stored in `data/members/`.

### 1. Structure
Each member must have their own folder named after their `id`:
```
data/members/
  └── john-doe/
      ├── john-doe.json  (Configuration)
      └── john-doe.md    (Long-form story)
```

### 2. Configuration (`.json`)
```json
{
  "id": "john-doe",
  "name": "John Doe",
  "contribution": "Lead Designer",
  "state": "active",
  "avatar": "/content/images/avatars/john.png",
  "github": "https://github.com/johndoe",
  "shortBio": "Short summary for the index page.",
  "order": 1
}
```

### 3. Registry
You **MUST** add the member ID to `data/members.json` to make them appear on the site.

---

## 🛠 Managing Projects

Projects are defined in a central JSON file but have individual Markdown blueprints.

1. **Blueprint**: Create `content/projects/project-id.md`.
2. **Metadata**: Add an entry to the `projects` array in `data/projects.json`.
   - `members`: An array of member IDs who worked on it.
   - `featured`: Set to `true` to show it on the home page (if applicable).

---

## 🔐 Security & Database Setup (Neon)

The site uses **Neon Database** for telemetry. Because this is a static export, we use **Row-Level Security (RLS)** to keep the database secure even though the connection URL is in the client bundle.

### 1. Database Creation
Go to your Neon console and run the contents of `scripts/schema.sql`. This will:
- Create the `telemetry_events` table with 50+ tracking columns.
- Create the `subscribers` table for newsletters.
- **CRITICAL**: Apply RLS policies that allow **INSERT ONLY** for the public connection.

### 2. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_DATABASE_URL=your_neon_connection_string
```

---

## 📊 Analytics & Telemetry

We track high-fidelity data while respecting privacy:
- **Dwell Time**: How long users stay on each page.
- **Scroll Depth**: How much of the content is actually read.
- **Hardware**: CPU cores, RAM (approx), and screen fidelity.
- **Network**: Connection speed and data-saver status.
- **Interactions**: Outbound link clicks and CTA usage.

**Privacy Note**: All IP addresses and search queries are SHA-256 hashed before hitting the database.

---

## 🚀 Deployment

The site is optimized for **Vercel** but can be hosted anywhere as a static site.

### Build Command
```bash
npm run build
```
This generates the `out/` folder.

### Vercel Integration
1. Connect your GitHub repo.
2. Set the `NEXT_PUBLIC_DATABASE_URL` in the Vercel dashboard.
3. The build will automatically handle `@vercel/analytics` and `@vercel/speed-insights`.

---

## 🎮 Adding Interactive Content (Zen Widgets)

The Exhibition Template uses a specialized **Zen Widget Mechanic**. Instead of writing complex JavaScript directly in Markdown, you create localized widgets in the `public/` directory.

### How to add a Widget:
1.  **Create a Folder**: `/public/content/widgets/[category]/[name]/`
2.  **Add index.html**: Build your game, API fetcher, or 3D scene.
3.  **Embed in Markdown**:
    ```html
    <div data-zen-widget="games/snake" data-height="450"></div>
    ```

### Available Categories:
- `games/`: High-performance canvas games.
- `api/`: Real-time data integrations.
- `visuals/`: Charts, 3D, and animations.
- `utils/`: Clocks, countdowns, and tools.

See [docs/zen-widgets.md](/docs/zen-widgets.md) for full technical documentation and the Starter Kit.

---

## 🎨 UI Best Practices

- **Typography**: Use `Outfit` for impact headings and `Inter` for legibility.
- **Spacing**: Stick to the `[2.5rem]` border-radius for main containers.
- **Mobile**: Always test the "Bottom Sheet" navigation on mobile devices.
- **Icons**: Use `Lucide-React` for UI and `BrandIcons.js` for social logos.
