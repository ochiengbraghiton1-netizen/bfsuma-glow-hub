# BF SUMA ROYAL — Product Requirements Document

Last updated: 24 August 2026
Owner: Braghiton Ochieng
Live: https://bfsumaroyal.com

---

## 1. Product overview

BF SUMA ROYAL is a wellness ecommerce and business-opportunity platform serving Kenya and East Africa. It sells herbal and nutritional supplements while simultaneously recruiting and supporting distributors in a Point Value (PV) network marketing model.

**Dual mission:** health outcomes for customers, financial empowerment for distributors. Every page, CTA, and content stream serves one of those two audiences without blurring them.

**Primary market:** Kenya (Nairobi plus 9 additional city pages), extended to East Africa.
**Currency:** KES only.
**Primary sales channel:** WhatsApp (+254795454053), not a self-serve card checkout.

---

## 2. Target users

| Segment | Goal | Entry point |
|---|---|---|
| Health seeker (mobile, 375px) | Relief from a specific concern: joint pain, hormonal balance, low energy, immunity, weight, focus | Google search → product / wellness hub / city page |
| Repeat customer | Reorder a known product fast | Direct product page → WhatsApp |
| Prospective distributor | Understand the income opportunity and join | `/business`, `/business/blog` |
| Admin / editor | Manage catalogue, content, orders, leads | `/admin/*` |

---

## 3. Core user flows

### 3.1 Purchase flow (primary)
1. Goal-based browsing on the homepage (Shop by Health Goal) or organic landing on `/product/:slug`.
2. Product page: emotional opener → benefits → who it may support → usage → trust, with Add to Cart visible above the fold and a persistent WhatsApp CTA.
3. Cart → order form → order written to the database with an ID (`BF-XXXX`) → WhatsApp handoff with a prefilled, context-aware message.
4. Admin notification email fires on every order (bfsumaroyal@gmail.com, CC braghiton.ochieng.125@gmail.com).

Secondary payment rails: PayPal popup (USD bridge) and IntaSend M-Pesa STK Push (in development, pending merchant approval).

### 3.2 Lead capture flows
- **Health quiz popup** — international phone (7–15 digits), fires Meta Pixel `Lead`.
- **Blog mini-quiz** — per-post, admin-configured concern options (max 4) → duration → contact → personalised product recommendation with deep-linked WhatsApp order button.
- **Wishlist → leads** — the heart icon requires a phone number on first use; writes to `leads` and `wishlist_items`, surfaced in Admin → Leads with the resolved product name.
- **Exit-intent popup and newsletter** — device-specific triggers.

### 3.3 Distributor flow
Referral UUID captured in localStorage, attributed on order, PV credited to the distributor. Business registration is a mentor-guided WhatsApp onboarding.

### 3.4 Content flows
- Health: `/blog`, `/blog/category/:slug`, `/wellness/:slug`, city pages (`/nairobi`, etc.)
- Business: `/business`, `/business/blog`, `/business/blog/:slug`
- Separation is enforced by `blog_posts.content_type` (`health` | `business`) on the frontend, sitemap, and edge renderer. Existing slugs are never changed.

---

## 4. Feature requirements

### 4.1 Catalogue
- ~40 products, KES pricing, stock tracking with atomic decrement.
- Product card click navigates to `/product/:slug`; the modal is Quick View only.
- Catalogue filters (search, category, sort) persist across back navigation.
- Category assignment via join table; image fallbacks required.

### 4.2 Conversion pages (wellness hubs, city pages)
Order is fixed: Hero → Recommended Products → Why these products → Educational long-form content → FAQ. Product mentions in body copy and FAQ answers auto-link to product pages. City product lists are admin-assignable per city.

### 4.3 Homepage
Fixed section order: Hero → Certifications → Shop by Health Goal → Products → Real Results → Consultation CTA → Why Trust Us. Outcome-based copy (less joint pain, more energy), no em dashes, no AI-generated people.

### 4.4 Admin dashboard (`/admin`)
Products, categories, orders, leads, promotions, social/UGC, wellness hubs, city SEO pages, blog (with per-post quiz options), consultations, business registrations, location-product assignments.

### 4.5 SEO
- Vercel Edge Middleware (`middleware.ts`) detects bots and proxies to the `seo-render` edge function for per-route title, canonical, OG tags, and prerendered HTML.
- Bot list must include `google-inspectiontool` and `googleother`.
- Single H1 per page; alt text pattern `Name | BF SUMA Royal`.
- JSON-LD: Product (merchant listing fields), BreadcrumbList, FAQPage, BlogPosting (author: Braghiton Ochieng), LocalBusiness on city pages, ItemList on product lists.
- Dynamic sitemap edge function covering all content types (~117 URLs), plus robots.txt and IndexNow.

### 4.6 Analytics
Meta Pixel `951783873944798` (PageView, ViewContent, Contact, Lead) and GA4 via GTM (`whatsapp_click`, SPA page views, purchase on PayPal capture only).

---

## 5. Non-functional requirements

**Performance:** mobile-first at 375px; hero LCP optimised with responsive WebP variants, preload, `fetchpriority=high`; third-party JS lazy-loaded; immutable asset caching.

**Security:** RLS enabled on every table before launch; roles only in `public.user_roles`; price calculation in SECURITY DEFINER RPCs (never trust client totals); affiliate financial data and customer PII never readable by anon; security headers (HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy, CSP) on all responses; no service-role key client-side; no `dangerouslySetInnerHTML` without DOMPurify; honeypot + Zod on all public forms; MCP server requires OAuth.

**Content compliance:** wellness framing only, no medical claims, no fake credentials, no unrealistic income claims. Authentic photography only.

---

## 6. Tech stack (do not change without instruction)

React + Vite + TypeScript SPA · Tailwind CSS + shadcn/ui · Supabase (Lovable Cloud) for auth, database, storage, edge functions · Vercel hosting with Edge Middleware · Cloudflare DNS · GitHub repo.

---

## 7. Explicit non-goals

- Replacing WhatsApp with a card-first checkout.
- Replacing Edge Middleware bot rendering with `vercel.json` rewrites.
- Non-KES pricing as the default display currency.
- AI-generated photos of people or fabricated expert profiles.
- Storing roles on `profiles`.

---

## 8. Success metrics

1. WhatsApp order handoffs per week (primary conversion).
2. Indexed page count in Search Console (target: all sitemap URLs indexed).
3. Mobile LCP under 2.5s on product and city pages.
4. Leads captured per 100 blog sessions (quiz + wishlist + exit intent).
5. New distributor registrations per month.
