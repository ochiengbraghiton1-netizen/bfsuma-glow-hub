-- Ensure no duplicate product-category relationships exist
DELETE FROM public.product_categories a
USING public.product_categories b
WHERE a.ctid < b.ctid
  AND a.product_id = b.product_id
  AND a.category_id = b.category_id;

-- Enforce single source of truth at the DB layer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_categories_product_id_category_id_key'
  ) THEN
    ALTER TABLE public.product_categories
      ADD CONSTRAINT product_categories_product_id_category_id_key
      UNIQUE (product_id, category_id);
  END IF;
END $$;

-- Helpful indexes (unique constraint already creates an index, but keep an index on category_id for fast lookups)
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
  ON public.product_categories (category_id);

-- Count distinct ACTIVE products per category (matches storefront visibility rules)
CREATE OR REPLACE FUNCTION public.get_category_product_count(p_category_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT pc.product_id)::integer
  FROM public.product_categories pc
  JOIN public.products p ON p.id = pc.product_id
  WHERE pc.category_id = p_category_id
    AND p.is_active = true;
$$;

-- Bulk counts for admin/UI (single call)
CREATE OR REPLACE FUNCTION public.get_category_product_counts()
RETURNS TABLE(category_id uuid, product_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT pc.category_id, COUNT(DISTINCT pc.product_id)::integer AS product_count
  FROM public.product_categories pc
  JOIN public.products p ON p.id = pc.product_id
  WHERE p.is_active = true
  GROUP BY pc.category_id;
$$;