

## Honeypot Bot Protection for Public Forms

This plan adds invisible trap fields to all public forms to automatically detect and reject automated bot submissions without affecting real users.

### What is a Honeypot?

A honeypot is a hidden form field that's invisible to human users but gets filled in by automated bots that crawl the page. When a form is submitted with the honeypot field filled, we know it's a bot and can reject the submission silently.

### Forms to Protect

Based on the codebase analysis, there are **2 public forms** that submit data directly to the database:

| Form | Location | Table |
|------|----------|-------|
| Business Registration | `src/pages/JoinBusiness.tsx` | `business_registrations` |
| Checkout | `src/pages/Checkout.tsx` | `orders`, `order_items` |

The consultation and contact components only open WhatsApp links (no database inserts), so they don't need honeypot protection.

### Implementation Steps

**Step 1: Create Reusable Honeypot Component**

Create a new component `src/components/ui/honeypot-field.tsx` with:
- An invisible text input field (hidden via CSS, not `display: none` or `type="hidden"` as bots detect those)
- Uses CSS positioning to move the field off-screen
- Includes `autocomplete="off"` and `tabindex="-1"` to prevent accidental user interaction
- The field will be named something enticing to bots like `website` or `company_url`

**Step 2: Create Honeypot Validation Utility**

Add a utility function in `src/lib/honeypot.ts`:
- Export a honeypot validation function that checks if the honeypot field is empty
- Export a Zod schema refinement for easy integration with existing form validation
- Function returns `true` if it's a bot (honeypot filled), `false` if legitimate

**Step 3: Update Business Registration Form**

Modify `src/pages/JoinBusiness.tsx`:
- Add honeypot field to the form default values
- Include the HoneypotField component inside the form (visually hidden)
- Add honeypot check in the `onSubmit` function before database insert
- If honeypot is triggered, show a generic "submission failed" message and silently reject

**Step 4: Update Checkout Form**

Modify `src/pages/Checkout.tsx`:
- Add honeypot field to the form state
- Include the HoneypotField component inside the form
- Add honeypot check in the `handleSubmit` function before creating the order
- If honeypot is triggered, show a generic error and prevent submission

### Technical Details

**Honeypot Field Component:**
```text
+------------------------------------------+
|  HoneypotField Component                 |
|  - Renders input with class "sr-only"    |
|  - Position: absolute, left: -9999px     |
|  - aria-hidden="true"                    |
|  - tabindex="-1"                         |
|  - autocomplete="off"                    |
|  - name="website" (enticing to bots)     |
+------------------------------------------+
```

**Validation Flow:**
```text
User submits form
        |
        v
Is honeypot field empty?
        |
   +----+----+
   |         |
  Yes        No
   |         |
   v         v
Continue   Silently reject
with       (show generic
submission  error message)
```

**Files to Create:**
- `src/components/ui/honeypot-field.tsx` - Reusable hidden input component
- `src/lib/honeypot.ts` - Validation utility functions

**Files to Modify:**
- `src/pages/JoinBusiness.tsx` - Add honeypot to business registration
- `src/pages/Checkout.tsx` - Add honeypot to checkout form
- `src/lib/business-registration-validation.ts` - Optionally add honeypot to Zod schema

### Benefits

- Zero friction for legitimate users (they never see the field)
- Blocks most simple spam bots without external services
- No CAPTCHA or additional user verification required
- No external API dependencies or costs
- Works offline and is very fast

### Limitations

- Sophisticated bots that render JavaScript and emulate human behavior may bypass this
- Should be combined with rate limiting for comprehensive protection (future enhancement)

