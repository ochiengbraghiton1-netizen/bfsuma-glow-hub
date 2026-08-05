CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lead_phone text NOT NULL,
  lead_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.wishlist_items TO anon, authenticated;
GRANT SELECT ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add wishlist items"
ON public.wishlist_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins and editors can view wishlist items"
ON public.wishlist_items FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);