import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
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

const ProductDetailModal = ({ product, open, onOpenChange }: ProductDetailModalProps) => {
  if (!product) return null;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'm interested in ${product.name} (${product.price})`);
    window.open(`https://wa.me/254795454053?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative h-64 md:h-full min-h-[300px]">
            <img 
              src={product.image || productGeneric}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent" />
          </div>
          
          {/* Product Details */}
          <div className="p-6 space-y-4">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {product.price}
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Key Benefit
                </h4>
                <p className="text-foreground">{product.benefit}</p>
              </div>
              
              {product.description && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                onClick={openWhatsApp}
                variant="premium" 
                className="w-full"
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
