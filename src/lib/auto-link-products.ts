/**
 * Auto-links product names AND keywords in HTML blog content.
 * - Links up to MAX_LINKS_PER_POST total product mentions
 * - Max MAX_LINKS_PER_PRODUCT links per individual product
 * - First mention gets a "View Product →" badge
 * - Skips text already inside <a> tags
 * - Case-insensitive matching
 */

export interface ProductLinkInfo {
  name: string;
  slug: string;
  keywords?: string[];
}

const MAX_LINKS_PER_POST = 5;
const MAX_LINKS_PER_PRODUCT = 2;

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
 * Split HTML into segments: tags (inside < >) and text nodes.
 * We only want to match/replace within text nodes, not inside HTML tags.
 */
function splitHtml(html: string): { text: string; isTag: boolean }[] {
  const parts: { text: string; isTag: boolean }[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) {
        parts.push({ text: html.slice(i), isTag: false });
        break;
      }
      parts.push({ text: html.slice(i, end + 1), isTag: true });
      i = end + 1;
    } else {
      const next = html.indexOf('<', i);
      if (next === -1) {
        parts.push({ text: html.slice(i), isTag: false });
        break;
      }
      parts.push({ text: html.slice(i, next), isTag: false });
      i = next;
    }
  }
  return parts;
}

/**
 * Process HTML content to auto-link product name and keyword mentions.
 */
export function autoLinkProducts(
  html: string,
  products: ProductLinkInfo[]
): string {
  if (!html || products.length === 0) return html;

  // Build a list of all match terms → product info
  interface MatchRule {
    pattern: RegExp;
    product: ProductLinkInfo;
    term: string;
  }

  const rules: MatchRule[] = [];

  for (const product of products) {
    // Add product name as a match term
    const nameEscaped = product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rules.push({
      pattern: new RegExp(`\\b${nameEscaped}\\b`, 'i'),
      product,
      term: product.name,
    });

    // Add keywords
    if (product.keywords) {
      for (const kw of product.keywords) {
        if (!kw.trim()) continue;
        const kwEscaped = kw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        rules.push({
          pattern: new RegExp(`\\b${kwEscaped}\\b`, 'i'),
          product,
          term: kw.trim(),
        });
      }
    }
  }

  // Sort by term length descending so longer phrases match first
  rules.sort((a, b) => b.term.length - a.term.length);

  // Track link counts
  let totalLinks = 0;
  const linksPerProduct = new Map<string, number>();
  const linkedTerms = new Set<string>(); // track which terms already linked (first occurrence only)
  const firstLinkedProducts = new Set<string>(); // track first-time badge

  // Parse HTML into tag/text segments and track anchor depth
  const parts = splitHtml(html);
  let insideAnchor = 0;

  const resultParts = parts.map((part) => {
    if (part.isTag) {
      const lower = part.text.toLowerCase();
      if (lower.startsWith('<a ') || lower === '<a>') insideAnchor++;
      if (lower === '</a>') insideAnchor = Math.max(0, insideAnchor - 1);
      return part.text;
    }

    // Skip if inside an anchor tag
    if (insideAnchor > 0) return part.text;

    let text = part.text;

    for (const rule of rules) {
      if (totalLinks >= MAX_LINKS_PER_POST) break;

      const productId = rule.product.name;
      const currentCount = linksPerProduct.get(productId) || 0;
      if (currentCount >= MAX_LINKS_PER_PRODUCT) continue;

      // Only link first occurrence of each term
      const termKey = rule.term.toLowerCase();
      if (linkedTerms.has(termKey)) continue;

      const match = text.match(rule.pattern);
      if (!match) continue;

      linkedTerms.add(termKey);

      const slug = rule.product.slug || nameToSlug(rule.product.name);
      const href = `/product/${slug}`;

      const isFirstForProduct = !firstLinkedProducts.has(productId);
      const badge = isFirstForProduct
        ? `<span style="font-size:10px;margin-left:3px;color:hsl(var(--accent));font-weight:500;white-space:nowrap;">View Product →</span>`
        : '';

      if (isFirstForProduct) firstLinkedProducts.add(productId);

      const replacement = `<a href="${href}" class="product-autolink" style="color:hsl(var(--primary));text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s;" onmouseover="this.style.borderBottomColor='hsl(var(--primary))'" onmouseout="this.style.borderBottomColor='transparent'">${match[0]}${badge}</a>`;

      // Replace only first occurrence in this text segment
      text = text.slice(0, match.index!) + replacement + text.slice(match.index! + match[0].length);

      totalLinks++;
      linksPerProduct.set(productId, currentCount + 1);
    }

    return text;
  });

  return resultParts.join('');
}
