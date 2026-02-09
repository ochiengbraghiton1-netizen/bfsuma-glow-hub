import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog | BF SUMA Kenya - Health & Wellness Tips</title>
        <meta name="description" content="Read the latest health tips, wellness advice, and product insights from BF SUMA Kenya." />
      </Helmet>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover health tips, wellness advice, and the latest updates from BF SUMA Kenya
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    {post.excerpt && (
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/blog/${post.slug}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const BlogPostView = ({ slug }: { slug: string }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  // Estimate reading time (avg 200 words per minute)
  const wordCount = post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | BF SUMA Kenya</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image,
            datePublished: post.published_at,
            dateModified: post.created_at,
            author: {
              '@type': 'Organization',
              name: 'BF SUMA Kenya',
            },
            publisher: {
              '@type': 'Organization',
              name: 'BF SUMA Kenya',
            },
          })}
        </script>
      </Helmet>

      <article className="py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {readingTime} min read
              </div>
            </div>
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Share / CTA */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground">Enjoyed this article?</p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/#products">View Our Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/blog">More Articles</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {slug ? <BlogPostView slug={slug} /> : <BlogList />}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
