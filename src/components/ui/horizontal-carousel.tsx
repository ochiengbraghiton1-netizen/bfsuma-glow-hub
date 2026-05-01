import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface HorizontalCarouselProps {
  children: ReactNode;
  ariaLabel?: string;
  /** width of each item in px on mobile (default 280) */
  itemWidthMobile?: number;
  /** width of each item in px on md+ (default 340) */
  itemWidthDesktop?: number;
}

/**
 * Snap-scrolling horizontal carousel with optional desktop arrows.
 * Children should be wrapped in carousel items via <CarouselItem>.
 */
const HorizontalCarousel = ({
  children,
  ariaLabel = "Carousel",
  itemWidthMobile = 280,
  itemWidthDesktop = 340,
}: HorizontalCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const step = (isDesktop ? itemWidthDesktop : itemWidthMobile) + 20;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <div className="relative" role="region" aria-label={ariaLabel}>
      {/* Arrows (desktop only) */}
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByDir(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-background/90 backdrop-blur border border-border shadow-md hover:bg-background transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByDir(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-background/90 backdrop-blur border border-border shadow-md hover:bg-background transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-2 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
        style={{
          scrollPaddingLeft: "1rem",
          scrollPaddingRight: "1rem",
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface CarouselItemProps {
  children: ReactNode;
  className?: string;
}

export const CarouselItem = ({ children, className = "" }: CarouselItemProps) => (
  <div
    className={`snap-start shrink-0 w-[85vw] max-w-[300px] md:w-[340px] md:max-w-none ${className}`}
  >
    {children}
  </div>
);

export default HorizontalCarousel;
