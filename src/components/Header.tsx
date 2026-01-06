import { useState } from "react";
import { ShoppingCart, Heart, X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import ThemeToggle from "./ThemeToggle";
import productGeneric from "@/assets/product-generic.jpg";

const Header = () => {
  const { items, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    const itemsList = items.map(item => `${item.name} x${item.quantity} - ${item.price}`).join('\n');
    const total = calculateTotal().toLocaleString();
    const message = encodeURIComponent(
      `Hi! I'd like to place an order:\n\n${itemsList}\n\nTotal: KSh ${total}`
    );
    window.open(`https://wa.me/254795454053?text=${message}`, "_blank");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            BF SUMA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#products" className="text-sm text-muted-foreground hover:text-primary transition-colors">Products</a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Cart ({totalItems})
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 flex flex-col h-[calc(100vh-12rem)]">
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {items.map((item) => (
                        <div key={item.name} className="flex gap-3 p-3 bg-muted/50 rounded-xl">
                          <img 
                            src={item.image || productGeneric} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            <p className="text-primary font-bold text-sm">{item.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.name, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.name, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.name)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-border pt-4 mt-4 space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">KSh {calculateTotal().toLocaleString()}</span>
                      </div>
                      <Button 
                        variant="premium" 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Checkout via WhatsApp
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
