/**
 * Auto-links product names AND keywords in HTML content.
 *
 * Improvements (v2):
 *  - Links across the FULL page content — headings, paragraphs, list items, FAQ answers.
 *  - Allows up to MAX_LINKS_PER_PRODUCT occurrences per product (not just the first).
 *  - Global cap MAX_LINKS_PER_POST prevents over-linking.
 *  - First link for each product still gets a "View Product →" badge.
 *  - Never replaces text already inside an <a> tag.
 *  - Case-insensitive, whole-word matching.
 */

export interface ProductLinkInfo {
  name: string;
  slug: string;
  keywords?: string[];
}

const MAX_LINKS_PER_POST = 20;
const MAX_LINKS_PER_PRODUCT = 3;

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitHtml(html: string): { text: string; isTag: boolean }[] {
  const parts: { text: string; isTag: boolean }[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) { parts.push({ text: html.slice(i), isTag: false }); break; }
      parts.push({ text: html.slice(i, end + 1), isTag: true });
      i = end + 1;
    } else {
      const next = html.indexOf('<', i);
      if (next === -1) { parts.push({ text: html.slice(i), isTag: false }); break; }
      parts.push({ text: html.slice(i, next), isTag: false });
      i = next;
    }
  }
  return parts;
}

export function autoLinkProducts(html: string, products: ProductLinkInfo[]): string {
  if (!html || products.length === 0) return html;

  interface MatchRule { pattern: RegExp; product: ProductLinkInfo; term: string }
  const rules: MatchRule[] = [];
  for (const product of products) {
    const nameEsc = product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rules.push({ pattern: new RegExp(`\\b${nameEsc}\\b`, 'gi'), product, term: product.name });
    for (const kw of product.keywords || []) {
      const t = kw.trim();
      if (!t) continue;
      const kwEsc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      rules.push({ pattern: new RegExp(`\\b${kwEsc}\\b`, 'gi'), product, term: t });
    }
  }
  rules.sort((a, b) => b.term.length - a.term.length);

  let totalLinks = 0;
  const linksPerProduct = new Map<string, number>();
  const firstLinkedProducts = new Set<string>();

  const parts = splitHtml(html);
  let insideAnchor = 0;

  const out = parts.map((part) => {
    if (part.isTag) {
      const lower = part.text.toLowerCase();
      if (lower.startsWith('<a ') || lower === '<a>') insideAnchor++;
      else if (lower === '</a>') insideAnchor = Math.max(0, insideAnchor - 1);
      return part.text;
    }
    if (insideAnchor > 0) return part.text;

    let text = part.text;
    for (const rule of rules) {
      if (totalLinks >= MAX_LINKS_PER_POST) break;
      const productId = rule.product.name;
      let remaining = MAX_LINKS_PER_PRODUCT - (linksPerProduct.get(productId) || 0);
      if (remaining <= 0) continue;

      const slug = rule.product.slug || nameToSlug(rule.product.name);
      const href = `/product/${slug}`;

      let result = '';
      let lastIdx = 0;
      rule.pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.pattern.exec(text)) !== null) {
        if (remaining <= 0 || totalLinks >= MAX_LINKS_PER_POST) break;
        const isFirst = !firstLinkedProducts.has(productId);
        const badge = isFirst
          ? `<span style="font-size:10px;margin-left:3px;color:hsl(var(--accent));font-weight:500;white-space:nowrap;">View Product →</span>`
          : '';
        if (isFirst) firstLinkedProducts.add(productId);
        const anchor = `<a href="${href}" class="product-autolink" style="color:hsl(var(--primary));text-decoration:none;border-bottom:1px solid hsl(var(--primary)/0.3);">${m[0]}${badge}</a>`;
        result += text.slice(lastIdx, m.index) + anchor;
        lastIdx = m.index + m[0].length;
        rule.pattern.lastIndex = lastIdx;
        remaining--;
        totalLinks++;
        linksPerProduct.set(productId, (linksPerProduct.get(productId) || 0) + 1);
      }
      result += text.slice(lastIdx);
      text = result;
    }
    return text;
  });

  return out.join('');
}

/** Convenience helper: auto-link a plain-text string (no HTML) by wrapping in a div first. */
export function autoLinkPlainText(text: string, products: ProductLinkInfo[]): string {
  return autoLinkProducts(text, products);
}
