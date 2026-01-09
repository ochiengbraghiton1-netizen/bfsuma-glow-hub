import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  benefit: string | null;
  description: string | null;
  image_url: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  is_active: boolean;
  sku: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number | null;
}

export const useProducts = () => {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          benefit,
          description,
          image_url,
          stock_quantity,
          low_stock_threshold,
          track_inventory,
          is_active,
          sku,
          category_id,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      return data.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        benefit: product.benefit,
        description: product.description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        track_inventory: product.track_inventory,
        is_active: product.is_active,
        sku: product.sku,
        category: product.categories as DatabaseProduct["category"],
      })) as DatabaseProduct[];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, display_order")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as DatabaseCategory[];
    },
  });

  return {
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    error: productsQuery.error || categoriesQuery.error,
  };
};

export const formatPrice = (price: number): string => {
  return `KSh ${price.toLocaleString()}`;
};

export const getStockStatus = (
  stockQuantity: number,
  lowStockThreshold: number,
  trackInventory: boolean
): { status: "in-stock" | "low-stock" | "out-of-stock"; label: string } => {
  if (!trackInventory) {
    return { status: "in-stock", label: "In Stock" };
  }
  if (stockQuantity === 0) {
    return { status: "out-of-stock", label: "Out of Stock" };
  }
  if (stockQuantity <= lowStockThreshold) {
    return { status: "low-stock", label: "Low Stock" };
  }
  return { status: "in-stock", label: "In Stock" };
};
