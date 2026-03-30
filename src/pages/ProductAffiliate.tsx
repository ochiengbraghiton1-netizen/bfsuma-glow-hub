import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
import productGeneric from "@/assets/product-generic.jpg";
import { stripHtmlTags, truncateText } from "@/lib/html-utils";

const trustSignals = [
  { icon: Shield, label: "Quality Assured" },
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: Check, label: "Lab Tested" },
];

interface ProductData {
  id: string;
  name: string;
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

const ProductAffiliate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  useEffect(() => {
    if (!slug) {
      setError("Invalid link");
      setLoading(false);
      return;
    }

    const resolve = async () => {
      try {
        // 1) Capture referral param from URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get("ref");
        if (refCode) {
          localStorage.setItem("bf_referral_code", refCode);
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          localStorage.setItem("bf_referral_expiry", expiry.toISOString());
        }

        // 2) Try affiliate link lookup first
        const { data: linkData } = await supabase
          .from("product_affiliate_links")
          .select("product_id, is_active, slug")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        let productId: string | null = null;

        if (linkData) {
          productId = linkData.product_id;

          // Track affiliate click
          await supabase.rpc("increment_affiliate_link_clicks", { link_slug: slug });

          // Store affiliate attribution
          localStorage.setItem(
            "bf_product_affiliate",
            JSON.stringify({
              slug,
              productId,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          // 3) Fallback: try matching slug to product name
          const { data: products } = await supabase
            .from("products")
            .select("id, name")
            .eq("is_active", true);

          if (products?.length) {
            const nameSlug = (name: string) =>
              name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
            const match = products.find((p) => nameSlug(p.name) === slug);
            if (match) productId = match.id;
          }
        }

        if (!productId) {
          setError("Product not found. The link may be invalid or expired.");
          setLoading(false);
          return;
        }

        // 4) Fetch full product
        const { data: prod, error: prodErr } = await supabase
          .from("products")
          .select("id, name, price, benefit, description, image_url, stock_quantity, low_stock_threshold, track_inventory, pv_value, sku")
          .eq("id", productId)
          .eq("is_active", true)
          .maybeSingle();

        if (prodErr) throw prodErr;
        if (!prod) {
          setError("This product is no longer available.");
          setLoading(false);
          return;
        }

        setProduct(prod);
      } catch (err) {
        console.error("Error resolving product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
            <Link to="/">
              <Button className="rounded-full mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock_quantity, product.low_stock_threshold, product.track_inventory);
  const isOutOfStock = stockStatus.status === "out-of-stock";
  const isLowStock = stockStatus.status === "low-stock";
  const favorite = isFavorite(product.id);
  const formattedPrice = formatPrice(product.price);

  const productIds = useMemo(() => [product.id], [product.id]);
  const { data: productRatings } = useProductRatings(productIds);
  const ratings = productRatings?.[product.id];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      priceFormatted: formattedPrice,
      image: product.image_url || undefined,
    });
  };

  const stockBadgeStyles = {
    "in-stock": "bg-green-500/10 text-green-600 dark:text-green-400",
    "low-stock": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    "out-of-stock": "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const seoTitle = `Buy ${product.name} in Kenya | BF SUMA Royal`;
  const plainDescription = stripHtmlTags(product.benefit || product.description);
  const seoDescription = truncateText(plainDescription || `Buy ${product.name} in Kenya. Natural health supplement for better wellness. Order now via WhatsApp for fast SOMA delivery.`, 160);
  const seoImage = product.image_url || `${window.location.origin}/og-image.png`;
  const canonicalUrl = `${window.location.origin}/p/${slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="BF SUMA ROYAL" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="KES" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />

        {/* JSON-LD Product structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: plainDescription || `Premium ${product.name} wellness supplement by BF SUMA Royal`,
            image: seoImage,
            url: canonicalUrl,
            sku: product.sku || product.id,
            brand: { "@type": "Brand", name: "BF SUMA Royal" },
            ...(ratings && ratings.reviewCount > 0 ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: ratings.averageRating.toString(),
                reviewCount: ratings.reviewCount.toString(),
                bestRating: "5",
                worstRating: "1",
              },
            } : {}),
            offers: {
              "@type": "Offer",
              price: product.price.toString(),
              priceCurrency: "KES",
              availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
              url: canonicalUrl,
              priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@type": "Organization", name: "BF SUMA Royal Kenya" },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: "300", currency: "KES" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "KE" },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
                  transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
                },
              },
            },
          })}
        </script>
      </Helmet>
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        {/* Product Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-muted/30 aspect-square">
              <img
                src={product.image_url || productGeneric}
                alt={`${product.name} - BF SUMA Royal natural health supplement`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  favorite ? "bg-primary text-primary-foreground" : "bg-background/80 text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                {["GMP", "Halal"].map((cert) => (
                  <span key={cert} className="text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
                {product.track_inventory && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${stockBadgeStyles[stockStatus.status]}`}>
                      {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                      {stockStatus.label}
                      {isLowStock && <span className="ml-1">— Only {product.stock_quantity} left!</span>}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formattedPrice}
                </p>
                {product.pv_value > 0 && (
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {product.pv_value} PV
                  </span>
                )}
              </div>

              {product.benefit && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Benefit</h3>
                  <p className="text-foreground">{product.benefit}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h3>
                  <RichTextContent content={product.description} className="text-muted-foreground text-sm" />
                </div>
              )}

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-2 pt-2">
                {trustSignals.map((signal) => (
                  <div key={signal.label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <signal.icon className="w-3 h-3 text-primary" />
                    {signal.label}
                  </div>
                ))}
              </div>

              {/* Compliance Disclaimer */}
              <p className="text-[11px] italic" style={{ color: '#888888' }}>
                * These statements have not been evaluated by any food or drug regulatory authority. This product is not intended to diagnose, treat, cure, or prevent any disease. Results may vary. Always consult a qualified healthcare professional before starting any supplement regimen.
              </p>

              {/* CTA */}
              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleAddToCart}
                  variant="premium"
                  className="w-full rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  size="lg"
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Free shipping on orders over KSh 10,000</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Blog Posts */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-border/50 pt-10">
            <RelatedBlogPosts productId={product.id} />
          </div>
        </section>

        {/* Reviews Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="border-t border-border/50 pt-10">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductAffiliate;
