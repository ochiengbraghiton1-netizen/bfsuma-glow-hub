import { useState, useEffect, useRef } from "react";
import { Instagram, Facebook, Twitter, Video, Heart, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSocialPosts, SocialPost, SocialContentCategory } from "@/hooks/use-social-posts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const platforms = [
  { key: "all", label: "All", icon: Heart },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "twitter", label: "X / Twitter", icon: Twitter },
  { key: "tiktok", label: "TikTok", icon: Video },
];

const platformColors: Record<string, { color: string; bgColor: string }> = {
  instagram: { color: "text-pink-500", bgColor: "bg-pink-500/10" },
  facebook: { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  twitter: { color: "text-sky-500", bgColor: "bg-sky-500/10" },
  tiktok: { color: "text-foreground", bgColor: "bg-muted" },
};

const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Video,
};

const ElfsightWidget = ({ widgetId }: { widgetId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!widgetId || scriptLoaded.current) return;

    // Load Elfsight script once
    if (!document.querySelector('script[src*="elfsight.com"]')) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.async = true;
      document.head.appendChild(script);
    }
    scriptLoaded.current = true;
  }, [widgetId]);

  if (!widgetId) return null;

  return (
    <div className="container mx-auto px-4 mb-16">
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-3 border-pink-500/30 text-pink-500 px-4 py-1">
          <Instagram className="w-3 h-3 mr-1.5" />
          Live Feed
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Follow Us on Instagram
        </h2>
        <p className="text-muted-foreground mt-2">
          Latest posts from our Instagram — updated in real time
        </p>
      </div>
      <div
        ref={containerRef}
        className={`elfsight-app-${widgetId}`}
      />
    </div>
  );
};

const CommunityPage = () => {
  const [activePlatform, setActivePlatform] = useState("all");
  const { data: posts, isLoading } = useSocialPosts({
    platform: activePlatform === "all" ? undefined : activePlatform,
  });
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidget = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "instagram_widget")
        .maybeSingle();
      if (data?.content) {
        setWidgetId(data.content.trim());
      }
    };
    fetchWidget();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO
        title="Success Stories & Testimonials Kenya | BF SUMA Royal"
        description="Real testimonials from BF SUMA users in Kenya. See how our natural supplements transform health & build businesses. Join our growing community today."
        path="/community"
      />

      <Header />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero */}
        <div className="container mx-auto px-4 mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1">
            #BFSUMARoyal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Real stories from real people. See how our community uses BF SUMA products
            to transform their health and build successful businesses.
          </p>

          {/* Platform filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {platforms.map((p) => {
              const PIcon = p.icon;
              const isActive = activePlatform === p.key;
              return (
                <Button
                  key={p.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-full gap-1.5", isActive && "shadow-md")}
                  onClick={() => setActivePlatform(p.key)}
                >
                  <PIcon className="w-4 h-4" />
                  {p.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Instagram Live Feed Widget */}
        {widgetId && <ElfsightWidget widgetId={widgetId} />}

        {/* Curated Grid */}
        <div className="container mx-auto px-4">
          {posts && posts.length > 0 && (
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Curated Community Posts
              </h2>
              <p className="text-muted-foreground mt-2">Hand-picked stories from our community</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/30 animate-pulse">
                  <div className="aspect-square bg-muted/50 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-20">
              <Instagram className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Community posts will appear here once they're added. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {posts.map((post, index) => {
                const pConfig = platformColors[post.platform] || platformColors.instagram;
                const PIcon = platformIcons[post.platform] || Instagram;

                return (
                  <a
                    key={post.id}
                    href={post.post_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ animation: `fade-in 0.4s ease-out ${index * 0.05}s both` }}
                  >
                    {post.image_url && (
                      <div className="aspect-square overflow-hidden bg-muted/30 relative">
                        <img
                          src={post.image_url}
                          alt={`${post.author_name}'s post`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <div className={cn("p-1.5 rounded-full backdrop-blur-sm", pConfig.bgColor)}>
                            <PIcon className={cn("w-3.5 h-3.5", pConfig.color)} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {post.author_avatar_url ? (
                          <img src={post.author_avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", pConfig.bgColor)}>
                            <PIcon className={cn("w-3.5 h-3.5", pConfig.color)} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{post.author_name}</p>
                          {post.author_handle && (
                            <p className="text-xs text-muted-foreground truncate">@{post.author_handle}</p>
                          )}
                        </div>
                      </div>
                      {post.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      )}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-primary font-medium">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        {post.likes_count > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.likes_count.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
