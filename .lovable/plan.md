
## Problem diagnosis

The React app already sets unique `<title>`, description, canonical and JSON-LD per page using `react-helmet-async` (verified in `ProductPage.tsx`, `BlogPage.tsx`, `ContactPage.tsx`, `FAQPage.tsx`). However, when crawlers fetch any URL — `/product/arthroxtra`, `/faq`, `/contact`, `/blog/...` — Vercel serves the **same static `index.html`** with hardcoded homepage tags:

- title: "BF SUMA Royal | Premium Health Supplements Kenya"
- canonical: `https://bfsumaroyal.com/`
- og:url: `https://bfsumaroyal.com/`

Confirmed by curling the live site — every URL returns the homepage meta and the homepage SEO fallback block. Helmet only updates these tags **after** React hydrates in a browser. Googlebot eventually renders JS, but the duplicate raw signal + the mismatch between the SEO fallback (homepage products list) and the actual page content suppresses ranking and confuses AI crawlers. This is the root cause.

## Solution overview

Two complementary tracks:

1. **Technical SEO**: render correct meta tags + page-specific fallback HTML at the edge for every route, so crawlers see unique signals on the first byte.
2. **Topical authority**: add 7 wellness hub landing pages with internal-linking to articles, FAQs, comparison pages, and products.

---

## Track 1 — Per-route meta + fallback at the edge

### 1.1 Vercel edge function `api/render.ts`

Add a Vercel serverless/edge function that:

- Reads the static `index.html` once, then for each request:
  - Matches the path against route patterns
  - For dynamic routes (`/product/:slug`, `/blog/:slug`, `/blog/category/:slug`, `/category/:slug`), fetches the row from Supabase using the anon key (slug, name, benefit, description, image, price, updated_at)
  - For static routes (`/faq`, `/contact`, `/about`, `/community`, `/return-policy`, `/terms`, `/join-business`, `/blog`, `/products`, city pages) uses the entry from `src/config/routes.ts`
  - Replaces inside the served `index.html`:
    - `<title>` 
    - `<meta name="description">`
    - `<link rel="canonical">`
    - `og:url`, `og:title`, `og:description`, `og:image`, `og:type`
    - `twitter:title/description/image/url`
    - The `seo-fallback` block content (page-specific H1, paragraph, structured data) — replaces the homepage product-list block
  - Injects per-route JSON-LD (Product, BlogPosting, FAQPage, LocalBusiness, BreadcrumbList) so crawlers get it without waiting for hydration
  - Returns the modified HTML with `Content-Type: text/html`

### 1.2 Update `vercel.json` rewrites

```
/sitemap.xml            -> supabase sitemap function (existing)
/api/(.*)               -> serverless functions (default)
/assets/(.*), /images/, /*.js/css/...  -> static (default)
/(.*)                    -> /api/render   (replace current /index.html catch-all)
```

The render function still serves the SPA `index.html`, just with rewritten `<head>` and fallback. React still hydrates and runs as today.

### 1.3 Strip duplicate tags in `index.html`

Keep only generic favicon/preconnect/theme tags. Remove the hardcoded homepage `<title>`, description, OG, canonical, and the homepage product-list `seo-fallback` from `index.html` so the edge function is the single source of truth (defaults remain as a no-JS fallback for the homepage only, marked with placeholders the edge function replaces).

### 1.4 Centralised route metadata

Extend `src/config/routes.ts` with the metadata used by both Helmet (client) and the edge function (server). Add a `lib/seo/page-meta.ts` shared module with:

- `getStaticMeta(path)` returning `{title, description, ogImage, jsonLd, h1, body}` 
- `getProductMeta(product)`, `getBlogMeta(post)`, `getCategoryMeta(cat)` — same shape

Both the edge function and the React pages import this module, guaranteeing identical content server-rendered and hydrated (no mismatch).

### 1.5 Per-page checklist enforced in code

For every route the render function guarantees:
- Unique `<title>` ≤ 60 chars
- Unique meta description 140–160 chars
- Canonical pointing to the exact URL (no trailing slash mismatch)
- Single `<h1>` in the fallback
- One JSON-LD block matching content type (Product / BlogPosting / FAQPage / LocalBusiness / Organization)
- Internal links to 3+ relevant pages

### 1.6 Acceptance

`curl https://bfsumaroyal.com/product/arthroxtra` returns `<title>Buy Arthroxtra in Kenya...</title>`, canonical `/product/arthroxtra`, JSON-LD `Product` schema and a fallback `<h1>Arthroxtra</h1>` paragraph. Same for `/faq`, `/contact`, `/blog/{slug}`, every city page.

---

## Track 2 — Topical authority hubs

### 2.1 New data: `wellness_hubs` table

Migration creating:

```
wellness_hubs(
  id uuid pk, slug text unique, name text,
  hero_title text, hero_description text,
  intro_html text, faq jsonb, updated_at timestamptz
)
wellness_hub_products(hub_id, product_id, position)
wellness_hub_articles(hub_id, blog_post_id, position)
```

Seed 7 rows:
1. `joint-pain-mobility`
2. `weight-management-metabolism`
3. `digestion-detox`
4. `womens-wellness-hormones`
5. `energy-focus-fatigue`
6. `sleep-recovery`
7. `immune-support-healthy-aging`

RLS: public SELECT for anonymous; admin write only (uses existing `has_role`).

### 2.2 New route `/wellness/:slug` → `WellnessHubPage.tsx`

Each hub page renders:
- H1 = hub.name (e.g. "Joint Pain & Mobility Support in Kenya")
- Intro 200–300 words, symptom-driven
- "Best products for [hub]" — links to 1–3 products
- "Educational guides" — list of 3–5 linked blog articles
- "Comparison" section
- "Best for…" matrix
- City availability ("Available in Nairobi, Mombasa, …")
- FAQ accordion (5 Q/A) with `FAQPage` JSON-LD
- BreadcrumbList JSON-LD

The edge function gets a matcher for `/wellness/:slug` and uses hub data for meta + fallback.

### 2.3 Admin UI

New admin page `pages/admin/WellnessHubs.tsx` — list, edit, attach products & articles, manage FAQ JSON.

### 2.4 Internal linking

- Add a "Related wellness hub" widget to:
  - `ProductPage.tsx` (auto-link product → its hubs via `wellness_hub_products`)
  - `BlogPage.tsx` post view (auto-link by `wellness_hub_articles`)
  - `LocationPage.tsx` (link to all 7 hubs at the bottom)
- Add a `/wellness` index listing all 7 hubs, linked from main nav (`Header.tsx`) and footer.

### 2.5 Sitemap

Update `supabase/functions/sitemap/index.ts` to include `/wellness` and every `/wellness/{slug}` (priority 0.85, weekly). Add hub URLs to `src/config/routes.ts` so client-side helpers match.

---

## Track 3 — Cleanup

- Move newsletter signup off the homepage (already partially done) — confirm it sits only in `Footer.tsx` and at end of blog post view.
- Remove legacy `scripts/generate-sitemap.ts` (superseded by edge function) or update to point at production base URL.

---

## Technical notes (for the dev section)

- Edge function runs on Vercel Edge Runtime (`export const config = { runtime: "edge" }`) so cold starts are fast and Supabase REST works fine.
- Cache: `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` on the rendered HTML so pages stay fresh but cheap.
- Use Supabase anon key + RLS; no service role exposed at the edge.
- A small in-memory LRU keyed by path inside the function reduces Supabase reads under load.
- Keep existing React Helmet logic — server output and client output stay byte-identical for the rewritten tags.

---

## Deliverables

1. `api/render.ts` Vercel edge function + updated `vercel.json`
2. `src/lib/seo/page-meta.ts` shared meta builder
3. Trimmed `index.html` (no homepage-locked tags / fallback)
4. New `wellness_hubs` tables + seed migration
5. `WellnessHubPage.tsx`, `/wellness` index, admin manager
6. Internal-link widgets on Product, Blog, Location pages
7. Sitemap + `routes.ts` updates
8. Verified via `curl` that 8 sample URLs each return unique title, description, canonical, JSON-LD

After approval I'll implement Track 1 first (the ranking blocker), then Track 2 (authority hubs) in the same loop.
