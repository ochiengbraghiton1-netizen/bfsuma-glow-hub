import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Package, HelpCircle } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const items: NavItem[] = [
  { id: "products", label: "Explore Products", icon: Package },
  { id: "faq", label: "Read FAQs", icon: HelpCircle },
];

const SectionNav = () => {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (inView[0]) setActive(inView[0].target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
        "bottom-4 md:bottom-6",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ul className="flex items-center gap-1 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-lg p-1">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={handleClick(id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SectionNav;
