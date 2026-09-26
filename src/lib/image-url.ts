/**
 * Image delivery helpers.
 *
 * Images stored in Lovable Cloud storage are served through the built-in
 * image transformation endpoint so the browser receives a correctly sized,
 * compressed variant (and WebP automatically, via content negotiation)
 * instead of the full-resolution original shrunk down by CSS.
 *
 * Any URL we don't recognise (bundled assets, external URLs) is returned
 * unchanged so callers can always use the result as a plain src.
 */

const PUBLIC_OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

export const isStorageImageUrl = (url?: string | null): boolean =>
  !!url && url.includes(PUBLIC_OBJECT_PATH);

/** One width-limited variant of a storage image. */
export const storageImageUrl = (
  url: string,
  width: number,
  quality = 70
): string => {
  if (!isStorageImageUrl(url)) return url;
  const base = url.replace(PUBLIC_OBJECT_PATH, RENDER_PATH);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&quality=${quality}`;
};

/**
 * A fixed-ratio storage variant for UI frames that must preserve the complete
 * source image. Supplying both dimensions prevents the image service from
 * stretching square uploads when it creates width-only variants.
 */
export const storageFittedImageUrl = (
  url: string,
  width: number,
  height: number,
  quality = 70
): string => {
  if (!isStorageImageUrl(url)) return url;
  const base = url.replace(PUBLIC_OBJECT_PATH, RENDER_PATH);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&height=${height}&resize=contain&quality=${quality}`;
};

export const storageFittedSrcSet = (
  url?: string | null,
  widths: number[] = [320, 480, 768, 1024],
  aspectWidth = 1,
  aspectHeight = 1,
  quality = 70
): string | undefined => {
  if (!url || !isStorageImageUrl(url)) return undefined;
  return widths
    .map((width) => {
      const height = Math.max(1, Math.round((width * aspectHeight) / aspectWidth));
      return `${storageFittedImageUrl(url, width, height, quality)} ${width}w`;
    })
    .join(", ");
};

/**
 * srcSet string for a storage image, or undefined when the URL is not a
 * storage object (in which case the caller should just use src).
 */
export const storageSrcSet = (
  url?: string | null,
  widths: number[] = [320, 480, 768, 1024],
  quality = 70
): string | undefined => {
  if (!url || !isStorageImageUrl(url)) return undefined;
  return widths.map((w) => `${storageImageUrl(url, w, quality)} ${w}w`).join(", ");
};

/** Common sizes hints so the browser picks the smallest usable variant. */
export const SIZES_CARD = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px";
export const SIZES_CARD_WIDE = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px";
export const SIZES_FULL = "100vw";

/** Long-lived cache header for newly uploaded storage objects (1 year). */
export const UPLOAD_CACHE_CONTROL = "31536000";
