## BF SUMA Royal — Critical SEO Fixes (Phase 1)

A large, multi-area request. Below is the proposed plan grouped by the four issues you raised, plus the auto-link testing addendum.

---

### Issue 1 — Crawl & Indexation Audit

**Audit findings I'll act on (based on current code):**
- `public/robots.txt` is fine for public sections (`/product/*`, `/blog/*`, `/wellness/*`, local pages, etc. are all allowed). Only admin/auth/checkout/account flows are disallowed — correct.
- `index.html` has no global `noindex`. `PageSEO` only emits `noindex` when explicitly passed — correct.
- Sitemap (edge function) already includes products, categories, blog posts (split health vs business), wellness hubs and static routes. Missing: `/wellness` index is present, but **local landing pages list is hardcoded** and out of sync with `src/config/locations.ts`. Also missing: `/join-business`, `/auth`, `/checkout` (intentional), and `/wellness` hub articles aren't needed.
- Per-route canonicals: `PageSEO` writes a canonical, but `index.html` also ships a static `<link rel="canonical" href="/">`. This causes **duplicate canonicals on every non-home route** (a real indexation bug). Fix: remove the static canonical from `index.html`; leave per-route canonicals to `PageSEO` / `seo-render`.
- `seo-render` edge function already emits per-route meta + JSON-LD for crawlers (good — handles JS rendering concern).

**Actions:**
1. Remove the conflicting `<link rel="canonical">` from `index.html`.
2. Regenerate the sitemap's location list dynamically from `src/config/locations.ts` (export a JSON list the edge function can import, or hardcode in sync — I'll mirror the config in the edge function so all 10+ cities are correctly listed with priorities).
3. Add `/wellness` already present; add missing static routes (`/join-business`).
4. Verify `seo-render` covers `/wellness/:slug`, `/blog/:slug`, `/business/blog/:slug`, `/product/:slug`, location routes, and `/category/:slug` — patch any missing route handlers so first-byte HTML carries title/description/canonical/H1.

---

### Issue 2 — Missing H1 Tags

**Audit:**
- Most pages have H1s already. I'll sweep these route components and ensure exactly one `<h1>`:
  - `ProductPage`, `WellnessHubPage`, `WellnessHubsIndex`, `LocationPage`, `BlogPage`, `BlogCategoryPage`, blog post detail, `BusinessHubPage`, `BusinessBlogPage`, `CategoryPage`, `FAQPage`, `ContactPage`, `AboutPage`, `JoinBusiness`, `CommunityPage`, `ReturnPolicy`, `TermsConditions`, `NotFound`, `Index`.
- Fix any pages with zero H1s (add semantic H1) or multiple H1s (demote extras to H2).
- Update `seo-render` to inject an H1 into the no-JS HTML for each route type.

---

### Issue 3 — Unique Product Image Alt Text

**Actions:**
1. `ProductCard`, `ProductPage`, `ProductDetailModal`, `ProductShowcase`, `BlogRelatedProducts`, `RecommendedProductsSection` (within `WellnessHubPage`/`LocationPage`):
   - Primary image alt: `{product.name} | BF SUMA Royal`
   - Gallery/secondary images: `{product.name} Supplement Bottle` (with index suffix for 3rd+).
   - Honor `product_images.alt_text` if set (admin override). Fallback to formatted name.
2. Update `src/lib/image-seo.ts` helper to centralize alt formatting.
3. Admin UI: `ProductImageUpload` already supports alt text — confirm it persists; add a small placeholder hint.

---

### Issue 4 — Editable Local SEO Content (Admin)

**Schema** (new migration):
- Extend `location_products` is product-only. Create new table `location_pages` keyed by `city_slug`:
  - `hero_title`, `hero_description`, `main_content_html` (rich text), `faqs` (jsonb), `meta_title`, `meta_description`, `seo_keywords` (text[]), `og_title`, `og_description`, `og_image_url`, `canonical_url`, `is_published`.
  - GRANTs: `SELECT` to anon + authenticated (public read), full to service_role; INSERT/UPDATE/DELETE for admins via `has_role`.
- Update trigger for `updated_at`.

**Admin UI:** new page `/admin/locations` listing every city from `locations.ts` with edit modal — TipTap rich text editor (already in project), FAQ list editor, meta/og fields.

**Frontend:** `LocationPage` reads `location_pages` row (if exists) and overrides static defaults; falls back to current static content. `seo-render` also reads from the table.

---

### Auto-Linking — Tests & Edge Cases

- Add Vitest unit tests for `src/lib/auto-link-products.ts`:
  - links in headings/lists/FAQ answers
  - case-insensitive whole-word matching
  - no link inside existing `<a>`
  - no link inside `<code>` / `<pre>` (new edge case)
  - respects max-per-product and max-per-page caps
  - no false matches inside other words ("ProArthro" should not match "Arthro")
  - HTML entities preserved
  - longest-match-wins ordering
- Harden the linker to skip `<code>`, `<pre>`, `<script>`, `<style>`, and any element with `data-no-autolink`.

---

### Out of scope for this phase
- Actual Google Search Console submission / reindex requests (you should hit "Validate fix" in GSC after deploy).
- Backfilling alt text on already-uploaded images in storage metadata (the rendered alt will be correct regardless).

### Deliverables
1. `index.html` canonical removed.
2. `supabase/functions/sitemap/index.ts` + `seo-render` updated.
3. New `location_pages` table + migration + admin page + frontend wiring.
4. Alt-text helper + component updates.
5. H1 audit fixes across route components.
6. Hardened `auto-link-products.ts` + Vitest tests.

Confirm and I'll execute the whole plan in one pass.