import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowRight } from 'lucide-react';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  video_url: string | null;
}

interface RelatedBlogPostsProps {
  productId: string;
}

const RelatedBlogPosts = ({ productId }: RelatedBlogPostsProps) => {
  const [posts, setPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      // Get post IDs linked to this product
      const { data: links } = await supabase
        .from('blog_post_products')
        .select('post_id')
        .eq('product_id', productId);

      if (!links?.length) return;

      const postIds = links.map(l => l.post_id);

      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('id, title, slug, featured_image, video_url')
        .in('id', postIds)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);

      setPosts(postsData || []);
    };

    fetchRelated();
  }, [productId]);

  if (posts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">See Real Customer Experiences</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow group">
              <div className="flex gap-3 p-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {post.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-3 h-3 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    {post.video_url ? 'Watch' : 'Read'} Story <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedBlogPosts;
