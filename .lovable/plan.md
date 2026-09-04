# Audit report: blog URL fetch + Quick Links

No code was changed. Findings below are from live fetches, the database record, and the current source.

## Issue 1 — Blog article "returns homepage content"

### Confirmed facts
- The article exists and is live: slug `vaginal-dryness-discomfort-before-40-kenya`, status `published`, type `health`, published 6 Aug 2026, ~6,000 characters of content.
- Fetched as a normal browser agent: HTTP 200, but the returned file is the app shell, whose built-in placeholder title is "BF SUMA Royal | Premium Health Supplements Kenya". This is the same shell every page returns, by design.
- Fetched as Google: HTTP 200 with headers `x-bot-prerender: vercel-middleware` and `x-seo-render: 1`, correct title "Vaginal Dryness Before 40: Why It Happens and What Actually Helps", and correct canonical `https://bfsumaroyal.com/blog/vaginal-dryness-discomfort-before-40-kenya`.

### Root cause
Not a bug. The site is a single-page app: the real article is assembled in the browser, so a simple external fetcher (which does not run scripts) only ever sees the shared shell. Search engines and social crawlers are detected and served fully rendered article HTML, which is what matters for indexing and previews.

### Severity
None for users or Google. Low, cosmetic risk only: the shell's placeholder title is homepage wording, so any non-listed scraper or link tool that does not run scripts will show the homepage title for every URL.

### Affected files
- `index.html` (placeholder title/description in the shell)
- `middleware.ts` (bot list that decides who gets rendered HTML)
- `supabase/functions/seo-render/index.ts` (renders the real article HTML)

### Safest minimal fix (optional)
Add more non-JS fetchers to the bot list in `middleware.ts` (WhatsApp, Telegram, Discord, Pinterest, Applebot, Yandex, DuckDuckBot, Ahrefs/Semrush) so previews and audit tools also receive the real page. No routing or app changes needed.

## Issue 2 — Quick Links

### Confirmed facts
- Footer "Products" and "About Us" are in-page jump links: they cancel the normal link behaviour and scroll to a section on the current page.
- The footer appears on every page. On any page other than the homepage those two sections do not exist, so the click is cancelled and nothing at all happens. This is the reported failure.
- Even on the homepage there is a timing hole: the Products, About and FAQ sections are mounted only after the first paint, so a very early click can scroll nowhere.
- All other footer Quick Links are real routes and all resolve correctly: `/wellness`, `/faq`, `/contact`, `/return-policy`, `/terms`, `/blog`, `/business`, `/join-business`, plus the ten city links.
- The top navigation handles this correctly already: if you are not on the homepage it navigates home first, then scrolls.

### Root cause
The footer's two jump links assume the visitor is on the homepage. They were never given the "go home first, then scroll" behaviour the header has.

### Severity
Medium. Two links are dead on roughly every page except the homepage, on a component shown site-wide.

### Affected files
- `src/components/Footer.tsx` (lines with the Products and About Us links)
- Secondary, timing only: `src/pages/Index.tsx` (deferred mounting of those sections)

### Safest minimal fix
In `Footer.tsx` only, make those two links behave like the header's: when already on the homepage, scroll; otherwise navigate to `/#products` or `/#about` and scroll once the section is present (retry briefly instead of a fixed delay, which also closes the early-click timing hole). Roughly 15 lines in one file, no routing, data or SEO changes.

## Recommendation
Fix the footer links. Treat the blog URL as working; optionally widen the crawler list so link-preview tools stop showing homepage wording.
