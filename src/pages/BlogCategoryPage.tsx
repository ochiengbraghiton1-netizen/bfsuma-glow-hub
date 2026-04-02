import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, Tag, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  published_at: string | null;
}

interface BlogPostWithCategories extends BlogPost {
  categories?: BlogCategory[];
}

const BlogCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPostWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch all categories + target category in parallel
      const [{ data: allCats }, { data: catData }] = await Promise.all([
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_categories').select('*').eq('slug', slug).single(),
      ]);

      if (allCats) setAllCategories(allCats);

      if (!catData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(catData);

      // Fetch post IDs in this category
      const { data: postCatLinks } = await supabase
        .from('blog_post_categories')
        .select('post_id')
        .eq('category_id', catData.id);

      if (!postCatLinks?.length) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = postCatLinks.map(pc => pc.post_id);
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, video_url, published_at')
        .in('id', postIds)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (postsData) {
        // Attach categories to each post
        const postsWithCats = await Promise.all(
          postsData.map(async (post) => {
            const { data: pCats } = await supabase
              .from('blog_post_categories')
              .select('category_id')
              .eq('post_id', post.id);
            const catIds = pCats?.map(pc => pc.category_id) || [];
            const cats = allCats?.filter(c => catIds.includes(c.id)) || [];
            return { ...post, categories: cats };
          })
        );
        setPosts(postsWithCats);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${category.name} Health Articles Kenya | BF SUMA Royal`;
  const pageDescription = category.description || `Read expert ${category.name} articles, health tips & guides from BF SUMA Royal Kenya. Trusted wellness advice for better health.`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={`https://bfsumaroyal.com/blog/category/${category.slug}`} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://bfsumaroyal.com/blog/category/${category.slug}`} />
        </Helmet>

        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Button asChild variant="ghost" className="mb-6">
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Articles
              </Link>
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
              )}
            </div>

            {/* Category navigation */}
            {allCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                <Button variant="outline" size="sm" onClick={() => navigate('/blog')}>
                  All
                </Button>
                {allCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={cat.slug === slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => navigate(`/blog/category/${cat.slug}`)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No posts in this category yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                    {post.featured_image ? (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {post.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        {post.video_url ? (
                          <Play className="w-10 h-10 text-primary" />
                        ) : (
                          <Tag className="w-10 h-10 text-muted-foreground/50" />
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                      </div>
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.categories.map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <CardTitle className="line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/blog/${post.slug}`}>
                          {post.video_url ? 'Watch Story' : 'Read More'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogCategoryPage;
