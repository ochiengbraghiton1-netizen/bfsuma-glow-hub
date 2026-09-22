import type { ContentMediaItem } from "@/lib/content-media";
import { storageSrcSet, SIZES_CARD_WIDE } from "@/lib/image-url";

interface Props {
  item?: ContentMediaItem;
  className?: string;
  rounded?: string;
}

/** Renders one visual-story slot (image or video) with optional caption. */
const ContentMediaBlock = ({ item, className = "", rounded = "rounded-2xl" }: Props) => {
  if (!item?.media_url) return null;
  return (
    <figure className={className}>
      {item.media_type === "video" ? (
        <video
          src={item.media_url}
          controls
          preload="metadata"
          aria-label={item.alt_text}
          className={`w-full ${rounded} border border-border/40`}
        />
      ) : (
        <img
          src={item.media_url}
          srcSet={storageSrcSet(item.media_url, [480, 768, 1024, 1280])}
          sizes={SIZES_CARD_WIDE}
          alt={item.alt_text}
          loading="lazy"
          decoding="async"
          className={`w-full object-cover ${rounded}`}
        />
      )}
      {item.caption && <figcaption className="text-sm text-muted-foreground mt-2">{item.caption}</figcaption>}
    </figure>
  );
};

export default ContentMediaBlock;
