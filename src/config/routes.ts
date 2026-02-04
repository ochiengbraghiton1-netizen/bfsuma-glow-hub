/**
 * Centralized route configuration for the application.
 * This is the single source of truth for all routes and their SEO metadata.
 * Used for navigation, sitemap generation, and SEO optimization.
 */

export interface RouteConfig {
  path: string;
  /** Whether to include in sitemap (public pages only) */
  includeInSitemap: boolean;
  /** Change frequency for search engines */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Priority for search engines (0.0 to 1.0) */
  priority?: number;
  /** Page title for SEO */
  title?: string;
  /** Meta description for SEO */
  description?: string;
}

/**
 * All application routes with their configuration.
 * Add new routes here and they will automatically be included in the sitemap.
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    includeInSitemap: true,
    changefreq: 'weekly',
    priority: 1.0,
    title: 'BF SUMA ROYAL - Premium Health & Wellness Products',
    description: 'Discover premium health and wellness products from BF SUMA ROYAL. Quality supplements, skincare, and natural health solutions.',
  },
  {
    path: '/about',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.8,
    title: 'About Us - BF SUMA ROYAL',
    description: 'Learn about BF SUMA ROYAL, our mission, values, and commitment to providing premium health and wellness products.',
  },
  {
    path: '/join-business',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Join Our Business - BF SUMA ROYAL',
    description: 'Start your journey to financial freedom with BF SUMA ROYAL networking business opportunity.',
  },
  {
    path: '/checkout',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.6,
    title: 'Checkout - BF SUMA ROYAL',
    description: 'Complete your order for premium BF SUMA ROYAL health and wellness products.',
  },
  {
    path: '/auth',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.5,
    title: 'Sign In - BF SUMA ROYAL',
    description: 'Sign in to your BF SUMA ROYAL account to manage orders and access exclusive features.',
  },
  {
    path: '/forgot-password',
    includeInSitemap: false,
    title: 'Forgot Password - BF SUMA ROYAL',
  },
  {
    path: '/reset-password',
    includeInSitemap: false,
    title: 'Reset Password - BF SUMA ROYAL',
  },
  {
    path: '/affiliate',
    includeInSitemap: false,
    title: 'Affiliate Dashboard - BF SUMA ROYAL',
  },
  {
    path: '/admin',
    includeInSitemap: false,
    title: 'Admin Dashboard - BF SUMA ROYAL',
  },
];

/**
 * Get routes that should be included in the sitemap
 */
export const getSitemapRoutes = (): RouteConfig[] => {
  return routes.filter((route) => route.includeInSitemap);
};

/**
 * Get route config by path
 */
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

/**
 * Base URL for the published site
 */
export const SITE_BASE_URL = 'https://bfsumaroyal.com';

/**
 * Edge function URL for dynamic sitemap
 */
export const SITEMAP_EDGE_FUNCTION_URL = 'https://sboaeutgckyiwunfmxqp.supabase.co/functions/v1/sitemap';
