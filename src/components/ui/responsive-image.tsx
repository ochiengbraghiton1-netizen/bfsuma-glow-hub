import { useState, useCallback } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  /** Show a skeleton placeholder until the image loads (default: true) */
  showSkeleton?: boolean;
}

/**
 * ResponsiveImage component with skeleton loading state and fade-in.
 * No AI/default image fallback — shows a neutral skeleton until the real image loads.
 */
const ResponsiveImage = ({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  decoding = "async",
  width,
  height,
  onLoad,
  onError,
  fallbackSrc,
  showSkeleton = true,
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (fallbackSrc) {
      // Will re-render with fallbackSrc
    }
    onError?.();
  }, [onError, fallbackSrc]);

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // If there's no source at all, show skeleton/placeholder
  if (!imageSrc) {
    return (
      <div
        className={`${className} bg-muted animate-pulse`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div className="relative">
      {/* Skeleton placeholder — visible until image loads */}
      {showSkeleton && !isLoaded && (
        <div
          className={`${className} absolute inset-0 bg-muted animate-pulse rounded-inherit`}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
      />
    </div>
  );
};

export default ResponsiveImage;
