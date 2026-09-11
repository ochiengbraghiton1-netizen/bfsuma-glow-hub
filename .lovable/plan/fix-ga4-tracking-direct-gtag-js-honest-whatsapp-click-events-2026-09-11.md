# Fix GA4 tracking: direct gtag.js, honest WhatsApp click events

## Audit findings (before any change)

**1. There is no G-5S6XHDLTPF tag anywhere in the code.** All analytics currently flows through a Google Tag Manager container (`GTM-PDTHQJND`) loaded in `index.html`. Whatever GA4 tags exist live inside that container, invisible to the codebase — this is the main reason the numbers can't be reconciled.

**2. Analytics loads late.** Both GTM and the Meta Pixel only load after the first click/scroll/keypress, or after a 4–5 second idle fallback. Short visits go uncounted, and any event fired before load is lost.

**3. `whatsapp_click` fires from exactly one place** — a global click listener in `index.html` (lines 127–153) that matches links pointing at `wa.me/254795454053`. It is a genuine click handler, not a render/mount effect. The inflation to ~2.88 events per user therefore comes from double counting, not phantom firing:
- The handler pushes to `dataLayer` *and* calls `gtag` depending on what is defined, and GTM commonly defines both — so a container-side trigger on the same click can add a second hit.
- Any outbound-link or click trigger configured inside the GTM container fires on the same click as a third hit.
- The de-duplication uses a `WeakSet` of link elements; React re-renders replace those elements, so repeat clicks on a re-rendered button count again.

**4. WhatsApp CTAs that are NOT tracked at all** (they call `window.open(...)` instead of rendering a link, so the global listener never sees them):
- Chatbot — quick replies and both "Chat on WhatsApp" buttons (`Chatbot.tsx`)
- Community section button (`Community.tsx`)
- Contact page form submit (`ContactPage.tsx`)
- Contact section (`Contact.tsx`), Health Quiz popup (`HealthQuizPopup.tsx`), blog lead capture (`BlogLeadCapture.tsx`) where they use `window.open`

Tracked today (they are real `<a href>` links): product page CTA, sticky consultation button, consultation CTA, header, footer, hero, join-business hero and banner, location pages, wellness/business hub pages, order pages.

**5. Product pages fire the Meta Pixel `ViewContent` but no GA4 `view_item`.** Purchase and lead events push raw `dataLayer` objects that only work if GTM is present.

## The fix

**Tag setup** — remove the GTM container (script and noscript) and load Google Analytics directly with measurement ID `G-5S6XHDLTPF`, initialised once in one place, loading immediately on every page. No GTM, no other analytics scripts. Meta Pixel stays as-is.

**One tracking helper** — a single `src/lib/analytics.ts` exposing `trackWhatsAppClick(productName?, placement?)`, `trackViewItem(...)`, `trackPurchase(...)`, `trackLead(...)`, each calling `window.gtag` directly.

**Remove the duplicate path** — delete the inline GA4 branch inside the `index.html` click listener, keeping only the Meta Pixel `Contact` call there. GA4's `whatsapp_click` will then be fired once, explicitly, by each CTA.

**Wire every WhatsApp CTA** to call the helper exactly once per click, with placement labels:
- product detail page → product name + `product_page`
- sticky button → `sticky_cta`
- chatbot (all entry points) → `chatbot`
- blog/article CTAs → `blog_<post-slug>`
- others get descriptive placements: `header`, `footer`, `hero`, `community`, `contact_page`, `contact_section`, `consultation_cta`, `health_quiz`, `join_business_hero`, `join_business_banner`, `location_page`, `wellness_hub`, `business_hub`, `order_page`

**Product detail pages** fire `view_item` once per page view with `item_id`, `item_name`, `price`, `currency: "KES"`, alongside the existing pixel event.

**Existing dataLayer pushes** (purchase on PayPal capture, exit-intent lead, chatbot events) are converted to `gtag` calls so they keep working after GTM is removed. Page views on route changes keep firing — `GTMPageView.tsx` is repointed to `gtag('event','page_view')`.

## Files touched

- `index.html` — remove GTM script + noscript, add gtag.js for `G-5S6XHDLTPF` loaded immediately, strip the GA4 branch from the WhatsApp click listener
- `src/lib/analytics.ts` — new helper (plus a small unit test for the payload shape)
- `src/components/GTMPageView.tsx` — SPA page views via gtag
- WhatsApp CTA components: `Chatbot.tsx`, `Community.tsx`, `Contact.tsx`, `ContactPage.tsx`, `ConsultationCTA.tsx`, `StickyConsultationCTA.tsx`, `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `HealthQuizPopup.tsx`, `LocationPage.tsx`, `LocationLongForm.tsx`, `ShopByHealthGoal.tsx`, `WellnessHubPage.tsx`, `BusinessHubPage.tsx`, `ProductPage.tsx`, `blog/BlogLeadCapture.tsx`, `blog/BlogPostUGC.tsx`, `join-business/HeroSection.tsx`, `join-business/CTABanner.tsx`, `join-business/RegistrationFormSection.tsx`, `consultation/ConsultationSuccess.tsx`, `business-registration/RegistrationSuccess.tsx`
- `src/pages/Checkout.tsx`, `src/components/ExitIntentPopup.tsx` — purchase and lead events via gtag
- `docs/PRD.md` — update the one line describing the tag setup

No database, routing, SEO, prerender or styling changes.

## Verification

Type check and build; browser run of the preview confirming a single GA collect request per page, one `whatsapp_click` per WhatsApp click (verified on product page, sticky button and chatbot), one `view_item` per product page view, and no GTM script present.

## Important note

Once GTM is removed, anything configured inside that container stops firing — if you have tags in GTM beyond GA4 (for example Google Ads conversions), tell me and I'll re-create them in code.
