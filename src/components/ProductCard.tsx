import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useState } from "react";
import productGeneric from "@/assets/product-generic.jpg";

interface ProductCardProps {
  name: string;
  price: string;
  benefit: string;
  description?: string;
  image?: string;
  onClick?: () => void;
}

const ProductCard = ({ name, price, benefit, image, onClick }: ProductCardProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.6, triggerOnce: true });
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Card 
      ref={ref}
      className="group overflow-hidden bg-card border-border/50 rounded-2xl cursor-pointer transition-shadow duration-500 hover:shadow-glow"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Product Image - Animates FIRST */}
      <div className="relative overflow-hidden">
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
            className="w-full h-64 object-cover"
          />
        </div>
        
        {/* Hover overlay - no animation on scroll, only on hover */}
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
      
      <div className="p-6 space-y-3">
        {/* Product Name - Animates SECOND (80ms delay) */}
        <h3 
          className={`
            text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300
            ${isInView ? 'animate-product-name-enter' : 'opacity-0'}
          `}
          style={{ animationDelay: isInView ? '80ms' : '0ms' }}
        >
          {name}
        </h3>
        
        {/* Benefit Line - Animates THIRD (160ms delay) */}
        <p 
          className={`
            text-sm text-muted-foreground line-clamp-2
            ${isInView ? 'animate-product-benefit-enter' : 'opacity-0'}
            ${isHovering ? 'text-foreground/80' : ''}
            transition-colors duration-300
          `}
          style={{ animationDelay: isInView ? '160ms' : '0ms' }}
        >
          {benefit}
        </p>
        
        {/* Price - Animates FOURTH (260ms delay) */}
        <p 
          className={`
            text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent
            ${isInView ? 'animate-product-price-enter' : 'opacity-0'}
            ${isHovering ? 'scale-[1.02]' : 'scale-100'}
            transition-transform duration-300 origin-left
          `}
          style={{ animationDelay: isInView ? '260ms' : '0ms' }}
        >
          {price}
        </p>
      </div>
    </Card>
  );
};

export default ProductCard;
