import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatPrice } from '@/hooks/use-products';
import productGeneric from '@/assets/product-generic.jpg';

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  benefit: string | null;
  image_url: string | null;
}

interface BlogRelatedProductsProps {
  products: RelatedProduct[];
}

const BlogRelatedProducts = ({ products }: BlogRelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6">Products Related to This Article</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden bg-card border-border/50 rounded-2xl transition-shadow duration-300 hover:shadow-glow flex flex-col"
          >
            <div className="relative overflow-hidden">
              <img
                src={product.image_url || productGeneric}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              {product.benefit && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1 flex-1">
                  {product.benefit}
                </p>
              )}
              <p className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-3">
                {formatPrice(product.price)}
              </p>
              <Button asChild variant="default" className="w-full mt-4 rounded-full">
                <Link to={`/p/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Product
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogRelatedProducts;
