import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingCart, Heart, ArrowLeft, Shield, Leaf, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getStockStatus } from "@/hooks/use-products";
import RichTextContent from "@/components/ui/rich-text-content";
import ProductReviews from "@/components/ProductReviews";
import { useProductRatings } from "@/hooks/use-product-ratings";
import RelatedBlogPosts from "@/components/blog/RelatedBlogPosts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import productGeneric from "@/assets/product-generic.webp";
import { stripHtmlTags, truncateText } from "@/lib/html-utils";

const trustSignals = [
  { icon: Shield, label: "Quality Assured" },
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: Check, label: "Lab Tested" },
];

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  benefit: string | null;
  description: string | null;
  image_url: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  pv_value: number;
  sku: string | null;
}

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const productIds = useMemo(() => (product ? [product.id] : []), [product]);
  const { data: productRatings } = useProductRatings(productIds);
  const ratings = product ? productRatings?.[product.id] : undefined;

  useEffect(() => {
    if (!slug) {
      setError("Invalid URL");
      setLoading(false);
      return;
    }

    const resolve = async () => {
      try {
        // If slug looks like a UUID, redirect to the slug-based URL
        if (isUUID(slug)) {
          const { data } = await supabase
            .from("products")
            .select("slug")
            .eq("id", slug)
            .eq("is_active", true)
            .maybeSingle();

          if (data?.slug) {
            navigate(`/product/${data.slug}`, { replace: true });
            return;
          }
          setError("Product not found.");
          setLoading(false);
          return;
        }

        // Fetch product by slug
        const { data, error: fetchErr } = await supabase
          .from("products")
          .select("id, name, slug, price, benefit, description, image_url, stock_quantity, low_stock_threshold, track_inventory, pv_value, sku")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          setError("Product not found.");
          setLoading(false);
          return;
        }

        setProduct(data as ProductData);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/#products">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock_quantity, product.low_stock_threshold, product.track_inventory);
  const isOutOfStock = stockStatus.status === "out-of-stock";
  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      priceFormatted: formatPrice(product.price),
      image: product.image_url || undefined,
    });
  };

  const plainDescription = product.description ? stripHtmlTags(product.description) : "";
  const seoTitle = `${product.name} | BF SUMA Royal Kenya`;
  const seoDescription = truncateText(
    plainDescription || `Buy ${product.name} in Kenya. Natural health supplement for better wellness.`,
    160
  );
  const seoImage = product.image_url || `${window.location.origin}/og-image.png`;
  const canonicalUrl = `https://bfsumaroyal.com/product/${product.slug}`;

  const stockBadgeStyles = {
    "in-stock": "bg-green-500/10 text-green-600",
    "low-stock": "bg-yellow-500/10 text-yellow-600",
    "out-of-stock": "bg-red-500/10 text-red-600",
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="KES" />
        <meta property="product:availability" content={isOutOfStock ? "out of stock" : "in stock"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: seoDescription,
            image: seoImage,
            sku: product.sku || product.id,
            url: canonicalUrl,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "KES",
              availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "BF SUMA Royal Kenya" },
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <Link
              to="/#products"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Link>

            {/* Product Detail Grid */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden bg-card border">
                <img
                  src={product.image_url || productGeneric}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                  loading="eager"
                />
                {product.track_inventory && (
                  <span
                    className={`absolute top-4 left-4 text-xs font-medium px-3 py-1 rounded-full ${stockBadgeStyles[stockStatus.status]}`}
                  >
                    {stockStatus.label}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
                {product.benefit && (
                  <p className="text-lg text-muted-foreground mb-4">{product.benefit}</p>
                )}
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
                  {formatPrice(product.price)}
                </p>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {trustSignals.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 rounded-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart className={`w-5 h-5 ${favorite ? "fill-primary text-primary" : ""}`} />
                  </Button>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <RichTextContent content={product.description} />
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <ProductReviews productId={product.id} productName={product.name} />

            {/* Related Blog Posts */}
            <RelatedBlogPosts productId={product.id} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductPage;
