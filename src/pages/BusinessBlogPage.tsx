import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Calendar, Tag, Play, Search, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface BusinessPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  is_featured: boolean;
  published_at: string | null;
}

const PAGE_SIZE = 9;

const BusinessBlogPage = () => {
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, video_url, is_featured, published_at")
        .eq("status", "published")
        .eq("content_type", "business")
        .order("published_at", { ascending: false });
      setPosts((data as BusinessPost[]) || []);
      setLoading(false);
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  const featured = filtered.filter((p) => p.is_featured).slice(0, 3);
  const rest = filtered.filter((p) => !featured.includes(p));
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Helmet>
          <title>Business Opportunity Blog | BF SUMA Royal Kenya</title>
          <meta
            name="description"
            content="Real stories, training and guides for the BF SUMA Royal income opportunity in Kenya. Learn how distributors are building extra income with wellness."
          />
          <link rel="canonical" href="https://bfsumaroyal.com/business/blog" />
          <meta property="og:title" content="Business Opportunity Blog | BF SUMA Royal Kenya" />
          <meta property="og:description" content="Real stories, training and guides for distributors and entrepreneurs." />
          <meta property="og:url" content="https://bfsumaroyal.com/business/blog" />
          <meta property="og:type" content="website" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://bfsumaroyal.com/" },
                { "@type": "ListItem", position: 2, name: "Business Hub", item: "https://bfsumaroyal.com/business" },
                { "@type": "ListItem", position: 3, name: "Business Blog", item: "https://bfsumaroyal.com/business/blog" },
              ],
            })}
          </script>
        </Helmet>

        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Button asChild variant="ghost" className="mb-6">
              <Link to="/business">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Business Hub
              </Link>
            </Button>

            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary px-3 py-1">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                Business Opportunity
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Business Opportunity Articles</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Practical guides, real distributor stories and training to help you build income with BF SUMA Royal.
              </p>
            </div>

            <div className="max-w-md mx-auto mb-10 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search business articles…"
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No business articles match your search yet.</p>
              </div>
            ) : (
              <>
                {featured.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Featured</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                      {featured.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {paged.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">All articles</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {paged.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const PostCard = ({ post }: { post: BusinessPost }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
    {post.featured_image ? (
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={post.featured_image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {post.video_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <Tag className="w-10 h-10 text-muted-foreground/50" />
      </div>
    )}
    <CardHeader>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Calendar className="h-4 w-4" />
        {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
      </div>
      <CardTitle className="line-clamp-2">
        <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
          {post.title}
        </Link>
      </CardTitle>
      {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
    </CardHeader>
    <CardContent className="mt-auto">
      <Button asChild variant="outline" className="w-full">
        <Link to={`/blog/${post.slug}`}>{post.video_url ? "Watch Story" : "Read More"}</Link>
      </Button>
    </CardContent>
  </Card>
);

export default BusinessBlogPage;
