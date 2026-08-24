/**
 * Lead `source` strings are free-form. Wishlist captures store them as
 * `wishlist | product_id:<uuid>` so admins can see which product drove intent.
 * This module turns that raw string into a human label.
 */

const WISHLIST_PREFIX = "wishlist";
const PRODUCT_ID_RE = /product_id:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

/** Extracts the product UUID from a wishlist source string, or null. */
export function parseWishlistProductId(source: string | null | undefined): string | null {
  if (!source) return null;
  if (!source.trim().toLowerCase().startsWith(WISHLIST_PREFIX)) return null;
  const match = source.match(PRODUCT_ID_RE);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Human label for a lead source.
 * Wishlist leads resolve to `Wishlist: <Product Name>`, falling back to
 * `Wishlist` when the product id is missing or no longer exists.
 */
export function formatLeadSource(
  source: string | null | undefined,
  productMap: Record<string, string> = {},
): string {
  const raw = source || "exit_popup";
  if (!raw.trim().toLowerCase().startsWith(WISHLIST_PREFIX)) return raw;
  const productId = parseWishlistProductId(raw);
  const name = productId
    ? productMap[productId] ?? productMap[productId.toUpperCase()]
    : undefined;
  return name ? `Wishlist: ${name}` : "Wishlist";
}
