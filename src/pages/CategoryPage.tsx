import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import categoryPlaceholder from '@/assets/category-placeholder.jpg';
import { generateCategoryAltText } from "@/lib/image-seo";
import { storageSrcSet, SIZES_CARD } from "@/lib/image-url";
import ContentMediaBlock from '@/components/ContentMediaBlock';
import { fetchContentMedia, type MediaMap } from '@/lib/content-media';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Product {
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
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch all active categories (used when showing category list)
  const { data: allCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Category[];
    },
    enabled: !slug, // only fetch when listing categories
  });

  // Fetch single category by slug
  const {
    data: category,
    isLoading: loadingCategory,
    isError: categoryError,
  } = useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
    retry: false,
  });

  const { data: media = {} } = useQuery<MediaMap>({
    queryKey: ['category-content-media', category?.id],
    queryFn: () => fetchContentMedia('category', category?.id || ''),
    enabled: !!category?.id,
  });

  // Fetch products for the category (via join table)
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['category-products', category?.id],
    queryFn: async () => {
      if (!category) return [];

      // Get product IDs from join table
      const { data: productCategories, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', category.id);

      if (pcError) throw pcError;
      if (!productCategories || productCategories.length === 0) return [];

      const productIds = productCategories.map(pc => pc.product_id);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, benefit, description, image_url, stock_quantity, low_stock_threshold, track_inventory')
        .in('id', productIds)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!category?.id,
  });

  const loading = loadingCategories || loadingCategory || loadingProducts;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-header flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (slug && categoryError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-header flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Link to="/category">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Categories
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Show category listing if no slug
  if (!slug) {
    return (
      <>
        <Helmet>
          <title>Health Supplements Kenya | Shop by Category & Price | BF Suma Royal</title>
          <meta name="description" content="Browse BF Suma Royal's full range of health supplements in Kenya by category. See prices, check authenticity, and order via WhatsApp or M-Pesa." />
          {/* /products and /category render the same listing, so both consolidate on /category. */}
          <link rel="canonical" href="https://bfsumaroyal.com/category" />
          <meta property="og:title" content="Health Supplements Kenya | Shop by Category & Price | BF Suma Royal" />
          <meta property="og:description" content="Browse BF Suma Royal's full range of health supplements in Kenya by category. See prices, check authenticity, and order via WhatsApp or M-Pesa." />
          <meta property="og:url" content="https://bfsumaroyal.com/category" />
          <meta property="og:type" content="website" />
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-header pb-12">
            <div className="container mx-auto px-4 pt-8">

              <h1 className="text-3xl font-bold mb-8">Product Categories</h1>

              {allCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No categories available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="group block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={cat.image_url || categoryPlaceholder}
                          srcSet={storageSrcSet(cat.image_url)}
                          sizes={SIZES_CARD}
                          width={400}
                          height={400}
                          decoding="async"
                          alt={generateCategoryAltText(cat.name)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h2 className="font-bold text-lg text-white drop-shadow-md">
                            {cat.name}
                          </h2>
                          {cat.description && (
                            <p className="text-sm text-white/80 mt-0.5 line-clamp-2 drop-shadow-sm">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Show products in category
  return (
    <>
      <Helmet>
        <title>{`Best ${category?.name} Supplements in Kenya | BF SUMA Royal`}</title>
        <meta name="description" content={`Shop the best ${category?.name} supplements in Kenya. Improve your health naturally with trusted, lab-tested products. Fast delivery nationwide. Order now.`} />
        <link rel="canonical" href={`https://bfsumaroyal.com/category/${slug}`} />
        <meta property="og:title" content={`Best ${category?.name} Supplements in Kenya | BF SUMA Royal`} />
        <meta property="og:description" content={`Shop top ${category?.name} supplements in Kenya. Natural, effective products with fast delivery.`} />
        <meta property="og:url" content={`https://bfsumaroyal.com/category/${slug}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://bfsumaroyal.com/" },
              { "@type": "ListItem", position: 2, name: "Categories", item: "https://bfsumaroyal.com/category" },
              { "@type": "ListItem", position: 3, name: category?.name, item: `https://bfsumaroyal.com/category/${slug}` },
            ],
          })}
        </script>
        {products.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${category?.name} Supplements`,
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://bfsumaroyal.com/product/${p.slug}`,
                name: p.name,
              })),
            })}
          </script>
        )}
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-header pb-12">
          <div className="container mx-auto px-4 pt-8">
            <Link to="/category" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All Categories
            </Link>

            <div className={`mb-8 ${media.hero ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center' : ''}`}>
              <div>
                <h1 className="text-3xl font-bold">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground mt-2">{category.description}</p>
                )}
              </div>
              {media.hero && (
                <ContentMediaBlock item={media.hero} rounded="rounded-lg" />
              )}
            </div>

            {media.recognition && (
              <section className="mb-8 grid gap-5 md:grid-cols-2 md:items-center">
                <ContentMediaBlock item={media.recognition} rounded="rounded-lg" />
                <div>
                  <h2 className="text-xl font-semibold">{media.recognition.heading || 'Does this sound familiar?'}</h2>
                  <p className="mt-2 text-muted-foreground">Explore options selected for this everyday wellness goal.</p>
                </div>
              </section>
            )}

            {media.desired_outcome && (
              <section className="mb-8 grid gap-5 md:grid-cols-2 md:items-center">
                <div className="md:order-2">
                  <ContentMediaBlock item={media.desired_outcome} rounded="rounded-lg" />
                </div>
                <div className="md:order-1">
                  <h2 className="text-xl font-semibold">{media.desired_outcome.heading || 'Support your wellness routine'}</h2>
                  <p className="mt-2 text-muted-foreground">Compare genuine options and choose what fits your goals and daily routine.</p>
                </div>
              </section>
            )}

            {media.education && (
              <section className="mb-8 grid gap-5 md:grid-cols-2 md:items-center">
                <ContentMediaBlock item={media.education} rounded="rounded-lg" />
                <div>
                  <h2 className="text-xl font-semibold">{media.education.heading || 'Understand your options'}</h2>
                  <p className="mt-2 text-muted-foreground">Review each product's details and ingredients before deciding what may suit you.</p>
                </div>
              </section>
            )}

            {products.length === 0 ? (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground">Products will appear here when added to this category.</p>
              </div>
            ) : (
              <>
                {media.product_context && (
                  <div className="mb-8">
                    {media.product_context.heading && <h2 className="text-xl font-semibold mb-4">{media.product_context.heading}</h2>}
                    <ContentMediaBlock item={media.product_context} rounded="rounded-lg" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={`KSh ${product.price.toLocaleString()}`}
                      numericPrice={product.price}
                      benefit={product.benefit || ''}
                      description={product.description || ''}
                      image={product.image_url || ''}
                      stockQuantity={product.stock_quantity}
                      lowStockThreshold={product.low_stock_threshold}
                      trackInventory={product.track_inventory}
                    />
                  ))}
                </div>
              </>
            )}

            {media.trust && (
              <section className="mt-10 border-y border-border py-8">
                <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{media.trust.heading || 'Genuine support from our team'}</h2>
                    <p className="mt-2 text-muted-foreground">Ask questions before ordering and get guidance from our Kenya-based team.</p>
                  </div>
                  <ContentMediaBlock item={media.trust} rounded="rounded-lg" />
                </div>
              </section>
            )}

            {media.closing && (
              <div className="mt-10">
                {media.closing.heading && <h2 className="text-xl font-semibold mb-4">{media.closing.heading}</h2>}
                <ContentMediaBlock item={media.closing} rounded="rounded-lg" />
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;
