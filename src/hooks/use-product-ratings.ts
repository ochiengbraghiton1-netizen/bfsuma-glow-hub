import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductRating {
  productId: string;
  reviewCount: number;
  averageRating: number;
}

export const useProductRatings = (productIds: string[]) => {
  return useQuery({
    queryKey: ["product-ratings", productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};

      // Fetch approved reviews and aggregate them
      const { data, error } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .eq("status", "approved")
        .in("product_id", productIds);

      if (error) throw error;

      // Aggregate ratings by product
      const ratingsMap: Record<string, ProductRating> = {};
      
      productIds.forEach(id => {
        const productReviews = data?.filter(r => r.product_id === id) || [];
        const reviewCount = productReviews.length;
        const averageRating = reviewCount > 0 
          ? Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : 0;
        
        ratingsMap[id] = {
          productId: id,
          reviewCount,
          averageRating
        };
      });

      return ratingsMap;
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
