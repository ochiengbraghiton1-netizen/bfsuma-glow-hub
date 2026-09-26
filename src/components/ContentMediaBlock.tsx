import { useState } from "react";
import type { ContentMediaItem } from "@/lib/content-media";
import { storageFittedSrcSet, SIZES_CARD_WIDE } from "@/lib/image-url";
import { useInView } from "@/hooks/use-in-view";

interface Props {
  item?: ContentMediaItem;
  className?: string;
  rounded?: string;
  showHeading?: boolean;
}

/** Renders one visual-story slot (image or video) with optional caption. */
const ContentMediaBlock = ({ item, className = "", rounded = "rounded-2xl", showHeading = true }: Props) => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.15, rootMargin: "0px 0px -40px", triggerOnce: true });
  const [comparison, setComparison] = useState(50);
  if (!item?.media_url) return null;
  const hasComparison = item.slot_key === "desired_outcome"
    && item.media_type === "image"
    && Boolean(item.before_media_url);

  return (
    <figure
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      {showHeading && item.heading && <h2 className="text-xl md:text-2xl font-bold mb-4">{item.heading}</h2>}
      {hasComparison ? (
        <div className={`relative aspect-[4/3] overflow-hidden ${rounded} border border-border/40 bg-muted focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2`}>
          <img
            src={item.media_url}
            srcSet={storageFittedSrcSet(item.media_url, [480, 768, 1024, 1280], 4, 3)}
            sizes={SIZES_CARD_WIDE}
            alt={item.alt_text}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-3"
          />
          <img
            src={item.before_media_url || ''}
            srcSet={storageFittedSrcSet(item.before_media_url, [480, 768, 1024, 1280], 4, 3)}
            sizes={SIZES_CARD_WIDE}
            alt={item.before_alt_text || 'Before comparison'}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-3"
            style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
          />
          <span className="absolute left-3 top-3 rounded bg-background/90 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">Before</span>
          <span className="absolute right-3 top-3 rounded bg-background/90 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">After</span>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-background shadow-md" style={{ left: `${comparison}%` }}>
            <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md" aria-hidden="true">↔</span>
          </div>
          <input
            type="range"
            min="1"
            max="99"
            value={comparison}
            onChange={(event) => setComparison(Number(event.target.value))}
            aria-label="Reveal before and after images"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
      ) : item.media_type === "video" ? (
        <video
          src={item.media_url}
          controls
          preload="metadata"
          aria-label={item.alt_text}
          className={`w-full ${rounded} border border-border/40`}
        />
      ) : (
        <div className={`aspect-[4/3] overflow-hidden bg-muted/30 ${rounded} border border-border/40`}>
          <img
            src={item.media_url}
            srcSet={storageFittedSrcSet(item.media_url, [480, 768, 1024, 1280], 4, 3)}
            sizes={SIZES_CARD_WIDE}
            alt={item.alt_text}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-3"
          />
        </div>
      )}
      {item.caption && <figcaption className="text-sm text-muted-foreground mt-2">{item.caption}</figcaption>}
    </figure>
  );
};

export default ContentMediaBlock;
