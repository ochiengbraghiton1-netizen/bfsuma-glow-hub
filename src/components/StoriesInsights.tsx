import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSocialPosts } from "@/hooks/use-social-posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Users, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import fallback1 from "@/assets/fallback-story-1.webp";
import fallback2 from "@/assets/fallback-story-2.webp";
import fallback3 from "@/assets/fallback-story-3.webp";
import fallback4 from "@/assets/fallback-story-4.webp";
import fallback5 from "@/assets/fallback-story-5.webp";

interface StoryItem {
  id: string;
  type: "blog" | "community" | "fallback";
  title: string;
  excerpt: string;
  image: string | null;
  link: string;
  cta: string;
  hasVideo?: boolean;
}

const FALLBACK_STORIES: StoryItem[] = [
  {
    id: "fb-1",
    type: "fallback",
    title: "How I Improved My Energy Levels in 2 Weeks",
    excerpt: "Sarah from Nairobi shares her journey from constant fatigue to vibrant energy using natural wellness supplements daily.",
    image: fallback1,
    link: "/blog",
    cta: "Read More",
  },
  {
    id: "fb-2",
    type: "fallback",
    title: "Balancing Hormones Naturally – A Wellness Journey",
    excerpt: "Mary in Kisumu discovered a holistic approach to hormonal balance that transformed her mood and everyday life.",
    image: fallback2,
    link: "/blog",
    cta: "Read More",
  },
  {
    id: "fb-3",
    type: "fallback",
    title: "Our Family's Switch to Natural Wellness",
    excerpt: "The Ochieng family from Mombasa embraced clean nutrition and natural supplements, making health a family affair.",
    image: fallback3,
    link: "/blog",
    cta: "Read More",
  },
  {
    id: "fb-4",
    type: "fallback",
    title: "From Couch to 5K – My Fitness Transformation",
    excerpt: "James in Eldoret combined daily supplements with an active lifestyle and completed his first 5K in eight weeks.",
    image: fallback4,
    link: "/blog",
    cta: "Read More",
  },
  {
    id: "fb-5",
    type: "fallback",
    title: "Finding Calm in a Busy World",
    excerpt: "Grace from Nakuru shares her evening wellness ritual and how natural supplements helped her manage daily stress.",
    image: fallback5,
    link: "/blog",
    cta: "Read More",
  },
];

const MIN_CARDS = 3;
const MAX_CARDS = 6;

/** Truncate excerpt to ~25 words */
function trimExcerpt(text: string, maxWords = 25): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}

const LoadingSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="overflow-hidden h-full flex flex-col">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-5 flex flex-col flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-9 w-full rounded-full mt-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const StoriesInsights = () => {
  const [blogItems, setBlogItems] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: socialPosts, isLoading: socialLoading } = useSocialPosts({ featured: true, limit: 6 });

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, video_url, published_at")
        .eq("status", "published")
        .eq("content_type", "health")
        .order("published_at", { ascending: false })
        .limit(6);

      if (posts) {
        setBlogItems(
          posts.map((p) => ({
            id: p.id,
            type: "blog" as const,
            title: p.title,
            excerpt: trimExcerpt(
              p.excerpt || "Explore wellness tips and health insights from our Kenyan community."
            ),
            image: p.featured_image,
            link: `/blog/${p.slug}`,
            cta: p.video_url ? "Watch" : "Read More",
            hasVideo: !!p.video_url,
          }))
        );
      }
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  // Build community items from social posts with "Show on Homepage" (is_featured)
  const communityItems: StoryItem[] = (socialPosts || [])
    .filter((p) => p.image_url)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      type: "community" as const,
      title: p.author_name,
      excerpt: trimExcerpt(p.content || "A real wellness story shared by a member of our Kenyan community."),
      image: p.image_url,
      link: p.post_url || "/community",
      cta: "View Story",
    }));

  // Priority: community first, then blogs, cap at MAX_CARDS
  let items: StoryItem[] = [...communityItems, ...blogItems].slice(0, MAX_CARDS);

  const isStillLoading = loading || socialLoading;

  // Pad with fallback stories to guarantee at least MIN_CARDS
  if (!isStillLoading && items.length < MIN_CARDS) {
    const needed = MIN_CARDS - items.length;
    const usedIds = new Set(items.map((i) => i.id));
    const fillers = FALLBACK_STORIES.filter((f) => !usedIds.has(f.id)).slice(0, needed);
    items = [...items, ...fillers];
  }

  // If completely empty after loading, show all fallbacks
  if (!isStillLoading && items.length === 0) {
    items = FALLBACK_STORIES.slice(0, 5);
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Stories & Insights
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Stories & Insights from{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Community
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real experiences, health tips, and wellness journeys from across Kenya
          </p>
        </div>

        {/* Grid or loading skeleton */}
        {isStillLoading && items.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card
                key={item.id}
                className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width={768}
                      height={512}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <BookOpen className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  {item.hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={cn(
                        "text-[10px] px-2 py-0.5",
                        item.type === "community"
                          ? "bg-accent/90 text-accent-foreground"
                          : item.type === "blog"
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-muted/90 text-foreground"
                      )}
                    >
                      {item.type === "community" ? (
                        <><Users className="w-3 h-3 mr-1" />Community</>
                      ) : (
                        <><BookOpen className="w-3 h-3 mr-1" />Blog</>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {item.excerpt}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full mt-auto">
                    {item.type === "community" && item.link.startsWith("http") ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.cta}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    ) : (
                      <Link to={item.link}>
                        {item.cta}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA — always visible */}
        <div className="text-center mt-10">
          <Button asChild variant="hero" size="lg" className="rounded-full">
            <Link to="/blog">
              View All Stories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoriesInsights;
