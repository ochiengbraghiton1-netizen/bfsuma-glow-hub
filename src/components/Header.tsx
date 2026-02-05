import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Menu, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import ThemeToggle from "./ThemeToggle";
import productGeneric from "@/assets/product-generic.jpg";
import bfSumaLogo from "@/assets/bf-suma-logo.png";

const navLinks = [
  { href: "#products", label: "Products", isAnchor: true },
  { href: "/about", label: "About", isAnchor: false },
  { href: "#faq", label: "FAQ", isAnchor: true },
  { href: "#contact", label: "Contact", isAnchor: true },
];

const Header = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isAnchor: boolean) => {
    setIsMobileMenuOpen(false);
    
    if (isAnchor) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      
      // If not on homepage, navigate first then scroll
      if (location.pathname !== "/") {
        navigate("/");
        // Wait for navigation then scroll
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
         <img src={bfSumaLogo} alt="BF SUMA ROYAL Logo" className="h-8 md:h-10 w-auto" />
         <span className="text-sm md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
            BF SUMA ROYAL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isAnchor ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.isAnchor)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Cart Sheet */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
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
                        <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-xl">
                          <img 
                            src={item.image || productGeneric} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            <p className="text-primary font-bold text-sm">{item.priceFormatted}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
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
                        <span className="text-primary">KSh {totalPrice.toLocaleString()}</span>
                      </div>
                      <Button 
                        variant="premium" 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
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

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] flex flex-col pt-12">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                 <img src={bfSumaLogo} alt="BF SUMA ROYAL Logo" className="h-7 w-auto" />
                 <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    BF SUMA ROYAL
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="mt-8 flex flex-col gap-1 flex-1">
                {navLinks.map((link, index) => (
                  link.isAnchor ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href, link.isAnchor)}
                      className="text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300 py-3 px-3 rounded-lg border-b border-border/30"
                      style={{
                        animation: `fade-in 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300 py-3 px-3 rounded-lg border-b border-border/30"
                      style={{
                        animation: `fade-in 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>

              {/* Sticky CTA Button */}
              <div className="pt-4 border-t border-border mt-auto">
                <Button
                  asChild
                  variant="premium"
                  className="w-full"
                  size="lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/join-business" className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Become a Distributor
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
