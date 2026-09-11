/**
 * Direct GA4 (gtag.js) helpers. Measurement ID is initialised once in index.html.
 * No Google Tag Manager, no other analytics vendors.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const gtag = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
};

/** Fire ONLY from a real user click on a WhatsApp CTA. */
export function trackWhatsAppClick(productName?: string, placement?: string) {
  gtag("event", "whatsapp_click", {
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
    product_name: productName || "unknown",
    cta_placement: placement || "unknown",
  });
}

export function trackViewItem(item: {
  item_id: string;
  item_name: string;
  price: number;
  currency?: string;
}) {
  gtag("event", "view_item", {
    currency: item.currency || "KES",
    value: item.price,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        currency: item.currency || "KES",
      },
    ],
  });
}

export function trackPurchase(payload: {
  transaction_id: string;
  value: number;
  currency: string;
  items: { item_id: string; item_name: string; price: number; quantity: number }[];
}) {
  gtag("event", "purchase", payload);
}

export function trackLead(source: string) {
  gtag("event", "generate_lead", {
    lead_source: source,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

export function trackPageView(path: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag("event", name, params || {});
}
