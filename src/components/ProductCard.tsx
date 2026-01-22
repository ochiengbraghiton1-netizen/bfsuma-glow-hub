import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getStockStatus } from "@/hooks/use-products";
import productGeneric from "@/assets/product-generic.jpg";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  benefit: string;
  description?: string;
  image?: string;
  category?: string;
  certifications?: string[];
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  onClick?: () => void;
}

const ProductCard = ({ 
  id,
  name, 
  price,
  numericPrice,
  benefit, 
  image, 
  certifications = ["GMP", "Halal"],
  stockQuantity = 0,
  lowStockThreshold = 10,
  trackInventory = true,
  onClick 
}: ProductCardProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.6, triggerOnce: true });
  const [isHovering, setIsHovering] = useState(false);
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  const stockStatus = getStockStatus(stockQuantity, lowStockThreshold, trackInventory);
  const isOutOfStock = stockStatus.status === "out-of-stock";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({ id, name, price: numericPrice, priceFormatted: price, image });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const favorite = isFavorite(id);

  const stockBadgeStyles = {
    "in-stock": "bg-green-500/10 text-green-600 dark:text-green-400",
    "low-stock": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    "out-of-stock": "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card 
      ref={ref}
      className="group overflow-hidden bg-card border-border/50 rounded-2xl transition-shadow duration-500 hover:shadow-glow flex flex-col"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Product Image */}
      <div 
        className="relative overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div
          className={`
            ${isInView ? 'animate-product-image-enter' : 'opacity-0'}
            ${isHovering ? 'animate-product-image-spin' : ''}
          `}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img 
            src={image || productGeneric}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-56 object-cover"
          />
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`
            absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300
            ${favorite 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background/80 text-muted-foreground hover:text-primary'
            }
          `}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Certifications */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {certifications.map((cert) => (
            <span 
              key={cert}
              className="text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full"
            >
              {cert}
            </span>
          ))}
        </div>

        {/* Stock Status Badge */}
        {trackInventory && (
          <div className="absolute bottom-3 left-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockBadgeStyles[stockStatus.status]}`}>
              {stockStatus.label}
            </span>
          </div>
        )}
        
        {/* View Details Overlay */}
        <div 
          className={`
            absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent 
            flex items-center justify-center
            transition-opacity duration-300 ease-out
            ${isHovering ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="flex items-center gap-2 text-white font-semibold bg-primary/80 px-4 py-2 rounded-full backdrop-blur-sm">
            <Eye className="w-4 h-4" />
            View Details
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        {/* Product Name */}
        <h3 
          className={`
            text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1
            ${isInView ? 'animate-product-name-enter' : 'opacity-0'}
          `}
          style={{ animationDelay: isInView ? '80ms' : '0ms' }}
        >
          {name}
        </h3>
        
        {/* Benefit Description - 2 lines */}
        <p 
          className={`
            text-sm text-muted-foreground line-clamp-2 mt-2 flex-1
            ${isInView ? 'animate-product-benefit-enter' : 'opacity-0'}
            ${isHovering ? 'text-foreground/80' : ''}
            transition-colors duration-300
          `}
          style={{ animationDelay: isInView ? '160ms' : '0ms' }}
        >
          {benefit}
        </p>
        
        {/* Price */}
        <p 
          className={`
            text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-3
            ${isInView ? 'animate-product-price-enter' : 'opacity-0'}
            ${isHovering ? 'scale-[1.02]' : 'scale-100'}
            transition-transform duration-300 origin-left
          `}
          style={{ animationDelay: isInView ? '260ms' : '0ms' }}
        >
          {price}
        </p>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          variant="default"
          disabled={isOutOfStock}
          className={`
            w-full mt-4 rounded-full transition-all duration-300
            ${isInView ? 'animate-product-price-enter' : 'opacity-0'}
          `}
          style={{ animationDelay: isInView ? '340ms' : '0ms' }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
