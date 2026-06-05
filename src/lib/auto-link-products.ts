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
  const skipStack: string[] = [];

  const out = parts.map((part) => {
    if (part.isTag) {
      if (part.tagName) {
        const inSkip = SKIP_TAGS.has(part.tagName);
        const selfClose = part.text.endsWith("/>");
        if (part.isClosing) {
          // Pop matching tag from the top of stack (any tag — handles no-autolink wrappers)
          for (let i = skipStack.length - 1; i >= 0; i--) {
            if (skipStack[i] === part.tagName) {
              skipStack.splice(i, 1);
              break;
            }
          }
        } else if (!selfClose && (inSkip || part.hasNoAutolink)) {
          skipStack.push(part.tagName);
        }
      }
      return part.text;
    }
    if (skipStack.length > 0) return part.text;

    const text = part.text;
    // Collect candidate matches across all rules, then greedily pick
    // non-overlapping matches preferring earliest start, then longest length.
    interface Cand { start: number; end: number; matchText: string; rule: MatchRule }
    const cands: Cand[] = [];
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.pattern.exec(text)) !== null) {
        cands.push({ start: m.index, end: m.index + m[0].length, matchText: m[0], rule });
        if (m[0].length === 0) rule.pattern.lastIndex++;
      }
    }
    cands.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    let result = "";
    let cursor = 0;
    for (const c of cands) {
      if (c.start < cursor) continue; // overlaps with previously chosen
      if (totalLinks >= MAX_LINKS_PER_POST) break;
      const productId = c.rule.product.name;
      const used = linksPerProduct.get(productId) || 0;
      if (used >= MAX_LINKS_PER_PRODUCT) continue;

      const slug = c.rule.product.slug || nameToSlug(c.rule.product.name);
      const href = `/product/${slug}`;
      const isFirst = !firstLinkedProducts.has(productId);
      const badge = isFirst
        ? `<span style="font-size:10px;margin-left:3px;color:hsl(var(--accent));font-weight:500;white-space:nowrap;">View Product →</span>`
        : "";
      if (isFirst) firstLinkedProducts.add(productId);
      const anchor = `<a href="${href}" class="product-autolink" style="color:hsl(var(--primary));text-decoration:none;border-bottom:1px solid hsl(var(--primary)/0.3);">${c.matchText}${badge}</a>`;
      result += text.slice(cursor, c.start) + anchor;
      cursor = c.end;
      totalLinks++;
      linksPerProduct.set(productId, used + 1);
    }
    result += text.slice(cursor);
    return result;
  });

  return out.join("");
}

export function autoLinkPlainText(text: string, products: ProductLinkInfo[]): string {
  return autoLinkProducts(text, products);
}
