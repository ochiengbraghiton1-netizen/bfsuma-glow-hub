import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { motion } from 'framer-motion';

interface StoryPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  published_at: string | null;
}

const CommunityStories = () => {
  const [stories, setStories] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, isInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const fetchStories = async () => {
      // Fetch featured published posts that are in UGC/Testimonial categories
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, video_url, published_at, is_featured')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (posts && posts.length > 0) {
        setStories(posts);
      } else {
        // Fallback: get latest published posts
        const { data: latestPosts } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image, video_url, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6);

        setStories(latestPosts || []);
      }
      setLoading(false);
    };

    fetchStories();
  }, []);

  if (loading || stories.length === 0) return null;

  return (
    <section ref={ref} className="py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Real Stories From Our Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how BF SUMA products are transforming lives across Kenya and beyond
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {story.featured_image ? (
                    <img
                      src={story.featured_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <Play className="w-10 h-10 text-primary/50" />
                    </div>
                  )}
                  {story.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  {story.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {story.excerpt}
                    </p>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full mt-auto">
                    <Link to={`/blog/${story.slug}`}>
                      {story.video_url ? 'Watch Story' : 'Read Story'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="hero" size="lg">
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

export default CommunityStories;
