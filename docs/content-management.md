# ✍️ Content Management Guide

The Zen Exhibition Platform is designed for **Zero-Code** content management. All site content is driven by JSON data and Markdown blueprints.

## 👥 Managing Members

Members are stored in a hierarchical structure for clean organization.

### 1. File Structure
Each member must have a dedicated folder in `data/members/` named after their unique ID:
```
data/members/
  └── my-unique-id/
      ├── my-unique-id.json  (Metadata)
      └── my-unique-id.md    (Biography)
```

### 2. Member Metadata (`.json`)
```json
{
  "id": "my-unique-id",
  "name": "Full Name",
  "contribution": "Their role/contribution",
  "state": "active",
  "avatar": "/content/images/avatars/profile.png",
  "github": "https://github.com/username",
  "shortBio": "A one-sentence summary for the card view.",
  "order": 1
}
```

### 3. Member Bio (`.md`)
The markdown file supports full HTML embedding and custom JavaScript for interactive stories.

### 4. Activation
To make a member appear on the site, you **must** add their ID to the `members` array in `data/members.json`.

---

## 🛠 Managing Projects

Projects represent the core output of the exhibition.

### 1. Registration
Add your project to the `projects` array in `data/projects.json`:
```json
{
  "id": "project-alpha",
  "title": "Project Alpha",
  "description": "High-level summary.",
  "category": "Software",
  "tags": ["React", "AI"],
  "members": ["member-id-1", "member-id-2"],
  "featured": true
}
```

### 2. Blueprints (`content/projects/`)
Create a file named `project-alpha.md` in `content/projects/`. This file serves as the full documentation page for the project.

---

## ⚙️ Global Configuration

Site titles, hero sections, and navigation are managed in `data/config.json`.

### Navbar Configuration
You can add or remove links from the main navigation by editing the `navbar.items` array. Use internal paths (e.g., `/projects`) or external URLs.

### Contact Information
Update the `contact` object to change the email and location displayed in the footer.
