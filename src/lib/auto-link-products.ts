/**
 * Auto-links product names in HTML blog content.
 * - Links up to MAX_LINKS product mentions
 * - First mention gets a "View Product →" badge
 * - Skips text already inside <a> tags
 */

export interface ProductLinkInfo {
  name: string;
  slug: string;
}

const MAX_LINKS = 5;

/**
 * Creates a slug from a product name for linking to /p/:slug
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Process HTML content to auto-link product name mentions.
 * Products can be passed in or will use a default empty array.
 */
export function autoLinkProducts(
  html: string,
  products: ProductLinkInfo[]
): string {
  if (!html || products.length === 0) return html;

  let linkCount = 0;
  const linkedProducts = new Set<string>();

  // Sort products by name length descending to match longer names first
  const sorted = [...products].sort((a, b) => b.name.length - a.name.length);

  let result = html;

  for (const product of sorted) {
    if (linkCount >= MAX_LINKS) break;

    // Escape special regex characters in product name
    const escaped = product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match product name not already inside an <a> tag
    // We use a negative lookbehind for > and a word boundary approach
    const regex = new RegExp(
      `(?<!["/\\w-])\\b(${escaped})\\b(?![^<]*<\\/a>)`,
      'gi'
    );

    let isFirstMention = !linkedProducts.has(product.name);

    result = result.replace(regex, (match) => {
      if (linkCount >= MAX_LINKS) return match;

      // Check if we're inside an existing <a> tag by counting open/close tags
      // This is a simplified check - for the position of this match in the result
      const beforeMatch = result.substring(0, result.indexOf(match));
      const openTags = (beforeMatch.match(/<a[\s>]/gi) || []).length;
      const closeTags = (beforeMatch.match(/<\/a>/gi) || []).length;
      if (openTags > closeTags) return match;

      linkCount++;
      const slug = product.slug || nameToSlug(product.name);
      const href = `/p/${slug}`;

      const badge = isFirstMention
        ? `<span style="font-size:10px;margin-left:3px;color:hsl(var(--accent));font-weight:500;white-space:nowrap;">View Product →</span>`
        : '';

      isFirstMention = false;
      linkedProducts.add(product.name);

      return `<a href="${href}" class="product-autolink" style="color:hsl(var(--primary));text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s;" onmouseover="this.style.borderBottomColor='hsl(var(--primary))'" onmouseout="this.style.borderBottomColor='transparent'">${match}${badge}</a>`;
    });
  }

  return result;
}
