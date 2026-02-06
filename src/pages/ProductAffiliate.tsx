import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const ProductAffiliate = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveLink = async () => {
      if (!slug) {
        setError('Invalid affiliate link');
        return;
      }

      try {
        // Look up the affiliate link - exact match, case-sensitive
        const { data: linkData, error: linkError } = await supabase
          .from('product_affiliate_links')
          .select('product_id, is_active, slug')
          .eq('slug', slug)
          .maybeSingle();

        if (linkError) {
          console.error('Error fetching affiliate link:', linkError);
          throw linkError;
        }

        if (!linkData) {
          setError('Affiliate link not found');
          return;
        }

        if (!linkData.is_active) {
          setError('This affiliate link is no longer active');
          return;
        }

        // Track the click using the RPC function
        const { error: clickError } = await supabase.rpc('increment_affiliate_link_clicks', { 
          link_slug: slug 
        });
        
        if (clickError) {
          console.error('Error tracking click:', clickError);
          // Don't block redirect for click tracking errors
        }

        // Get the product details to verify it exists
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', linkData.product_id)
          .maybeSingle();

        if (productError) {
          console.error('Error fetching product:', productError);
          throw productError;
        }

        if (!product) {
          setError('The product associated with this link no longer exists');
          return;
        }

        // Store affiliate attribution in localStorage for order tracking
        localStorage.setItem('bf_product_affiliate', JSON.stringify({
          slug,
          productId: product.id,
          productName: product.name,
          timestamp: new Date().toISOString(),
        }));

        // Redirect to homepage with product section
        navigate('/#products', { replace: true });

      } catch (err) {
        console.error('Error resolving affiliate link:', err);
        setError('Failed to process affiliate link. Please try again.');
      }
    };

    resolveLink();
  }, [slug, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Link Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecting you to the product...</p>
      </div>
    </div>
  );
};

export default ProductAffiliate;
