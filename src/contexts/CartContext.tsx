import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import WishlistCapturePopup from "@/components/WishlistCapturePopup";

const CART_STORAGE_KEY = "bf_cart_items";
const FAVORITES_STORAGE_KEY = "bf_favorites";
const WISHLIST_CONTACT_KEY = "bf_wishlist_contact";

export interface WishlistContact {
  phone: string;
  email?: string;
}

const loadWishlistContact = (): WishlistContact | null => {
  try {
    const raw = localStorage.getItem(WISHLIST_CONTACT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.phone ? (parsed as WishlistContact) : null;
  } catch {
    return null;
  }
};


const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  pendingWishlistProductId: string | null;
  completeWishlistCapture: (contact: WishlistContact) => void;
  cancelWishlistCapture: () => void;

}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage(CART_STORAGE_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage(FAVORITES_STORAGE_KEY, []));

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [pendingWishlistProductId, setPendingWishlistProductId] = useState<string | null>(null);

  const recordWishlistItem = (productId: string, contact: WishlistContact) => {
    // fire-and-forget; never block the UI
    import("@/integrations/supabase/client")
      .then(({ supabase }) =>
        supabase.from("wishlist_items").insert({
          product_id: productId,
          lead_phone: contact.phone,
          lead_email: contact.email ?? null,
        }),
      )
      .catch(() => {});
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(n => n !== id));
      return;
    }
    const contact = loadWishlistContact();
    if (contact) {
      setFavorites(prev => [...prev, id]);
      recordWishlistItem(id, contact);
      return;
    }
    setPendingWishlistProductId(id);
  };

  const completeWishlistCapture = (contact: WishlistContact) => {
    try {
      localStorage.setItem(WISHLIST_CONTACT_KEY, JSON.stringify(contact));
    } catch {}
    const id = pendingWishlistProductId;
    if (id) {
      setFavorites(prev => (prev.includes(id) ? prev : [...prev, id]));
    }
    setPendingWishlistProductId(null);
  };

  const cancelWishlistCapture = () => setPendingWishlistProductId(null);

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      favorites,
      toggleFavorite,
      isFavorite,
      pendingWishlistProductId,
      completeWishlistCapture,
      cancelWishlistCapture,
    }}>
      {children}
      <WishlistCapturePopup />
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
