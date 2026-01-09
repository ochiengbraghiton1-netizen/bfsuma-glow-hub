import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { useProducts, formatPrice, DatabaseProduct } from "@/hooks/use-products";

// Product image imports
import nmnCapsules from "@/assets/products/nmn-capsules.jpg";
import ganodermaSpores from "@/assets/products/ganoderma-spores.jpg";
import yunzhiCapsules from "@/assets/products/yunzhi-capsules.jpg";
import arthroxtra from "@/assets/products/arthroxtra.jpg";
import gluzojoint from "@/assets/products/gluzojoint.jpg";
import xPowerMan from "@/assets/products/x-power-man.jpg";
import feminegy from "@/assets/products/feminegy.jpg";
import femiCalcium from "@/assets/products/femi-calcium.jpg";
import detoxilive from "@/assets/products/detoxilive.jpg";
import ezXlim from "@/assets/products/ez-xlim.jpg";
import youthEssence from "@/assets/products/youth-essence.jpg";
import sumaGrand from "@/assets/products/suma-grand.jpg";
import vitaminC from "@/assets/products/vitamin-c.jpg";

// Map product names to local images
const productImageMap: Record<string, string> = {
  "NMN Capsules": nmnCapsules,
  "Ganoderma Spore Capsules": ganodermaSpores,
  "Yunzhi Capsules": yunzhiCapsules,
  "Arthroxtra": arthroxtra,
  "Gluzojoint": gluzojoint,
  "X-Power Man": xPowerMan,
  "Feminegy": feminegy,
  "Femi Calcium": femiCalcium,
  "Detoxilive": detoxilive,
  "EZ-Xlim": ezXlim,
  "Youth Essence": youthEssence,
  "Suma Grand": sumaGrand,
  "Vitamin C Plus": vitaminC,
};

const ProductShowcase = () => {
  const { products, categories, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const handleProductClick = (product: DatabaseProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.benefit?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || product.category?.slug === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const getProductImage = (product: DatabaseProduct) => {
    return productImageMap[product.name] || product.image_url || undefined;
  };

  if (error) {
    return (
      <section id="products" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Failed to load products. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Premium Products
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Natural supplements scientifically formulated for optimal health and wellness
          </p>
        </div>

        {/* Sticky Search Bar & Category Filters */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 mb-8 border-b border-border/20">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 rounded-full border-border/50 bg-card focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full transition-all duration-300 ${
                activeCategory === "all" ? "" : "border-border/50 hover:border-primary/50"
              }`}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full transition-all duration-300 ${
                  activeCategory === category.slug ? "" : "border-border/50 hover:border-primary/50"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={formatPrice(product.price)}
                numericPrice={product.price}
                benefit={product.benefit || ""}
                description={product.description || undefined}
                image={getProductImage(product)}
                category={product.category?.name}
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold}
                trackInventory={product.track_inventory}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={
          selectedProduct
            ? {
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: formatPrice(selectedProduct.price),
                numericPrice: selectedProduct.price,
                benefit: selectedProduct.benefit || "",
                description: selectedProduct.description || undefined,
                image: getProductImage(selectedProduct),
                stockQuantity: selectedProduct.stock_quantity,
                lowStockThreshold: selectedProduct.low_stock_threshold,
                trackInventory: selectedProduct.track_inventory,
              }
            : null
        }
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
};

export default ProductShowcase;
