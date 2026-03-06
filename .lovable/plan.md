

## Analysis

Most of the requested functionality is already implemented in the current codebase:

- **Order saved before PayPal** -- `saveOrderToDb('pending_payment')` runs before PayPal opens
- **Status updated to "Paid"** -- `handlePayPalApprove` updates status to `paid` with PayPal transaction ID
- **Cart cleared** -- `clearCart()` called after successful payment
- **GA4 purchase event** -- Already fires with `transaction_id`, `value`, `currency`, and `items`
- **Order summary page** -- `/order-confirmation/:orderId` already shows order ID, products, customer details, total, and a "Payment Successful" message for paid orders

### What needs to be added

1. **`/order-success` route** -- Add as an alias/redirect so PayPal redirects go to a clean URL. After payment, navigate to `/order-success/:orderId` instead of `/order-confirmation/:orderId`. Both routes can share the same component, or we rename the existing one.

2. **Confirmation email to customer** -- This is the only truly missing feature. It requires a backend function to send a transactional email after successful PayPal payment, containing order details, delivery address, and contact info.

---

## Plan

### 1. Add `/order-success` route
- Add a new route `/order-success/:orderId` in `App.tsx` pointing to the existing `OrderConfirmation` component
- Update `Checkout.tsx` `handlePayPalApprove` to navigate to `/order-success/:orderId` instead of `/order-confirmation/:orderId`
- Keep `/order-confirmation/:orderId` working for WhatsApp orders
- Update the page heading logic: show "Payment Successful! Thank You!" for paid orders on the success route

### 2. Send order confirmation email via backend function
- Create an edge function `send-order-confirmation` that:
  - Accepts order ID
  - Fetches order + order items from the database
  - Sends a formatted HTML email to the customer with: order ID, product list, total amount, delivery address, and BF SUMA ROYAL contact info
  - Uses the Lovable AI-supported email approach (transactional email via the platform)
- Call this edge function from `handlePayPalApprove` after updating the order status to `paid`
- Only send if customer email is provided

### 3. Minor UX improvements on success page
- Add a more prominent "Thank you for your purchase" message for PayPal-paid orders
- Display delivery address on the confirmation page for paid orders

### Files to modify
- `src/App.tsx` -- add `/order-success/:orderId` route
- `src/pages/Checkout.tsx` -- change PayPal success navigation to `/order-success/`
- `src/pages/OrderConfirmation.tsx` -- enhance paid order display, add delivery address
- `supabase/functions/send-order-confirmation/index.ts` -- new edge function for email

