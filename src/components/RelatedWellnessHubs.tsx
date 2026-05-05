import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowRight } from "lucide-react";

interface Hub { slug: string; name: string; hero_description: string }

interface Props {
  productId?: string;
  blogPostId?: string;
  /** When true, shows all 7 hubs (used on location pages) */
  showAll?: boolean;
}

const RelatedWellnessHubs = ({ productId, blogPostId, showAll }: Props) => {
  const [hubs, setHubs] = useState<Hub[]>([]);

  useEffect(() => {
    (async () => {
      let hubIds: string[] | null = null;
      if (!showAll && (productId || blogPostId)) {
        const table = productId ? "wellness_hub_products" : "wellness_hub_articles";
        const col = productId ? "product_id" : "blog_post_id";
        const val = productId || blogPostId!;
        const { data } = await (supabase as any).from(table).select("hub_id").eq(col, val);
        hubIds = (data || []).map((r: any) => r.hub_id);
        if (!hubIds || hubIds.length === 0) return;
      }
      let q = (supabase as any).from("wellness_hubs")
        .select("slug,name,hero_description").eq("is_active", true).order("display_order");
      if (hubIds) q = q.in("id", hubIds);
      const { data } = await q;
      setHubs(data || []);
    })();
  }, [productId, blogPostId, showAll]);

  if (!hubs.length) return null;

  return (
    <section className="py-10 border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl md:text-2xl font-bold">Related Wellness Hubs</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((h) => (
            <Link key={h.slug} to={`/wellness/${h.slug}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all">
              <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{h.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{h.hero_description}</p>
              <span className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedWellnessHubs;
