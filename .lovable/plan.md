

## PayPal Error & WhatsApp Desktop Fix — Diagnosis & Plan

### What's Happening

**PayPal "loads then errors":** Two likely causes based on your live Business Account:

1. **Client ID type mismatch** — The Client ID hardcoded in the app (`AUfj...`) may be a **sandbox** credential, not a **live** credential. PayPal sandbox IDs only work with sandbox buyer accounts. If a real user tries to pay with a sandbox app, PayPal will error after loading. You need to verify in your PayPal Developer Dashboard → Apps & Credentials → switch to **"Live"** tab (not "Sandbox") and use that Client ID.

2. **`enable-funding=card` without Advanced Card Payments** — Your account screenshot shows JavaScript SDK v6 is enabled, but that's different from "Advanced Credit and Debit Card Payments." The `enable-funding=card` flag tries to render inline card fields that require that feature. If not approved, it causes errors.

3. **Phone validation may silently fail** — The regex `/^\+\d{7,15}$/` rejects phone numbers with spaces or dashes (e.g., `+254 712 345 678`). If `PhoneInput` stores formatted values, validation fails and `createOrder` throws before PayPal even opens.

### Plan

#### 1. Move PayPal Client ID to a secret (secure, swappable)
- Store the live Client ID as a backend secret so it can be changed without code deploys
- Create an edge function that returns the client ID to the frontend
- This also prevents exposing the credential in source code

#### 2. Fix SDK URL — remove `enable-funding=card`
- Remove `enable-funding=card` since Advanced Card Payments likely isn't approved
- Users can still pay with cards through the PayPal popup modal (no approval needed)

#### 3. Fix phone validation regex
- Update regex to strip spaces/dashes before validation: `/^\+\d{7,15}$/` applied after `.replace(/[\s-]/g, '')`
- Or relax the regex to allow spaces

#### 4. Add detailed error logging
- Add `console.error` with full details in `handlePayPalCreateOrder` to capture exactly which validation field fails
- Log the PayPal SDK error object in `handlePayPalError`

#### 5. WhatsApp desktop fix
- The `wa.me` link already works universally, but on desktop without WhatsApp installed it opens WhatsApp Web
- Add a fallback: detect desktop and use `https://web.whatsapp.com/send?phone=...` as an alternative link

### Immediate Action Needed From You

**Check your PayPal Developer Dashboard:**
1. Go to https://developer.paypal.com → Apps & Credentials
2. Toggle to **"Live"** (not Sandbox) at the top
3. Copy the **Live Client ID** from your REST API app
4. Share it so we can update the integration

This is the most likely root cause — using a sandbox Client ID on a live site.

