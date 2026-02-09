import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelmetProvider, Helmet } from 'react-helmet-async';

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
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slug) {
        // Show all categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        setAllCategories(categoriesData || []);
        setLoading(false);
        return;
      }

      // Fetch category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (categoryError || !categoryData) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      // Fetch products in this category via join table
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryData.id);

      if (productCategories && productCategories.length > 0) {
        const productIds = productCategories.map(pc => pc.product_id);
        
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, price, benefit, description, image_url, stock_quantity, low_stock_threshold, track_inventory')
          .in('id', productIds)
          .eq('is_active', true)
          .order('name');

        setProducts(productsData || []);
      }

      setLoading(false);
    };

    fetchCategoryAndProducts();
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
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
      <HelmetProvider>
        <Helmet>
          <title>Product Categories | BF Suma</title>
          <meta name="description" content="Browse our product categories for health and wellness supplements." />
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-12">
            <div className="container mx-auto px-4">
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
                      className="group block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <Tag className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-4">
                        <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </HelmetProvider>
    );
  }

  // Show products in category
  return (
    <HelmetProvider>
      <Helmet>
        <title>{category?.name} Products | BF Suma</title>
        <meta name="description" content={category?.description || `Browse ${category?.name} products from BF Suma.`} />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <Link to="/category" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All Categories
            </Link>
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{category?.name}</h1>
              {category?.description && (
                <p className="text-muted-foreground mt-2">{category.description}</p>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground">Products will appear here when added to this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
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
            )}
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default CategoryPage;
