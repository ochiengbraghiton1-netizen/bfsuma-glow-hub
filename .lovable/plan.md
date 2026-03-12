

## M-Pesa "Coming Soon" Plan

Replace the active M-Pesa STK Push flow with a simple "Coming Soon" message. The M-Pesa button stays visible but shows a toast/message saying the feature is coming soon when clicked.

### Changes

1. **`src/components/checkout/MpesaPayment.tsx`** — Replace the entire payment flow (STK push, polling, phone input) with a static UI that shows M-Pesa branding and a "Coming Soon" badge. When the user clicks the button, show a toast saying "M-Pesa payments coming soon."

2. **No edge function changes needed** — The functions can stay deployed but won't be called. No secrets need to be removed.

### Result
- M-Pesa option remains visible in checkout for brand awareness
- Clicking it shows a friendly "Coming Soon" message
- No API calls are made
- When you're ready to go live, we re-enable the flow with production credentials

