import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
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
  return (
    <Card 
      className="group overflow-hidden transition-all duration-500 hover:shadow-glow hover:-translate-y-2 bg-card border-border/50 rounded-2xl cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image || productGeneric}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white font-semibold bg-primary/80 px-4 py-2 rounded-full backdrop-blur-sm">
            <Eye className="w-4 h-4" />
            View Details
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {benefit}
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {price}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
