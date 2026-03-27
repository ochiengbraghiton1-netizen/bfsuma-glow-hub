

## Plan: Create a Site Health-Check Endpoint for TestSprite

### What you'll get

A single backend endpoint that TestSprite can call to:
1. **Crawl all pages** — returns every public URL on the site
2. **Check site health** — verifies database connectivity and edge function availability
3. **Serve as the single "API for the entire site"** that TestSprite needs

### The endpoint

**URL:** `https://sboaeutgckyiwunfmxqp.supabase.co/functions/v1/site-health`

**Response (JSON):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-28T01:30:00Z",
  "database": "connected",
  "site_url": "https://bfsumaroyal.com",
  "pages": [
    { "url": "https://bfsumaroyal.com/", "title": "Homepage", "priority": 1.0 },
    { "url": "https://bfsumaroyal.com/about", "title": "About", "priority": 0.8 },
    ...all 20+ public pages...
  ],
  "dynamic_pages": {
    "products": 12,
    "blog_posts": 5,
    "categories": 4
  },
  "edge_functions": ["sitemap", "chat-assistant", "create-order", "mpesa-stk-push"]
}
```

### Implementation steps

1. **Create `supabase/functions/site-health/index.ts`**
   - No JWT required (public endpoint for testing tools)
   - Queries the database to check connectivity
   - Returns all static routes from a hardcoded list (mirrors `routes.ts`)
   - Counts active products, published blog posts, and categories
   - Lists available edge functions

2. **Add config to `supabase/config.toml`**
   - Add `[functions.site-health]` with `verify_jwt = false`

### How to use with TestSprite

Once built, enter this as your API endpoint in TestSprite:
```
https://sboaeutgckyiwunfmxqp.supabase.co/functions/v1/site-health
```

TestSprite can then use the `pages` array to crawl every URL on your site and run its full test suite.

### Technical details

- Edge function uses Supabase service role key (server-side only) for DB checks
- No authentication required — returns only public page URLs
- Response includes counts of dynamic content so TestSprite can verify content exists
- CORS headers included for flexibility

