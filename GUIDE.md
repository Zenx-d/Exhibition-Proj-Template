# 🚀 Zen Exhibition - Contributor Guide

Welcome to the Zen Exhibition Platform. This guide explains how to add new members, projects, and manage content.

---

## 👥 Adding a New Member

Members are stored in individual folders under `data/members/`.

1. **Create Folder**: Create a new folder in `data/members/` with a unique ID (e.g., `john-doe`).
2. **Configuration**: Create a `john-doe.json` file inside that folder.
   ```json
   {
     "id": "john-doe",
     "name": "John Doe",
     "contribution": "Full Stack Developer",
     "state": "active",
     "avatar": "/content/images/avatars/john.png",
     "github": "https://github.com/johndoe",
     "shortBio": "Building the future of the web.",
     "order": 10
   }
   ```
3. **Markdown Profile**: Create a `john-doe.md` file in the same folder for the long-form profile story.
4. **Register**: Add the ID to the `members` array in `data/members.json`.

---

## 🛠 Adding a New Project

Projects are managed via `data/projects.json` and markdown files in `content/projects/`.

1. **Create Markdown**: Create `content/projects/your-project-id.md` with the project details.
2. **Update JSON**: Add an entry to `data/projects.json`:
   ```json
   {
     "id": "your-project-id",
     "title": "Project Name",
     "shortDescription": "A brief summary...",
     "members": ["member-id-1", "member-id-2"],
     "techStack": ["Next.js", "Tailwind"],
     "year": 2026,
     "thumbnail": "/content/images/projects/thumb.png",
     "featured": true
   }
   ```

---

## 📊 Telemetry & Analytics

This platform uses **Neon Database** for private telemetry. 
- **Setup**: Ensure `NEXT_PUBLIC_DATABASE_URL` is set in your environment.
- **Events**: Page views, member clicks, and searches are automatically tracked if the user accepts the privacy banner.
- **Privacy**: IP addresses and search queries are SHA-256 hashed before being sent to the database.

---

## 🎨 Design System

We use a high-impact "Big & Bold" design system:
- **Fonts**: `Outfit` (Headings) & `Inter` (Body).
- **Colors**: Slate-based dark mode with Indigo/Purple accents.
- **Components**: Use `SmartLink` instead of `Link` for instant loading feedback.

---

## 📦 Building for Production

To generate the static export:
```bash
npm run build
```
The output will be in the `out/` directory.
