
-- Fix 1: Add explicit storage.objects policies for private 'bfsumaimages' bucket (admin/editor only)
DROP POLICY IF EXISTS "bfsumaimages admin editor select" ON storage.objects;
DROP POLICY IF EXISTS "bfsumaimages admin editor insert" ON storage.objects;
DROP POLICY IF EXISTS "bfsumaimages admin editor update" ON storage.objects;
DROP POLICY IF EXISTS "bfsumaimages admin editor delete" ON storage.objects;

CREATE POLICY "bfsumaimages admin editor select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'bfsumaimages' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "bfsumaimages admin editor insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bfsumaimages' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "bfsumaimages admin editor update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'bfsumaimages' AND public.is_admin_or_editor(auth.uid()))
  WITH CHECK (bucket_id = 'bfsumaimages' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "bfsumaimages admin editor delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'bfsumaimages' AND public.is_admin_or_editor(auth.uid()));

-- Fix 2: Document that get_affiliate_product_link RPC is the sole non-admin access path
COMMENT ON TABLE public.product_affiliate_links IS
  'Sensitive affiliate/commission data. Direct table access is restricted to admins only. Non-admin/anon access must go through the SECURITY DEFINER RPC public.get_affiliate_product_link(slug), which returns only (product_id, slug) for active links.';
COMMENT ON FUNCTION public.get_affiliate_product_link(text) IS
  'Sole intended public access path for resolving affiliate slugs to products. Returns only product_id and slug for active links; never exposes commissions, click counts, or agent codes.';

-- Fix 3: Stop exposing reviewer_email publicly. Restrict direct SELECT to admins,
-- and expose safe review fields via an RPC used by the frontend.
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Approved reviews are viewable" ON public.product_reviews;

CREATE OR REPLACE FUNCTION public.get_approved_product_reviews(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  reviewer_name text,
  rating integer,
  review_text text,
  created_at timestamptz,
  is_verified_purchase boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, reviewer_name, rating, review_text, created_at, is_verified_purchase
  FROM public.product_reviews
  WHERE product_id = p_product_id AND status = 'approved'
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_approved_product_reviews(uuid) TO anon, authenticated;

COMMENT ON COLUMN public.product_reviews.reviewer_email IS
  'PII — never exposed via public SELECT. Access restricted to admins; public consumers use get_approved_product_reviews() which omits this column.';
