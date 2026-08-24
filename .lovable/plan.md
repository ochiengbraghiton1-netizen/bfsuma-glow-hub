## Site Audit Findings (no changes made)

### Area 1 — Broken links & dead ends
- **`/blog/:slug`** — NOT a bug. `BlogPage` internally checks `useParams().slug` and renders `<BlogPostView>` when present, `<BlogList>` when absent. Individual posts render fine. (App.tsx line 147 is intentional.)
- **Track Order button** (`OrderConfirmation.tsx:376`) — Navigates to `/order-tracking`, which IS registered in App.tsx (line 106) → `OrderTracking` page exists. ✅ Wired. Worth a live click-test to confirm the page loads customer's order without extra input.
- **"View full policy"** in `ReturnPolicySummary.tsx` — Links to `/return-policy`, route exists. ✅
- **Wellness "View Recommended Products"** — Uses `#recommended-products` anchor which matches `<section id="recommended-products">` in same file. ✅
- **Business hub internal links** — Need runtime check; not yet audited.
- No hardcoded dead-end URLs detected in nav/footer scan.

### Area 2 — Console errors
Requires live browser runs on each page. Not performed yet. Recommend a Playwright pass across the 6 key routes capturing `console` + failed network requests.

### Area 3 — Mobile 375px
Requires headless screenshots at 375×viewport. Not performed yet. Recommend a Playwright pass on the 7 listed page types.

### Area 4 — Performance
- Hero images use `loading="eager"` ✅ (Hero.tsx lines 47/62/76).
- Below-the-fold `loading="lazy"` and WebP coverage across product cards, wellness hubs, city pages — not yet enumerated. Needs a scripted grep + asset audit.
- No render-blocking third-party scripts spotted beyond GTM/Meta Pixel (both async).

### Area 5 — Forms
Static review only. Runtime submission + DB write verification not performed. Files exist for all six:
`HealthQuizPopup.tsx`, `consultation/ConsultationForm.tsx`, `Contact.tsx`, `Checkout.tsx`, `business-registration/…`, `NewsletterSignup.tsx`. Prior work confirmed HealthQuiz fires `fbq('Lead')` after save. Others need a live submit test each.

### Area 6 — SEO meta via seo-render ✅
All 6 tested URLs return unique title/H1/meta description:
- `/product/arthroxtra` → "ArthroXtra Tablets — Joint Support Supplement Kenya…"
- `/product/x-power-man-capsules` → "Buy X-Power Man Capsules in Kenya…"
- `/blog/strengthen-immune-system-naturally-kenya` → "How to Strengthen Your Immune System Naturally…"
- `/wellness/joint-pain-mobility` → "Joint Pain & Mobility Support in Kenya…"
- `/nairobi` → "Health Supplements in Nairobi Kenya…"
- `/about` → "About BF SUMA Royal Kenya | Our Journey Since 2006"

No generic homepage fallback observed. All good.

### Area 7 — Admin dashboard
All 12 routes registered in App.tsx under protected `AdminLayout`. Component files exist for each. Functional correctness (buttons, CRUD, data connections) requires a logged-in Playwright walkthrough — not performed.

### Area 8 — Security headers ✅
`middleware.ts` `applySecurityHeaders` sets: HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo/interest-cohort off), X-XSS-Protection 0, COOP same-origin-allow-popups. **Caveat:** these are only applied on the bot-prerender branch (`if (!BOT_USER_AGENT.test(userAgent)) return next()`). Human visitors get whatever Vercel default headers exist — no HSTS/XFO enforced by middleware. This is a gap worth flagging.

### Area 9 — Route audit
- `/blog/:slug` → `BlogPage`: intentional, works (see Area 1). No change needed.
- `/:city` catch-all: `LocationLanding` calls `getLocationBySlug(city)` against a static list; unknown slugs render `NotFound`. All static routes (`/about`, `/contact`, `/wellness`, `/blog`, `/checkout`, `/auth`, …) are declared before `/:city` and React Router prefers exact/static matches over dynamic segments, so they are NOT intercepted. ✅ Confirmed safe.
- One minor: `/products` maps to `CategoryPage` (line 141) — intentional alias, fine.

---

## What still needs a runtime pass before fixes

To turn the "not yet audited" items into concrete findings, I recommend a Playwright sweep that:
1. Loads each of the 7 mobile-target pages at 375×1800 and screenshots.
2. Records `console` errors + failed network requests on the 6 key pages.
3. Submits each of the 6 forms with valid dummy data and verifies DB row + UI feedback.
4. Greps the codebase for `<img` tags without `loading=` and non-WebP src.
5. Logs into `/admin` (using injected session) and clicks through each admin route capturing errors.

## Confirmed real issues to potentially fix
1. **Security headers only ship on the bot branch of `middleware.ts`.** Human requests miss HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy.
2. (Everything else in your list is either already correct or needs runtime verification before I can flag it.)

## Proposed next step
Approve this plan and I'll (a) run the Playwright sweep described above and (b) fix the middleware headers gap. I will report the runtime findings back before applying any UI/form fixes so you can pick which ones to implement.
