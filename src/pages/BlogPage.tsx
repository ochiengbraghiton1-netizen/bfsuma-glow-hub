import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, Clock, Tag, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import RichTextContent from '@/components/ui/rich-text-content';
import BlogPostUGC from '@/components/blog/BlogPostUGC';
import SocialShareButtons from '@/components/blog/SocialShareButtons';
import BlogLeadCapture, { type BlogQuizOption } from '@/components/blog/BlogLeadCapture';
import BlogRelatedProducts from '@/components/blog/BlogRelatedProducts';
import RelatedWellnessHubs from '@/components/RelatedWellnessHubs';
import { stripHtmlTags } from '@/lib/html-utils';
import { SITE_BASE_URL } from '@/config/routes';
import { generateBlogAltText } from '@/lib/image-seo';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  video_url: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  content_type: string | null;
  published_at: string | null;
  created_at: string;
}

interface BlogPostWithCategories extends BlogPost {
  categories?: BlogCategory[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  benefit: string | null;
  image_url: string | null;
}

const UGC_CATEGORY_SLUGS = ['ugc-testimonials', 'ugc', 'testimonials'];

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPostWithCategories[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (categoriesData) setCategories(categoriesData);

      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('content_type', 'health')
        .order('published_at', { ascending: false });

      if (!error && postsData) {
        const postsWithCategories = await Promise.all(
          postsData.map(async (post) => {
            const { data: postCategories } = await supabase
              .from('blog_post_categories')
              .select('category_id')
              .eq('post_id', post.id);

            const categoryIds = postCategories?.map(pc => pc.category_id) || [];
            const postCats = categoriesData?.filter(c => categoryIds.includes(c.id)) || [];
            return { ...post, categories: postCats };
          })
        );
        setPosts(postsWithCategories);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.categories?.some(c => c.slug === selectedCategory))
    : posts;

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
        <title>Health Tips & Wellness Blog Kenya | BF SUMA Royal</title>
        <meta name="description" content="Expert health tips, supplement guides & wellness advice for Kenyans. Boost immunity, relieve joint pain & improve energy naturally. Read our latest articles." />
        <link rel="canonical" href="https://bfsumaroyal.com/blog" />
        <meta property="og:title" content="Health Tips & Wellness Blog Kenya | BF SUMA Royal" />
        <meta property="og:description" content="Expert health tips, supplement guides & wellness advice. Read our latest articles." />
        <meta property="og:url" content="https://bfsumaroyal.com/blog" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://bfsumaroyal.com/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://bfsumaroyal.com/blog" },
            ],
          })}
        </script>
      </Helmet>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover health tips, wellness advice, and the latest updates from BF SUMA Kenya
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link to={`/blog/category/${category.slug}`}>
                    {category.name}
                  </Link>
                </Button>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                  {post.featured_image ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={post.featured_image}
                        alt={generateBlogAltText(post.title)}
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
                  <CardContent>
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
    </>
  );
};

const BlogPostView = ({ slug, expectedContentType }: { slug: string; expectedContentType: 'health' | 'business' }) => {
  const [post, setPost] = useState<BlogPostWithCategories | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<{ name: string; slug: string; keywords?: string[] }[]>([]);
  const [quizOptions, setQuizOptions] = useState<BlogQuizOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('content_type', expectedContentType)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch categories
      const { data: postCategories } = await supabase
        .from('blog_post_categories')
        .select('category_id')
        .eq('post_id', data.id);

      const categoryIds = postCategories?.map(pc => pc.category_id) || [];
      let cats: BlogCategory[] = [];
      if (categoryIds.length > 0) {
        const { data: catData } = await supabase
          .from('blog_categories')
          .select('*')
          .in('id', categoryIds);
        cats = catData || [];
      }

      setPost({ ...data, categories: cats });

      // Fetch per-post quiz options
      const { data: quizRows } = await supabase
        .from('blog_post_quiz_options')
        .select('id, label, reason, product_id, display_order')
        .eq('post_id', data.id)
        .order('display_order');

      if (quizRows?.length) {
        const { data: quizProducts } = await supabase
          .from('products')
          .select('id, name, slug')
          .in('id', quizRows.map(r => r.product_id));

        const prodMap = new Map((quizProducts || []).map(p => [p.id, p]));
        setQuizOptions(
          quizRows.map(r => ({
            id: r.id,
            label: r.label,
            reason: r.reason,
            product: prodMap.get(r.product_id) || null,
          }))
        );
      } else {
        setQuizOptions([]);
      }


      // Fetch related products
      const { data: productLinks } = await supabase
        .from('blog_post_products')
        .select('product_id')
        .eq('post_id', data.id);

      if (productLinks?.length) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, slug, price, benefit, image_url')
          .in('id', productLinks.map(l => l.product_id))
          .eq('is_active', true);

        setRelatedProducts(products || []);
      }

      // Fetch all active product names + keywords for auto-linking
      const { data: allProds } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true);

      if (allProds) {
        // Fetch keywords for all products
        const { data: keywordsData } = await supabase
          .from('product_keywords' as any)
          .select('product_id, keyword');

        const keywordMap = new Map<string, string[]>();
        for (const kw of (keywordsData || []) as any[]) {
          if (!keywordMap.has(kw.product_id)) keywordMap.set(kw.product_id, []);
          keywordMap.get(kw.product_id)!.push(kw.keyword);
        }

        setAllProducts(
          allProds.map((p) => ({
            name: p.name,
            slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            keywords: keywordMap.get(p.id) || [],
          }))
        );
      }

      setLoading(false);
    };

    fetchPost();
  }, [slug, expectedContentType]);

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
        <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
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

  const isUGC = post.categories?.some(c => UGC_CATEGORY_SLUGS.includes(c.slug));
  const isBusiness = post.content_type === 'business';
  const hubPath = isBusiness ? '/business/blog' : '/blog';
  const hubLabel = isBusiness ? 'Business Hub' : 'Blog';

  const plainContent = stripHtmlTags(post.content);
  const wordCount = plainContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const metaDescription = post.meta_description || stripHtmlTags(post.excerpt) || '';

  const canonicalUrl = `https://bfsumaroyal.com${hubPath}/${post.slug}`;
  const articleImage = post.featured_image || 'https://bfsumaroyal.com/og-image.png';

  return (
    <>
      <Helmet>
        <title>{post.meta_title || `${post.title} | Health Guide Kenya`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:image" content={articleImage} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={articleImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: metaDescription || stripHtmlTags(post.excerpt) || undefined,
            image: articleImage,
            url: canonicalUrl,
            datePublished: post.published_at || post.created_at,
            dateModified: post.published_at || post.created_at,
            wordCount: wordCount,
            articleSection: post.categories?.map(c => c.name) || undefined,
            ...(post.video_url && {
              video: {
                '@type': 'VideoObject',
                contentUrl: post.video_url,
                name: post.title,
                description: metaDescription || stripHtmlTags(post.excerpt) || undefined,
                thumbnailUrl: articleImage,
                uploadDate: post.published_at || post.created_at,
              },
            }),
            author: {
              '@type': 'Organization',
              name: 'BF SUMA Royal Kenya',
              url: 'https://bfsumaroyal.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'BF SUMA Royal Kenya',
              url: 'https://bfsumaroyal.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://bfsumaroyal.com/favicon.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bfsumaroyal.com/' },
              { '@type': 'ListItem', position: 2, name: hubLabel, item: `https://bfsumaroyal.com${hubPath}` },
              { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
            ],
          })}
        </script>
      </Helmet>

      <article className="py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link to={hubPath}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {hubLabel}
            </Link>
          </Button>

          {/* Video or Featured Image (non-UGC only, UGC leads with video via BlogPostUGC) */}
          {!isUGC && (() => {
            if (post.video_url) {
              const ytMatch = post.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              if (ytMatch) {
                const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                return (
                  <div className="rounded-2xl overflow-hidden bg-black shadow-xl mb-8">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={post.title}
                      />
                    </div>
                  </div>
                );
              }
            }
            if (post.featured_image) {
              return (
                <div className="aspect-video overflow-hidden rounded-lg mb-8">
                  <img src={post.featured_image} alt={generateBlogAltText(post.title)} className="w-full h-full object-cover" />
                </div>
              );
            }
            return null;
          })()}

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>
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
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-border/50">
              <SocialShareButtons
                url={`${SITE_BASE_URL}${hubPath}/${post.slug}`}
                title={post.title}
              />
            </div>
          </header>

          <BlogLeadCapture
            contentType={expectedContentType}
            postSlug={post.slug}
            postTitle={post.title}
            quizOptions={quizOptions}
          />

          {/* Render UGC layout or standard content */}
          {isUGC ? (
            <BlogPostUGC post={post} relatedProducts={relatedProducts} />
          ) : (
            <>
              <RichTextContent content={post.content || ''} className="prose-lg" autoLinkProductList={allProducts} />

              {/* Share / CTA */}
              <div className="mt-12 pt-8 border-t">
                <div className="mb-6">
                  <SocialShareButtons
                    url={`${SITE_BASE_URL}${hubPath}/${post.slug}`}
                    title={post.title}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-muted-foreground">Enjoyed this article?</p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link to="/#products">View Our Products</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={hubPath}>More Articles</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Related Products */}
              <BlogRelatedProducts products={relatedProducts} />

              {/* Related Wellness Hubs */}
              <RelatedWellnessHubs blogPostId={post.id} />
            </>
          )}
        </div>
      </article>
    </>
  );
};

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const expectedContentType = location.pathname.startsWith('/business/blog/') ? 'business' : 'health';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {slug ? <BlogPostView slug={slug} expectedContentType={expectedContentType} /> : <BlogList />}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
