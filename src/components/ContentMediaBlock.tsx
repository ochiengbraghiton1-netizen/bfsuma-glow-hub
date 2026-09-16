import type { ContentMediaItem } from "@/lib/content-media";

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
          alt={item.alt_text}
          loading="lazy"
          className={`w-full object-cover ${rounded}`}
        />
      )}
      {item.caption && <figcaption className="text-sm text-muted-foreground mt-2">{item.caption}</figcaption>}
    </figure>
  );
};

export default ContentMediaBlock;
