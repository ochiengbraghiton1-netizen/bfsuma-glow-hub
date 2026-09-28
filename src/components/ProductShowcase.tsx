import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronUp, LayoutGrid } from "lucide-react";
import ResponsiveImage from "@/components/ui/responsive-image";
import categoryPlaceholder from "@/assets/category-placeholder.jpg";
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
  normalizeFilters,
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
  categories: { id: string; slug: string; name: string; imageUrl?: string | null }[];
  activeCategory: string;
  onSelect: (slug: string) => void;
}

/** Circular category avatar — image when available, otherwise the initial letter. */
const CategoryAvatar = ({ name, imageUrl }: { name: string; imageUrl?: string | null }) => {
  if (imageUrl) {
    return (
      <ResponsiveImage
        src={imageUrl}
        alt={`${name} category`}
        className="w-full h-full object-cover"
        width={112}
        height={112}
        sizes="64px"
        fallbackSrc={categoryPlaceholder}
        showSkeleton={false}
      />
    );
  }
  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <span className="text-lg font-semibold text-muted-foreground select-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

const CategoryPills = ({ categories, activeCategory, onSelect }: CategoryPillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const hasMore = categories.length > MAX_VISIBLE_CATEGORIES;

  const circleClasses = (active: boolean) =>
    `w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 transition-all duration-200 ${
      active
        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
        : "ring-1 ring-border/60 group-hover:ring-primary/40"
    }`;

  return (
    <div className="mb-6">
      <div
        ref={scrollRef}
        className={`flex gap-3 md:gap-4 scrollbar-hide pb-2 -mx-1 px-1 ${
          showAll
            ? "flex-wrap overflow-x-auto md:overflow-visible md:justify-center"
            : "overflow-x-auto md:flex-nowrap md:overflow-hidden"
        }`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* All — icon circle, not a real category */}
        <button
          onClick={() => onSelect("all")}
          className="group flex flex-col items-center gap-1.5 shrink-0 w-16 md:w-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
          aria-pressed={activeCategory === "all"}
        >
          <span
            className={`${circleClasses(activeCategory === "all")} flex items-center justify-center ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span
            className={`text-xs leading-tight text-center ${
              activeCategory === "all" ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            All
          </span>
        </button>

        {categories.map((cat, index) => {
          const active = activeCategory === cat.slug;
          const hiddenOnMobile = index >= MAX_VISIBLE_CATEGORIES && !showAll;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.slug)}
              className={`group flex-col items-center gap-1.5 shrink-0 w-16 md:w-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl ${
                hiddenOnMobile ? "hidden md:flex" : "flex"
              }`}
              aria-pressed={active}
            >
              <span className={circleClasses(active)}>
                <CategoryAvatar name={cat.name} imageUrl={cat.imageUrl} />
              </span>
              <span
                className={`text-xs leading-tight text-center line-clamp-2 ${
                  active ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}

        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="group flex flex-col items-center gap-1.5 shrink-0 w-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            aria-label={`Show ${categories.length - MAX_VISIBLE_CATEGORIES} more categories`}
          >
            <span className="w-14 h-14 md:w-16 md:h-16 rounded-full shrink-0 bg-muted/60 border border-border/40 flex items-center justify-center text-primary transition-colors duration-200 group-hover:bg-muted">
              <span className="text-sm font-semibold">
                +{categories.length - MAX_VISIBLE_CATEGORIES}
              </span>
            </span>
            <span className="text-xs leading-tight text-center text-muted-foreground">More</span>
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="group flex flex-col items-center gap-1.5 shrink-0 w-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            aria-label="Show fewer categories"
          >
            <span className="w-14 h-14 md:w-16 md:h-16 rounded-full shrink-0 bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground transition-colors duration-200 group-hover:bg-muted">
              <ChevronUp className="h-5 w-5" />
            </span>
            <span className="text-xs leading-tight text-center text-muted-foreground">Less</span>
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
  const [filters, setFilters] = useState<FilterState>(() => normalizeFilters(savedState?.filters));
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

  // Real database categories (ordered by display_order) with live product counts.
  // Categories with zero products stay visible but show a (0) count.
  const filterCategories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const ids = new Set<string>();
      if (product.category?.id) ids.add(product.category.id);
      product.categories.forEach((cat) => ids.add(cat.id));
      ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    });
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      productCount: counts.get(cat.id) ?? 0,
    }));
  }, [categories, products]);

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

      // Health concern — match by stable database category IDs (primary + join table)
      const matchesConcern =
        filters.categoryIds.length === 0 ||
        filters.categoryIds.some(
          (categoryId) =>
            product.category?.id === categoryId ||
            product.categories.some((cat) => cat.id === categoryId)
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
          <div className="max-w-xl mx-auto mb-6">
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
            categories={categories.map((cat) => ({
              id: cat.id,
              slug: cat.slug,
              name: cat.name,
              imageUrl: cat.image_url,
            }))}
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
                categories={filterCategories}
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
                    <Skeleton className="aspect-square w-full" />
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
              categories={filterCategories}
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
