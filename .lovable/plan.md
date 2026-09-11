# Analytics Setup — No Code Changes

## Decision
Leave everything as is. No code changes required.

## Confirmed state
- `/analytics-debug` stays live, unlinked, and `noindex, nofollow` — not visible to the public through navigation or search.
- GA4 events (`whatsapp_click`, `view_item`, `page_view`, `purchase`, `generate_lead`) flow automatically with no manual event creation needed.
- Historical inflated GA4 data cannot be corrected retroactively; new data is clean from the direct-gtag fix.

## Optional GA4 console steps (user-side, not code)
1. Mark `whatsapp_click` as a Key event: GA4 Admin → Events → toggle.
2. Register `product_name` and `cta_placement` as custom dimensions: GA4 Admin → Custom definitions.

## Verification
- Check GA4 → Reports → Realtime while clicking a WhatsApp button and viewing a product page to confirm events arrive.
