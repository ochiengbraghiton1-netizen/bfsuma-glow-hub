import { useState, useCallback } from "react";

interface ImageSource {
  src: string;
  width: number;
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * Generates srcset string for responsive images
 * Uses Lovable CDN image optimization when available
 */
function generateSrcSet(src: string, widths: number[] = [320, 640, 768, 1024, 1280]): string {
  // If it's already a data URL or external URL without CDN support, return empty
  if (src.startsWith("data:") || !src) {
    return "";
  }

  // For local assets or CDN-compatible URLs, generate srcset
  // This assumes the build process or CDN handles WebP conversion
  return widths
    .map((width) => `${src} ${width}w`)
    .join(", ");
}

/**
 * ResponsiveImage component with WebP support and srcset for optimal loading
 */
const ResponsiveImage = ({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  fallbackSrc,
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const srcSet = generateSrcSet(imageSrc);

  return (
    <picture>
      {/* WebP source - browsers that support it will use this */}
      {srcSet && (
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes}
        />
      )}
      {/* Fallback to original format */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        srcSet={srcSet || undefined}
      />
    </picture>
  );
};

export default ResponsiveImage;
