import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_URL = 'https://wa.me/254795454053?text=Hi%2C%20I%20need%20help%20choosing%20the%20right%20supplement%20for%20my%20health.';

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('image_url')
      .eq('section_key', 'hero')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.image_url) {
          const img = new Image();
          img.onload = () => setHeroImage(data.image_url);
          img.src = data.image_url;
        }
      });
  }, []);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Neutral background while loading */}
      <div className="absolute inset-0 bg-muted" />

      {/* Static fallback — always rendered immediately for fast LCP */}
      <picture>
        <source srcSet="/images/wellness-hero.webp" type="image/webp" />
        <img
          src="/images/wellness-hero.jpg"
          alt="BF SUMA Royal premium wellness supplements and natural health products display"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          sizes="100vw"
          style={{ objectPosition: "center" }}
        />
      </picture>

      {/* Admin-uploaded hero overlays the static one when ready */}
      {heroImage && (
        <img
          src={heroImage}
          alt="BF SUMA Royal wellness community — real customers and team members"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          width={1920}
          height={1080}
          sizes="100vw"
          style={{ objectPosition: "center top" }}
        />
      )}

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Tired of Fatigue, Pain, or Low Energy?
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
            Start Feeling Better Naturally
          </span>
        </h1>

        <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover the right supplement for your body—boost immunity, improve energy, and support your health with trusted natural solutions in Kenya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center w-full max-w-xl mx-auto">
          <button
            onClick={scrollToProducts}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 md:h-[4.5rem] px-10 md:px-14 text-lg md:text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-accent text-accent-foreground shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:shadow-[0_0_70px_hsl(43_96%_56%/0.8),0_12px_40px_hsl(43_96%_56%/0.5)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out animate-cta-pulse"
          >
            <ShoppingBag className="w-6 h-6 md:w-7 md:h-7" />
            Find the Right Supplement
            <ArrowRight className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 md:h-[4.5rem] px-10 md:px-14 text-lg md:text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-white/15 backdrop-blur-md text-white border-2 border-accent shadow-[0_0_30px_hsl(43_96%_56%/0.25),inset_0_1px_0_hsl(0_0%_100%/0.15)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out"
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            Talk to a Wellness Expert
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
