/**
 * Sitemap Generator Script
 * 
 * This script generates a sitemap.xml file from the centralized routes configuration.
 * Run this script during the build process to ensure the sitemap is always up to date.
 * 
 * Usage: npx tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Import routes configuration
// Note: We duplicate the config here to avoid TypeScript path issues in scripts
interface RouteConfig {
  path: string;
  includeInSitemap: boolean;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const SITE_BASE_URL = 'https://bfsuma-glow-hub.lovable.app';

const routes: RouteConfig[] = [
  { path: '/', includeInSitemap: true, changefreq: 'weekly', priority: 1.0 },
  { path: '/about', includeInSitemap: true, changefreq: 'monthly', priority: 0.8 },
  { path: '/join-business', includeInSitemap: true, changefreq: 'monthly', priority: 0.8 },
  { path: '/checkout', includeInSitemap: true, changefreq: 'monthly', priority: 0.6 },
  { path: '/auth', includeInSitemap: true, changefreq: 'monthly', priority: 0.5 },
];

function generateSitemap(): string {
  const sitemapRoutes = routes.filter((route) => route.includeInSitemap);
  
  const urlEntries = sitemapRoutes
    .map((route) => {
      const loc = `${SITE_BASE_URL}${route.path === '/' ? '' : route.path}`;
      const changefreq = route.changefreq || 'monthly';
      const priority = route.priority ?? 0.5;
      
      return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = resolve(process.cwd(), 'public/sitemap.xml');

writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`✅ Sitemap generated at ${outputPath}`);
console.log(`📝 Included ${routes.filter(r => r.includeInSitemap).length} routes`);
