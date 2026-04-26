# 🧩 Zen Widget Engine - Technical Guide

The Zen Widget Engine is a high-performance, sandboxed environment for embedding complex interactive content (Games, APIs, 3D) within Markdown files without triggering hydration errors or script collisions.

## 🏗 Architecture
- **Host**: Next.js Markdown Renderer
- **Guest**: Isolated `iframe` in `public/content/widgets/`
- **Isolation**: Sandboxed with `allow-scripts allow-same-origin`

## 📂 Directory Structure
Widgets must be organized systematically in the `public/` directory:
```
public/content/widgets/
  ├── games/
  │   └── snake/
  │       └── index.html
  ├── api/
  │   └── weather/
  │       └── index.html
  └── visuals/
      └── 3d-cube/
          └── index.html
```

## 🚀 Standard Syntax
Embed any widget in your `.md` files using this "Goated" format:
```html
<div data-zen-widget="category/widget-name" data-height="450"></div>
```
- `data-zen-widget`: The path relative to `public/content/widgets/` (without index.html).
- `data-height`: Explicit height in pixels (defaults to 400).

## 🛠 Starter Kit Boilerplate
Copy this code to `index.html` in your new widget folder to get started instantly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zen Widget</title>
    <style>
        /* Widgets should have transparent backgrounds by default */
        body { 
            margin: 0; 
            padding: 20px; 
            background: transparent; 
            overflow: hidden; 
            font-family: system-ui, -apple-system, sans-serif;
            color: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .widget-container {
            width: 100%;
            height: 100%;
            background: #0f172a;
            border-radius: 24px;
            border: 2px solid #1e293b;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <h1>New Widget</h1>
        <p>Your logic goes here.</p>
    </div>
    <script>
        console.log("Zen Widget Ready.");
    </script>
</body>
</html>
```

## 🔐 Security & CSP
The engine uses a strict **Content Security Policy**. If your widget needs to connect to a new external API or load a script from a new CDN, you **must** add the domain to `next.config.mjs` under `Content-Security-Policy`.

## 💎 Pro-Tips
1. **Responsiveness**: Use `vh` and `vw` or Flexbox to ensure your widget fills the iframe correctly.
2. **Lazy Loading**: Widgets only load when they enter the viewport, saving user bandwidth.
3. **Data Persistance**: Use `localStorage` inside the widget to save game scores or user settings locally.
