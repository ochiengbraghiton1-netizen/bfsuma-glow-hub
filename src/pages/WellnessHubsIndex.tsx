import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

interface Hub {
  slug: string;
  name: string;
  hero_title: string;
  hero_description: string;
}

const WellnessHubsIndex = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("wellness_hubs")
        .select("slug,name,hero_title,hero_description")
        .eq("is_active", true)
        .order("display_order");
      setHubs(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Wellness Hubs | BF SUMA Royal Kenya</title>
        <meta
          name="description"
          content="Explore 7 wellness hubs from BF SUMA Royal Kenya — joint pain, weight, digestion, hormones, energy, sleep & immunity. Expert guides and natural supplements."
        />
        <link rel="canonical" href="https://bfsumaroyal.com/wellness" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-20">
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase tracking-wider text-xs font-semibold">Wellness Hubs</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Find Your Wellness Path</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Curated supplements, expert guides and FAQs across the 7 wellness areas Kenyans care about most.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hubs.map((h) => (
                <Link
                  key={h.slug}
                  to={`/wellness/${h.slug}`}
                  className="group bg-card border border-border rounded-2xl p-6 hover:shadow-elegant hover:border-primary/40 transition-all"
                >
                  <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {h.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {h.hero_description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WellnessHubsIndex;
