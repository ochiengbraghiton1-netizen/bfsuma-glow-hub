/**
 * SEO alt-text helpers for product / blog imagery.
 * Format: "[Product Name] | BF SUMA Royal" for primary product images.
 * Secondary images: "[Product Name] Supplement Bottle" (numbered for 3rd+).
 */

const BRAND_SUFFIX = "BF SUMA Royal";

export function generateProductAltText(
  productName: string,
  _category?: string,
  override?: string | null
): string {
  const trimmedOverride = override?.trim();
  if (trimmedOverride) return trimmedOverride.slice(0, 125);
  const base = `${productName} | ${BRAND_SUFFIX}`;
  return base.length <= 125 ? base : productName.slice(0, 125);
}

/**
 * For gallery/secondary product images.
 *  index = 0 -> primary alt (uses generateProductAltText)
 *  index = 1 -> "[Name] Supplement Bottle"
 *  index >=2 -> "[Name] Supplement Bottle - View {n}"
 */
export function generateProductGalleryAltText(
  productName: string,
  index: number,
  override?: string | null
): string {
  const trimmedOverride = override?.trim();
  if (trimmedOverride) return trimmedOverride.slice(0, 125);
  if (index <= 0) return generateProductAltText(productName);
  if (index === 1) return `${productName} Supplement Bottle`;
  return `${productName} Supplement Bottle - View ${index + 1}`;
}

export function generateBlogAltText(title: string): string {
  const base = `${title} - ${BRAND_SUFFIX} blog`;
  return base.length <= 125 ? base : title.slice(0, 120);
}

export function generateImageSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
