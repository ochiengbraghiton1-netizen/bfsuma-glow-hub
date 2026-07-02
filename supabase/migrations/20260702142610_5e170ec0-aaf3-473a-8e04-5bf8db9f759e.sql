
-- Harden product_reviews public INSERT: force pending status, valid rating, and normalize email handling
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can insert reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "public_insert_reviews" ON public.product_reviews;

CREATE POLICY "Public can submit pending reviews"
ON public.product_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND rating BETWEEN 1 AND 5
  AND is_verified_purchase = false
  AND (reviewer_email IS NULL OR reviewer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

COMMENT ON COLUMN public.product_reviews.reviewer_email IS
  'PII. Never exposed via public SELECT policy. Only readable by admins directly; public reads go through get_approved_product_reviews() which omits this column.';

COMMENT ON TABLE public.product_affiliate_links IS
  'Contains sensitive affiliate metadata (agent_code, assigned_to, click_count). No public SELECT policy. Public resolution is only allowed via get_affiliate_product_link(slug) RPC, which returns product_id and slug only.';
