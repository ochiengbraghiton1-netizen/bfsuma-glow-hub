/**
 * Generate SEO-optimized alt text for product images.
 * Format: "[Product Name] - BF SUMA Royal supplement"
 * Ensures alt text is under 125 characters.
 */
export function generateProductAltText(
  productName: string,
  category?: string
): string {
  const base = category
    ? `${productName} - BF SUMA Royal ${category.toLowerCase()} supplement`
    : `${productName} - BF SUMA Royal supplement`;

  return base.length <= 125 ? base : `${productName} - BF SUMA Royal`.slice(0, 125);
}

/**
 * Generate SEO-optimized alt text for blog post images.
 * Format: "[Title] - BF SUMA Royal blog"
 */
export function generateBlogAltText(title: string): string {
  const base = `${title} - BF SUMA Royal blog`;
  return base.length <= 125 ? base : title.slice(0, 120);
}

/**
 * Generate an SEO-friendly file name slug from a product name.
 * e.g. "Detoxilive Pro Oil Capsules" → "detoxilive-pro-oil-capsules"
 */
export function generateImageSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
