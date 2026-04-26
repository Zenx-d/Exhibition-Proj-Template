const fs = require('fs');
const path = require('path');

const configData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/config.json'), 'utf8'));
const DOMAIN = configData.siteUrl;
const DATA_DIR = path.join(__dirname, '../data');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Static routes
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
const staticRoutes = [
  '',
  '/members',
  '/projects',
  '/privacy',
  '/terms',
];

function generateSitemap() {
  console.log('🚀 Generating sitemap.xml...');

  const membersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'members.json'), 'utf8'));
  const projectsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf8'));

  const memberRoutes = membersData.members
    .filter(m => m.state === 'active')
    .map(m => `/members/${m.id}`);

  const projectRoutes = projectsData.projects
    .map(p => `/projects/${p.id}`);

  const allRoutes = [...staticRoutes, ...memberRoutes, ...projectRoutes];
  const date = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${DOMAIN}${route}${route.endsWith('/') ? '' : '/'}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : route.split('/').length > 2 ? '0.6' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log(`✅ Sitemap generated with ${allRoutes.length} URLs!`);
}

generateSitemap();
