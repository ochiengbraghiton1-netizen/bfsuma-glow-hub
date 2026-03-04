import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Video, Heart, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocialPosts, SocialPost } from "@/hooks/use-social-posts";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const platformConfig: Record<string, { icon: typeof Instagram; label: string; color: string; bgColor: string }> = {
  instagram: { icon: Instagram, label: "Instagram", color: "text-pink-500", bgColor: "bg-pink-500/10" },
  facebook: { icon: Facebook, label: "Facebook", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  twitter: { icon: Twitter, label: "X / Twitter", color: "text-sky-500", bgColor: "bg-sky-500/10" },
  tiktok: { icon: Video, label: "TikTok", color: "text-foreground", bgColor: "bg-muted" },
};

const SocialPostCard = ({ post, index }: { post: SocialPost; index: number }) => {
  const platform = platformConfig[post.platform] || platformConfig.instagram;
  const PlatformIcon = platform.icon;

  return (
    <a
      href={post.post_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animation: `fade-in 0.4s ease-out ${index * 0.08}s both` }}
    >
      {/* Image */}
      {post.image_url && (
        <div className="aspect-square overflow-hidden bg-muted/30">
          <img
            src={post.image_url}
            alt={`${post.author_name}'s post on ${platform.label}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          {post.author_avatar_url ? (
            <img
              src={post.author_avatar_url}
              alt={post.author_name}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", platform.bgColor)}>
              <PlatformIcon className={cn("w-4 h-4", platform.color)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{post.author_name}</p>
            {post.author_handle && (
              <p className="text-xs text-muted-foreground truncate">@{post.author_handle}</p>
            )}
          </div>
          <PlatformIcon className={cn("w-4 h-4 shrink-0", platform.color)} />
        </div>

        {/* Text content */}
        {post.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-primary font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {post.likes_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3" />
              <span>{post.likes_count.toLocaleString()}</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            View post <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

const SocialFeed = () => {
  const { data: posts, isLoading } = useSocialPosts({ featured: true, limit: 6 });
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.2 });

  if (isLoading) return null;
  if (!posts || posts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className={cn("text-center mb-12 transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1">
            <Instagram className="w-3.5 h-3.5 mr-1.5" />
            Community
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our Community{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              in Action
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See how our community is transforming lives with BF SUMA products. Real stories from real people.
          </p>
        </div>

        <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 transition-all duration-700 delay-200", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          {posts.map((post, i) => (
            <SocialPostCard key={post.id} post={post} index={i} />
          ))}
        </div>

        <div className={cn("text-center mt-10 transition-all duration-700 delay-400", isInView ? "opacity-100" : "opacity-0")}>
          <Button variant="outline" size="lg" asChild className="group rounded-full">
            <Link to="/community">
              View All Community Posts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;
