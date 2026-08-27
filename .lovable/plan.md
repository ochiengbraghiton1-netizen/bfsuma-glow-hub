# Phase 4 — Mobile LCP Audit (diagnostic gate)

No files were changed. Findings below come from reading `index.html`, `src/main.tsx`, `src/App.tsx`, `src/pages/Index.tsx`, `src/components/Hero.tsx`, `vite.config.ts`, `vercel.json`, `src/index.css`, and the image files on disk.

## LCP element

On a cold mobile visit (how PageSpeed tests), the LCP element is the hero background image rendered by `Hero.tsx`:
`/images/wellness-hero-1280.webp` (41 KB, already preloaded with `fetchpriority=high` and a 768/1280/1920 srcset). The hero H1 paints at the same moment, so whichever is larger by area wins — with a full-bleed image it is the image.

The image bytes are already small and already preloaded. The 4.6s gap between FCP 2.7s and LCP 7.3s means **the hero is not being painted late because of the image download — it is painted late because nothing exists in the DOM until React executes.** The preloaded image sits in cache waiting for an `<img>` element that only appears after the JS chain finishes.

## Root causes, ranked

1. **Client-only rendering with a deep JS chain before the hero exists.** `#root` is empty; the hero requires `index.js` → `vendor-react` → `App` chunk → lazy `./pages/Index` chunk → `Hero`. On throttled mobile CPU every step is parse + execute. `Index` is `lazy()` in `App.tsx` even though `/` is the entry route, adding one extra round trip plus chunk-eval before the LCP element mounts. This is the single largest contributor.
2. **Provider work runs before first paint.** `App.tsx` wraps everything in `QueryClientProvider` → `ThemeProvider` → `CartProvider` → `AuthProvider` → `TooltipProvider`. `AuthProvider` pulls in the Supabase client (a ~170 KB vendor chunk) and fires a session call on mount, on the same main thread and network as the hero paint. Chatbot/Toaster/Sonner are lazy, which is good, but the Supabase chunk is not deferrable as currently wired.
3. **Two competing hero code paths, one of which can late-swap the LCP.** `Hero.tsx` reads `bfs_hero_img` from `localStorage` and `index.html` injects a second `<link rel=preload>` for it. For repeat visitors the admin hero is a full-size Supabase-hosted image with no `srcSet`/WebP variants (`width=736 height=920`), served at `100vw` on mobile. Cold PageSpeed runs never hit this path, but real returning users get a heavier, unoptimised LCP image and a second competing high-priority preload.
4. **Below-the-fold sections mount in the same Suspense boundary as the fold.** In `Index.tsx`, `CertificationsStrip`, `ShopByHealthGoal`, `ProductShowcase`, `RealResultsMerged`, `ConsultationCTA` and `WhyTrustUs` share one `<Suspense>`. Their chunks and their Supabase product queries start fetching immediately, competing with the hero for bandwidth and main thread. Only the section below that uses `content-visibility: auto`.
5. **Minor: `Header` is lazy with a 16 px fallback while `main` has a fixed `pt-16`.** No layout shift penalty measured, but the header chunk resolves in the same critical window and delays the visually complete fold.

Ruled out:
- **Fonts** — no `@font-face`, no Google Fonts request, no external font CSS. Not a factor.
- **Third-party scripts** — GTM and Meta Pixel are both interaction/idle-deferred in `index.html`. Correctly done, leave alone.
- **Video / social media on the homepage** — the homepage uses `StoriesInsights`, not `SocialFeed`; no `<video>` renders above or near the fold. Phase 3's `preload="none"` neither causes nor masks this.
- **Hero image weight** — 41 KB at 1280w, 19 KB at 768w. Already fine.
- **Vercel config** — SPA rewrite plus security headers, nothing that delays the document.

## Minimal fix set for the next build prompt

1. Import `Index` eagerly in `App.tsx` (drop its `lazy()`), so the home route is in the main bundle and the hero mounts one round trip earlier. Every other route stays lazy.
2. Import `Hero` and `Header` statically in `Index.tsx` (Hero already is) and move the below-the-fold group into its own `Suspense` boundary that mounts after first paint, so hero paint is never blocked by product-section chunks or queries.
3. Defer `AuthProvider`'s Supabase session bootstrap off the first-paint path (idle callback / post-mount) without changing auth semantics, so `vendor-supabase` stops competing with the hero.
4. Give the cached admin-hero path proper responsive attributes (`srcSet`/`sizes` or a width-limited transform) so returning visitors do not download an oversized LCP image, and drop the duplicate localStorage preload when the static hero is what will render.
5. Add `content-visibility: auto` / `contain-intrinsic-size` to the remaining below-the-fold sections that lack it.

## What must NOT change

- GTM and Meta Pixel deferral logic in `index.html`, and the WhatsApp `Contact`/`whatsapp_click` delegated listeners.
- The SEO fallback block, canonical strategy, `PageSEO`/Helmet tags, and the `seo-render` + `middleware.ts` bot path.
- Homepage section order, copy, or design.
- Social/UGC video rendering, `preload="none"`, posters, orientation, Featured toggle, health/business separation.
- Product filters, checkout, orders, auth behaviour, `vercel.json` headers/rewrites.

## Expected impact

Mobile LCP should move from ~7.3s toward the 3–4s range, driven almost entirely by items 1–3 (removing round trips and main-thread contention before the hero mounts). Performance score should rise from 66 into the high 70s / low 80s. Desktop is already 85 / LCP 1.2s and should be unaffected or slightly better.

Ceiling: this app is a client-rendered SPA, so the hero can never paint before the JS bundle executes. Getting mobile LCP reliably under 2.5s would need server rendering — available by migrating to Lovable's latest template ([what the upgrade gives you](https://lovable.dev/blog/building-apps-using-tanstack-start)). Not part of this phase.

## Regression risk

- Eager `Index` import slightly increases the main bundle; it removes a chunk instead of adding one, so net transfer is roughly flat.
- Deferring the auth bootstrap is the only behavioural change and needs a check that admin routes and the account menu still resolve correctly on direct load.
- SEO, analytics, checkout, and video/social features are untouched by the fix set above.
