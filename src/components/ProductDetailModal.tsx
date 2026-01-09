import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Shield, Leaf, Check, Heart, AlertTriangle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStockStatus } from "@/hooks/use-products";
import productGeneric from "@/assets/product-generic.jpg";

interface ProductDetailModalProps {
  product: {
    id: string;
    name: string;
    price: string;
    numericPrice: number;
    benefit: string;
    description?: string;
    image?: string;
    certifications?: string[];
    stockQuantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const trustSignals = [
  { icon: Shield, label: "Quality Assured" },
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: Check, label: "Lab Tested" },
];

const ProductDetailModal = ({ product, open, onOpenChange }: ProductDetailModalProps) => {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const isMobile = useIsMobile();

  if (!product) return null;

  const stockStatus = getStockStatus(
    product.stockQuantity ?? 0,
    product.lowStockThreshold ?? 10,
    product.trackInventory ?? true
  );
  const isOutOfStock = stockStatus.status === "out-of-stock";
  const isLowStock = stockStatus.status === "low-stock";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.numericPrice, 
      priceFormatted: product.price, 
      image: product.image 
    });
    onOpenChange(false);
  };

  const favorite = isFavorite(product.id);

  const stockBadgeStyles = {
    "in-stock": "bg-green-500/10 text-green-600 dark:text-green-400",
    "low-stock": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    "out-of-stock": "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const ModalContent = (
    <>
      {/* Close Button */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 md:p-4 bg-background/95 backdrop-blur-md border-b border-border/20 md:absolute md:top-0 md:right-0 md:left-auto md:border-0 md:bg-transparent">
        <span className="text-sm font-medium text-muted-foreground md:hidden">Product Details</span>
        <button 
          onClick={() => onOpenChange(false)}
          className="rounded-full bg-background/90 md:bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors duration-200 shadow-md md:shadow-none"
          aria-label="Close modal"
        >
          <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </button>
      </div>
        
      <div className="overflow-y-auto max-h-[calc(85vh-56px)] md:max-h-[90vh]">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative h-56 md:h-full min-h-[250px] md:min-h-[300px] overflow-hidden">
            <img 
              src={product.image || productGeneric}
              alt={product.name}
              className="w-full h-full object-cover animate-modal-image-focus"
              style={{ animationDelay: '100ms' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent" />
            
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`
                absolute top-4 left-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300
                ${favorite 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background/80 text-muted-foreground hover:text-primary'
                }
              `}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
            </button>

            {/* Certifications */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              {(product.certifications || ["GMP", "Halal"]).map((cert) => (
                <span 
                  key={cert}
                  className="text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        
          {/* Product Details */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 
                className="text-2xl font-bold text-foreground opacity-0 animate-stagger-fade"
                style={{ animationDelay: '150ms' }}
              >
                {product.name}
              </h2>
              
              {/* Stock Status Badge */}
              {product.trackInventory !== false && (
                <div 
                  className="opacity-0 animate-stagger-fade"
                  style={{ animationDelay: '180ms' }}
                >
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${stockBadgeStyles[stockStatus.status]}`}>
                    {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                    {stockStatus.label}
                    {isLowStock && product.stockQuantity && (
                      <span className="ml-1">— Only {product.stockQuantity} left!</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            {/* Price */}
            <p 
              className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-0 animate-stagger-fade"
              style={{ animationDelay: '200ms' }}
            >
              {product.price}
            </p>
            
            <div className="space-y-3">
              {/* Key Benefit */}
              <div 
                className="opacity-0 animate-stagger-fade"
                style={{ animationDelay: '280ms' }}
              >
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Key Benefit
                </h4>
                <p className="text-foreground">{product.benefit}</p>
              </div>
              
              {/* Description */}
              {product.description && (
                <div 
                  className="opacity-0 animate-stagger-fade"
                  style={{ animationDelay: '360ms' }}
                >
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              
              {/* Trust Signals */}
              <div 
                className="flex flex-wrap gap-2 pt-2 opacity-0 animate-stagger-fade"
                style={{ animationDelay: '440ms' }}
              >
                {trustSignals.map((signal, index) => (
                  <div 
                    key={signal.label}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full opacity-0 animate-stagger-fade"
                    style={{ animationDelay: `${480 + (index * 80)}ms` }}
                  >
                    <signal.icon className="w-3 h-3 text-primary" />
                    {signal.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div 
              className="pt-4 space-y-3 opacity-0 animate-cta-enter"
              style={{ animationDelay: '700ms' }}
            >
              <Button 
                onClick={handleAddToCart}
                variant="premium" 
                className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg rounded-full"
                size="lg"
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Free shipping on orders over KSh 10,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Mobile: Use Drawer with swipe-to-close
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] p-0">
          {ModalContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden p-0 animate-modal-content"
        style={{ animationDuration: '400ms' }}
      >
        {ModalContent}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
