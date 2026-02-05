-- Fix security definer view by making it a regular view with RLS on the underlying table
DROP VIEW IF EXISTS public.product_ratings;

-- Create a function to get product ratings instead (more secure)
CREATE OR REPLACE FUNCTION public.get_product_ratings(p_product_id uuid)
RETURNS TABLE (
  review_count bigint,
  average_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::bigint as review_count,
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating
  FROM public.product_reviews
  WHERE product_id = p_product_id AND status = 'approved'
$$;