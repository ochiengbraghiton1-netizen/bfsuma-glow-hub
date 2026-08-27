import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP_URL = 'https://wa.me/254795454053?text=Hi%2C%20I%20need%20help%20choosing%20the%20right%20supplement%20for%20my%20health.';

const HERO_CACHE_KEY = "bfs_hero_img";

const readCachedHero = () => {
  try {
    const u = localStorage.getItem(HERO_CACHE_KEY);
    return u && /^https:\/\//.test(u) ? u : null;
  } catch {
    return null;
  }
};

/**
 * Width-limited variants for the admin-managed hero using Supabase's built-in
 * image transformation endpoint (no new dependency/service). Returns null for
 * any URL we don't recognise, in which case the original URL is used as-is.
 */
const supabaseHeroSrcSet = (url: string) => {
  if (!url.includes("/storage/v1/object/public/")) return null;
  const base = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return [640, 960, 1280, 1920]
    .map((w) => `${base}${sep}width=${w}&quality=70 ${w}w`)
    .join(", ");
};

const Hero = () => {
  // Use the previously seen admin hero straight away so it is the LCP element
  // instead of swapping in later (a late swap resets LCP and tanks the score).
  const [heroImage] = useState<string | null>(readCachedHero);

  useEffect(() => {
    // Defer Supabase import to avoid loading the 169KB chunk during initial render
    const t = window.setTimeout(() => {
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from('site_content')
          .select('image_url')
          .eq('section_key', 'hero')
          .maybeSingle()
          .then(({ data }) => {
            try {
              if (data?.image_url) localStorage.setItem(HERO_CACHE_KEY, data.image_url);
              else localStorage.removeItem(HERO_CACHE_KEY);
            } catch {
              /* ignore */
            }
          });
      });
    }, 2500);
    return () => window.clearTimeout(t);
  }, []);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Neutral background while loading */}
      <div className="absolute inset-0 bg-muted" />

      {heroImage ? (
        <img
          src={heroImage}
          alt="BF SUMA Royal wellness community with real customers and team members"
          loading="eager"
          decoding="sync"
          {...{ fetchpriority: "high" }}
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] md:object-[center_30%]"
          width={736}
          height={920}
          sizes="100vw"
        />
      ) : (
        <img
          src="/images/wellness-hero-1280.webp"
          srcSet="/images/wellness-hero-768.webp 768w, /images/wellness-hero-1280.webp 1280w, /images/wellness-hero.webp 1920w"
          sizes="100vw"
          alt="BF SUMA Royal premium wellness supplements and natural health products display"
          loading="eager"
          decoding="sync"
          {...{ fetchpriority: "high" }}
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-center"
          width={1280}
          height={720}
        />
      )}




      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Feel Better Naturally
          <br />
          <span className="bg-gradient-to-r from-accent via-accent-glow to-accent bg-clip-text text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
            Joint Pain, Energy, Digestion & Hormonal Support
          </span>
        </h1>
        <p className="sr-only">Natural supplements trusted by thousands of Kenyans for joint comfort, fatigue, bloating, hormone balance and daily wellness.</p>

        <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Natural supplements trusted by thousands of Kenyans for stiff joints, low energy, bloating, hormonal balance and everyday wellness, with free WhatsApp guidance from our wellness team.
        </p>


        <div className="flex flex-col lg:flex-row gap-3 md:gap-5 justify-center items-stretch lg:items-center w-full max-w-xl lg:max-w-none mx-auto">
          <button
            onClick={scrollToProducts}
            className="group relative w-full lg:w-auto inline-flex items-center justify-center gap-2 md:gap-3 h-14 md:h-[4.5rem] px-5 md:px-14 text-base md:text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-accent text-accent-foreground shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:shadow-[0_0_70px_hsl(43_96%_56%/0.8),0_12px_40px_hsl(43_96%_56%/0.5)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out animate-cta-pulse whitespace-nowrap"
          >
            <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 shrink-0" />
            <span>Find the Right Supplement</span>
            <ArrowRight className="w-5 h-5 md:w-7 md:h-7 shrink-0 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full lg:w-auto inline-flex items-center justify-center gap-2 md:gap-3 h-14 md:h-[4.5rem] px-5 md:px-14 text-base md:text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-white/15 backdrop-blur-md text-white border-2 border-accent shadow-[0_0_30px_hsl(43_96%_56%/0.25),inset_0_1px_0_hsl(0_0%_100%/0.15)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out whitespace-nowrap"
          >
            <MessageCircle className="w-5 h-5 md:w-7 md:h-7 shrink-0" />
            <span>Talk to a Wellness Expert</span>
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
