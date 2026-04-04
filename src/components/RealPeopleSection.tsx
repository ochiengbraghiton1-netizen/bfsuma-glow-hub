import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

interface CommunityImage {
  id: string;
  image_url: string | null;
  author_name: string;
  content: string | null;
}

const RealPeopleSection = () => {
  const [images, setImages] = useState<CommunityImage[]>([]);

  useEffect(() => {
    supabase
      .from("social_posts")
      .select("id, image_url, author_name, content")
      .eq("is_approved", true)
      .not("image_url", "is", null)
      .order("display_order", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) setImages(data);
      });
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full mb-4">
            <Heart className="w-4 h-4" />
            <span className="font-semibold text-sm">Our Community</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Real People.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Real Results.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Meet the customers, team members, and community behind BF SUMA Royal.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 max-w-5xl mx-auto">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
            >
              <img
                src={img.image_url!}
                alt={img.author_name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-sm truncate">{img.author_name}</p>
                {img.content && (
                  <p className="text-white/80 text-xs line-clamp-2">{img.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealPeopleSection;
