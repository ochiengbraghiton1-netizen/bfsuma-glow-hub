/**
 * Auto-links product names AND keywords in HTML content.
 *
 * Hardened v3:
 *  - Links across the FULL page content — headings, paragraphs, list items, FAQ answers.
 *  - Allows up to MAX_LINKS_PER_PRODUCT occurrences per product.
 *  - Global cap MAX_LINKS_PER_POST prevents over-linking.
 *  - First link for each product still gets a "View Product →" badge.
 *  - Never replaces text already inside <a>, <code>, <pre>, <script>, <style>,
 *    or any element with data-no-autolink.
 *  - Case-insensitive whole-word matching.
 *  - Longest term wins (sorted desc by length).
 */

export interface ProductLinkInfo {
  name: string;
  slug: string;
  keywords?: string[];
}

const MAX_LINKS_PER_POST = 20;
const MAX_LINKS_PER_PRODUCT = 3;

const SKIP_TAGS = new Set(["a", "code", "pre", "script", "style", "textarea"]);

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Part {
  text: string;
  isTag: boolean;
  tagName?: string;
  isClosing?: boolean;
  hasNoAutolink?: boolean;
}

function splitHtml(html: string): Part[] {
  const parts: Part[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) {
        parts.push({ text: html.slice(i), isTag: false });
        break;
      }
      const raw = html.slice(i, end + 1);
      const m = raw.match(/^<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)/);
      const isClosing = !!(m && m[1] === "/");
      const tagName = m ? m[2].toLowerCase() : undefined;
      const hasNoAutolink = /data-no-autolink/i.test(raw);
      parts.push({ text: raw, isTag: true, tagName, isClosing, hasNoAutolink });
      i = end + 1;
    } else {
      const next = html.indexOf("<", i);
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

export function autoLinkProducts(html: string, products: ProductLinkInfo[]): string {
  if (!html || products.length === 0) return html;

  interface MatchRule {
    pattern: RegExp;
    product: ProductLinkInfo;
    term: string;
  }
  const rules: MatchRule[] = [];
  for (const product of products) {
    const nameEsc = product.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rules.push({
      pattern: new RegExp(`\\b${nameEsc}\\b`, "gi"),
      product,
      term: product.name,
    });
    for (const kw of product.keywords || []) {
      const t = kw.trim();
      if (!t) continue;
      const kwEsc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      rules.push({
        pattern: new RegExp(`\\b${kwEsc}\\b`, "gi"),
        product,
        term: t,
      });
    }
  }
  rules.sort((a, b) => b.term.length - a.term.length);

  let totalLinks = 0;
  const linksPerProduct = new Map<string, number>();
  const firstLinkedProducts = new Set<string>();

  const parts = splitHtml(html);

  // Track depth of skip-tags
  const skipStack: string[] = [];

  const out = parts.map((part) => {
    if (part.isTag) {
      if (part.tagName && SKIP_TAGS.has(part.tagName)) {
        if (part.isClosing) {
          // Pop matching
          for (let i = skipStack.length - 1; i >= 0; i--) {
            if (skipStack[i] === part.tagName) {
              skipStack.splice(i, 1);
              break;
            }
          }
        } else if (!part.text.endsWith("/>")) {
          skipStack.push(part.tagName);
        }
      }
      if (part.hasNoAutolink && !part.isClosing && !part.text.endsWith("/>") && part.tagName) {
        skipStack.push(part.tagName);
      }
      return part.text;
    }
    if (skipStack.length > 0) return part.text;

    let text = part.text;
    for (const rule of rules) {
      if (totalLinks >= MAX_LINKS_PER_POST) break;
      const productId = rule.product.name;
      let remaining = MAX_LINKS_PER_PRODUCT - (linksPerProduct.get(productId) || 0);
      if (remaining <= 0) continue;

      const slug = rule.product.slug || nameToSlug(rule.product.name);
      const href = `/product/${slug}`;

      let result = "";
      let lastIdx = 0;
      rule.pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.pattern.exec(text)) !== null) {
        if (remaining <= 0 || totalLinks >= MAX_LINKS_PER_POST) break;
        const isFirst = !firstLinkedProducts.has(productId);
        const badge = isFirst
          ? `<span style="font-size:10px;margin-left:3px;color:hsl(var(--accent));font-weight:500;white-space:nowrap;">View Product →</span>`
          : "";
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

  return out.join("");
}

export function autoLinkPlainText(text: string, products: ProductLinkInfo[]): string {
  return autoLinkProducts(text, products);
}
