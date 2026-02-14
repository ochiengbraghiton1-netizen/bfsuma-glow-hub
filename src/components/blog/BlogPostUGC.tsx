import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, MessageCircle, Users, Play } from 'lucide-react';
import RichTextContent from '@/components/ui/rich-text-content';
import { format } from 'date-fns';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  benefit: string | null;
  image_url: string | null;
}

interface UGCPostProps {
  post: {
    title: string;
    content: string | null;
    excerpt: string | null;
    featured_image: string | null;
    video_url: string | null;
    published_at: string | null;
    categories?: BlogCategory[];
  };
  relatedProducts: RelatedProduct[];
}

const getEmbedUrl = (url: string): string | null => {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;

  // Instagram
  const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;

  return null;
};

const BlogPostUGC = ({ post, relatedProducts }: UGCPostProps) => {
  const embedUrl = post.video_url ? getEmbedUrl(post.video_url) : null;

  return (
    <div className="space-y-10">
      {/* Video Section */}
      {embedUrl && (
        <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
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
      )}

      {/* If no embed but has video URL, show link */}
      {post.video_url && !embedUrl && (
        <a
          href={post.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <Play className="w-8 h-8 text-primary" />
          <span className="font-medium text-foreground">Watch Video</span>
        </a>
      )}

      {/* Story Content */}
      <div>
        <RichTextContent content={post.content || ''} className="prose-lg" />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-xl font-bold text-foreground">Featured Products</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/p/${product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`}
                className="flex gap-4 p-4 rounded-xl bg-background border hover:shadow-md transition-shadow"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{product.name}</p>
                  {product.benefit && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.benefit}</p>
                  )}
                  <p className="text-sm font-bold text-primary mt-1">
                    KSh {product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-6 md:p-8 text-center space-y-4 border border-primary/20">
        <h3 className="text-2xl font-bold text-foreground">Ready to Start Your Wellness Journey?</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Join thousands of satisfied customers who have transformed their health with BF SUMA products.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild variant="premium" size="lg">
            <Link to="/#products">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shop Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <a
              href="https://wa.me/254742167567?text=Hi%2C%20I%27d%20like%20to%20order%20a%20BF%20SUMA%20product"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Order via WhatsApp
            </a>
          </Button>
          <Button asChild variant="glass" size="lg" className="rounded-full border-primary/30">
            <Link to="/join-business">
              <Users className="w-4 h-4 mr-2" />
              Become an Affiliate
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostUGC;
