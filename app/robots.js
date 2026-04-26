import configData from '../data/config.json';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${configData.siteUrl}/sitemap.xml`,
  };
}
