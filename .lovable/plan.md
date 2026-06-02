## Content Architecture Refactor — Health vs Business

Separate health and business content without breaking existing URLs, articles, or SEO.

### Phase 1 — Schema
- Migration: add `content_type text NOT NULL DEFAULT 'health'` to `blog_posts` with CHECK constraint (`'health' | 'business'`)
- Add index on `content_type` + `status` for fast filtering

### Phase 2 — Migrate existing content (data update)
- Script classifies posts via:
  - Their linked `blog_categories.slug/name` (Network Marketing, Success Stories, Business Opportunity, Entrepreneurship, Income)
  - Keyword scan on title/slug/excerpt (mlm, network marketing, side hustle, income, distributor, business opportunity, extra income, earn, recruit, compensation)
- Sets `content_type='business'` for matches; leaves rest as `'health'`
- Pure UPDATE — no content rewrites, no slug changes

### Phase 3 — Admin panel
- Add `Content Type` dropdown to `src/pages/admin/Blog.tsx` post editor form (Health / Business). Default = Health.

### Phase 4 — Business Hub
- New route `/business` → `BusinessHubPage.tsx`
  - Hero (income opportunity messaging)
  - Featured business articles (top 3 by date, `content_type='business'`)
  - Success stories grid
  - Join BF SUMA CTA (reuse existing JoinBusiness CTA component)
  - Training resources block
  - Business FAQs

### Phase 5 — Business blog
- New route `/business/blog` → `BusinessBlogPage.tsx`
  - Lists only `content_type='business'` posts
  - Search, category filter, pagination
  - Featured row at top

### Phase 6 — Health blog cleanup
- Update `src/pages/BlogPage.tsx` (and any list queries) to filter `.eq('content_type','health')`
- Same for `BlogCategoryPage.tsx`

### Phase 7 — URL preservation
- `/blog/:slug` still resolves any post regardless of type (BlogPage already handles slug param)
- Inside post view: detect post's `content_type`; if `business`, render breadcrumb `Home › Business Hub › Article` instead of `Home › Blog › Article`

### Phase 8 — Homepage
- Audit `StoriesInsights.tsx` and any homepage blog widget → add `.eq('content_type','health')`
- `RelatedBlogPosts` on product pages already scoped to product — leave as-is

### Phase 10 — Recommendation logic
- Related-posts queries (in BlogPage and any "related" component): filter by same `content_type` as current article

### Phase 11 — SEO safety
- No slug/URL/meta changes
- Sitemap (`supabase/functions/sitemap`) keeps including all posts as-is
- Add `/business` and `/business/blog` to `src/config/routes.ts` so they appear in sitemap

### Files to touch
- New migration (Phase 1)
- Data update via `supabase--insert` (Phase 2)
- `src/pages/admin/Blog.tsx` (Phase 3)
- `src/pages/BusinessHubPage.tsx` (new), `src/pages/BusinessBlogPage.tsx` (new)
- `src/App.tsx` (routes)
- `src/pages/BlogPage.tsx`, `src/pages/BlogCategoryPage.tsx` (filter + breadcrumb)
- `src/components/StoriesInsights.tsx` (homepage filter)
- `src/config/routes.ts` (new public routes)
- `src/components/Footer.tsx` (link to Business Hub)

### Testing report
After implementation, run a read query to report counts: total health, total business, sample reclassified slugs.

Proceeding with Phase 1 migration first (requires your approval), then continuing through all phases.
