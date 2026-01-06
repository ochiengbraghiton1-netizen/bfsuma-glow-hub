import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  name: string;
  price: string;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (name: string) => void;
  updateQuantity: (name: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => 
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setItems(prev => prev.filter(i => i.name !== name));
  };

  const updateQuantity = (name: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(name);
      return;
    }
    setItems(prev => prev.map(i => 
      i.name === name ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const isFavorite = (name: string) => favorites.includes(name);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      favorites,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
