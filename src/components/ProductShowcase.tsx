import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import ProductSortDropdown, { SortOption } from "./products/ProductSortDropdown";
import ProductFilters, {
  FilterState,
  defaultFilters,
  getActiveFilterCount,
  MobileFilterButton,
} from "./products/ProductFilters";
import { useProducts, formatPrice, DatabaseProduct, getStockStatus } from "@/hooks/use-products";

// Product image imports
import nmnCapsules from "@/assets/products/nmn-capsules.webp";
import ganodermaSpores from "@/assets/products/ganoderma-spores.webp";
import yunzhiCapsules from "@/assets/products/yunzhi-capsules.webp";
import arthroxtra from "@/assets/products/arthroxtra.webp";
import gluzojoint from "@/assets/products/gluzojoint.webp";
import xPowerMan from "@/assets/products/x-power-man.webp";
import feminegy from "@/assets/products/feminegy.webp";
import femiCalcium from "@/assets/products/femi-calcium.webp";
import detoxilive from "@/assets/products/detoxilive.webp";
import ezXlim from "@/assets/products/ez-xlim.webp";
import youthEssence from "@/assets/products/youth-essence.webp";
import sumaGrand from "@/assets/products/suma-grand.webp";
import vitaminC from "@/assets/products/vitamin-c.webp";

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

const MAX_VISIBLE_CATEGORIES = 6;

interface CategoryPillsProps {
  categories: { id: string; slug: string; name: string }[];
  activeCategory: string;
  onSelect: (slug: string) => void;
}

const CategoryPills = ({ categories, activeCategory, onSelect }: CategoryPillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hasMore = categories.length > MAX_VISIBLE_CATEGORIES;

  return (
    <div className="mb-4">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
          }`}
        >
          All
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
            }`}
          >
            {cat.name}
          </button>
        ))}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium bg-muted/60 text-primary hover:bg-muted border border-border/40 whitespace-nowrap flex items-center gap-1"
          >
            +{categories.length - MAX_VISIBLE_CATEGORIES} More
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
};

const ProductShowcase = () => {
  const { products, categories, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const savedState = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("catalogState") || "null");
    } catch {
      return null;
    }
  })();
  const [searchQuery, setSearchQuery] = useState<string>(savedState?.searchQuery ?? "");
  const [activeCategory, setActiveCategory] = useState<string>(savedState?.activeCategory ?? "all");
  const [sortOption, setSortOption] = useState<SortOption>(savedState?.sortOption ?? "featured");
  const [filters, setFilters] = useState<FilterState>(savedState?.filters ?? defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Persist catalog state so returning from a product page restores filters
  useEffect(() => {
    sessionStorage.setItem(
      "catalogState",
      JSON.stringify({ searchQuery, activeCategory, sortOption, filters })
    );
  }, [searchQuery, activeCategory, sortOption, filters]);

  const activeFilterCount = getActiveFilterCount(filters);


  const handleProductClick = (product: DatabaseProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
    if (product.slug) {
      // Shareable URL while the quick view is open (no router navigation)
      window.history.pushState({ quickView: true }, "", `/product/${product.slug}`);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open && window.history.state?.quickView) {
      window.history.back();
    }
  };

  useEffect(() => {
    const onPop = () => setModalOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);



  const clearFilters = () => setFilters(defaultFilters);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Search
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.benefit?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory =
        activeCategory === "all" ||
        product.category?.slug === activeCategory ||
        product.categories.some((cat) => cat.slug === activeCategory);

      // Health concerns - match against category names and benefit text
      const matchesConcern =
        filters.healthConcerns.length === 0 ||
        filters.healthConcerns.some(
          (concern) =>
            product.category?.name.toLowerCase().includes(concern.toLowerCase()) ||
            product.categories.some((cat) =>
              cat.name.toLowerCase().includes(concern.toLowerCase())
            ) ||
            product.benefit?.toLowerCase().includes(concern.toLowerCase()) ||
            product.name.toLowerCase().includes(concern.toLowerCase())
        );

      // Price range
      const minPrice = filters.priceMin ? Number(filters.priceMin) : 0;
      const maxPrice = filters.priceMax ? Number(filters.priceMax) : Infinity;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

      // Availability
      const stock = getStockStatus(product.stock_quantity, product.low_stock_threshold, product.track_inventory);
      const matchesAvailability = !filters.inStockOnly || stock.status !== "out-of-stock";

      return matchesSearch && matchesCategory && matchesConcern && matchesPrice && matchesAvailability;
    });

    // Sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Products don't have created_at exposed, sort by name desc as proxy
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popular":
        // No popularity metric, keep default order
        break;
      case "featured":
      default:
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, sortOption, filters]);

  const getProductImage = (product: DatabaseProduct) => {
    if (product.image_url) return product.image_url;
    return productImageMap[product.name] || undefined;
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
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md py-4 mb-8 border-b border-border/20 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:rounded-xl">
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

          {/* Category Filters — horizontal scroll */}
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Sort + Filter Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MobileFilterButton
                activeCount={activeFilterCount}
                onClick={() => setMobileFiltersOpen(true)}
              />
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-destructive hover:underline text-xs"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            <ProductSortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-52 bg-card border border-border/50 rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                Filters
              </h3>
              <ProductFilters
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No products found. Try a different search, category, or filter.</p>
                {activeFilterCount > 0 && (
                  <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={formatPrice(product.price)}
                    numericPrice={product.price}
                    benefit={product.benefit || ""}
                    description={product.description || undefined}
                    image={getProductImage(product)}
                    category={product.category?.name}
                    stockQuantity={product.stock_quantity}
                    lowStockThreshold={product.low_stock_threshold}
                    trackInventory={product.track_inventory}
                    onQuickView={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onClear={() => {
                clearFilters();
                setMobileFiltersOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

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
        onOpenChange={handleModalOpenChange}
      />
    </section>
  );
};

export default ProductShowcase;
