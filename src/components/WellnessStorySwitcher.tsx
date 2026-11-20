import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContentMediaBlock from "@/components/ContentMediaBlock";
import type { ContentMediaItem } from "@/lib/content-media";

interface Props {
  recognition: ContentMediaItem;
  desiredOutcome: ContentMediaItem;
  recognitionDescription?: string;
  desiredOutcomeDescription?: string;
}

const WellnessStorySwitcher = ({
  recognition,
  desiredOutcome,
  recognitionDescription,
  desiredOutcomeDescription,
}: Props) => {
  const [activeStory, setActiveStory] = useState<"recognition" | "desired_outcome">("recognition");
  const selected = activeStory === "recognition" ? recognition : desiredOutcome;
  const description = activeStory === "recognition" ? recognitionDescription : desiredOutcomeDescription;

  return (
    <section aria-label="Wellness story" className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-2 gap-2 border-b border-border p-3" role="group" aria-label="Choose a wellness story">
        <Button
          type="button"
          variant={activeStory === "recognition" ? "default" : "outline"}
          className="h-10 whitespace-normal px-2 text-xs sm:text-sm"
          aria-pressed={activeStory === "recognition"}
          onClick={() => setActiveStory("recognition")}
        >
          Where you are
        </Button>
        <Button
          type="button"
          variant={activeStory === "desired_outcome" ? "default" : "outline"}
          className="h-10 whitespace-normal px-2 text-xs sm:text-sm"
          aria-pressed={activeStory === "desired_outcome"}
          onClick={() => setActiveStory("desired_outcome")}
        >
          Where you want to be
        </Button>
      </div>

      <div className="grid md:grid-cols-2 md:items-center" aria-live="polite">
        <div className="aspect-[16/9] overflow-hidden bg-muted md:aspect-[4/3]">
          {selected.slot_key === "desired_outcome" && selected.before_media_url ? (
            <ContentMediaBlock
              item={{ ...selected, caption: null }}
              className="w-full"
              rounded="rounded-none"
              showHeading={false}
            />
          ) : selected.media_type === "image" ? (
            <img
              src={selected.media_url}
              alt={selected.alt_text}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <ContentMediaBlock
              item={{ ...selected, caption: null }}
              className="h-full w-full [&_figure]:h-full [&_video]:h-full [&_video]:object-cover [&_figcaption]:hidden"
              rounded="rounded-none"
              showHeading={false}
            />
          )}
        </div>
        <div className="flex min-h-40 flex-col justify-center gap-3 p-4 sm:p-6">
          <h2 className="text-xl font-bold md:text-2xl">
            {selected.heading || (activeStory === "recognition" ? "Does this sound familiar?" : "What better days can look like")}
          </h2>
          {(selected.caption || description) && (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{selected.caption || description}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default WellnessStorySwitcher;