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
    title: 'BF SUMA Royal Kenya | Natural Health Supplements & Business',
    description: 'Discover natural health supplements in Kenya. Boost energy, balance hormones, and improve wellness. Shop now at BF SUMA Royal.',
  },
  {
    path: '/about',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.8,
    title: 'About BF SUMA Royal Kenya | Our Journey Since 2006',
    description: "Discover BF SUMA Royal's journey from Los Angeles (2006) to a global wellness brand in 15+ countries. GMP, ISO, and Halal certified supplements.",
  },
  {
    path: '/join-business',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.8,
    title: 'Join BF SUMA Royal Business Kenya | Earn with Wellness',
    description: 'Start your BF SUMA Royal distributor business in Kenya for KES 7,000. Earn commissions selling natural supplements. Register today!',
  },
  {
    path: '/checkout',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.6,
    title: 'Checkout | BF SUMA Royal Kenya',
    description: 'Complete your BF SUMA Royal order securely. Pay via M-Pesa, PayPal, or WhatsApp. Fast delivery across Kenya with order tracking.',
  },
  {
    path: '/auth',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.5,
    title: 'Sign In | BF SUMA Royal Kenya',
    description: 'Sign in or create your BF SUMA Royal account. Manage orders, track deliveries, and access exclusive distributor tools in Kenya.',
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
  {
    path: '/blog',
    includeInSitemap: true,
    changefreq: 'daily',
    priority: 0.9,
    title: 'Health & Wellness Blog | BF SUMA Royal Kenya',
    description: 'Read expert health tips, supplement guides, and wellness advice from BF SUMA Royal Kenya. Stay informed and shop natural products.',
  },
  {
    path: '/contact',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.7,
    title: 'Contact BF SUMA Royal | Orders & Support Kenya',
    description: 'Reach BF SUMA Royal Kenya via WhatsApp, email, or visit us in Kakamega. Get fast support for orders, products, and business inquiries.',
  },
  {
    path: '/faq',
    includeInSitemap: true,
    changefreq: 'monthly',
    priority: 0.7,
    title: 'FAQ | BF SUMA Royal Kenya - Common Questions',
    description: 'Get answers about BF SUMA Royal supplements, distributor program, and business opportunity in Kenya. Start your wellness journey today.',
  },
  {
    path: '/community',
    includeInSitemap: true,
    changefreq: 'daily',
    priority: 0.7,
    title: 'Community | BF SUMA Royal Kenya Stories',
    description: 'Real testimonials and success stories from BF SUMA Royal users in Kenya. See how our supplements transform health and build businesses.',
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
