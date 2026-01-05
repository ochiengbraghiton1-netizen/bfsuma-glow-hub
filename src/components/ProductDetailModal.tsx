import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Shield, Leaf, Check } from "lucide-react";
import productGeneric from "@/assets/product-generic.jpg";

interface ProductDetailModalProps {
  product: {
    name: string;
    price: string;
    benefit: string;
    description?: string;
    image?: string;
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
  if (!product) return null;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'm interested in ${product.name} (${product.price})`);
    window.open(`https://wa.me/254795454053?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 animate-modal-content"
        style={{ animationDuration: '400ms' }}
      >
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image - Focus animation */}
          <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
            <img 
              src={product.image || productGeneric}
              alt={product.name}
              className="w-full h-full object-cover animate-modal-image-focus"
              style={{ animationDelay: '100ms' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent" />
          </div>
          
          {/* Product Details - Staggered animations */}
          <div className="p-6 space-y-4">
            <DialogHeader className="space-y-2">
              <DialogTitle 
                className="text-2xl font-bold text-foreground opacity-0 animate-stagger-fade"
                style={{ animationDelay: '150ms' }}
              >
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            {/* Price - appears early as it's already familiar */}
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
              
              {/* Trust Signals - Staggered */}
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
            
            {/* CTA Button - Appears LAST */}
            <div 
              className="pt-4 space-y-3 opacity-0 animate-cta-enter"
              style={{ animationDelay: '700ms' }}
            >
              <Button 
                onClick={openWhatsApp}
                variant="premium" 
                className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Order via WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Click to chat with us on WhatsApp for quick ordering
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
