/**
 * Dynamic Sitemap Generation Utilities
 * 
 * These utilities generate sitemap XML from the centralized routes configuration.
 * Can be used by an edge function for dynamic sitemap generation or
 * imported to generate a static sitemap at build time.
 */

import { getSitemapRoutes, SITE_BASE_URL, type RouteConfig } from '@/config/routes';

/**
 * Generate XML sitemap string from route configuration
 */
export function generateSitemapXML(baseUrl: string = SITE_BASE_URL): string {
  const routes = getSitemapRoutes();
  
  const urlEntries = routes
    .map((route) => {
      const loc = `${baseUrl}${route.path === '/' ? '' : route.path}`;
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

/**
 * Generate a sitemap index if you have multiple sitemaps
 */
export function generateSitemapIndex(sitemapUrls: string[], baseUrl: string = SITE_BASE_URL): string {
  const lastmod = new Date().toISOString().split('T')[0];
  
  const sitemapEntries = sitemapUrls
    .map((url) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Add dynamic routes to sitemap (e.g., product pages, blog posts)
 * Call this with data fetched from the database
 */
export function generateDynamicUrls(
  items: Array<{ slug: string; updatedAt?: string }>,
  pathPrefix: string,
  baseUrl: string = SITE_BASE_URL,
  options: { changefreq?: RouteConfig['changefreq']; priority?: number } = {}
): string {
  const { changefreq = 'weekly', priority = 0.6 } = options;
  
  return items
    .map((item) => {
      const loc = `${baseUrl}${pathPrefix}/${item.slug}`;
      const lastmod = item.updatedAt ? `\n    <lastmod>${item.updatedAt.split('T')[0]}</lastmod>` : '';
      
      return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');
}
