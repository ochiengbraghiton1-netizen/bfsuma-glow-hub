-- Product keywords table for blog auto-linking
CREATE TABLE public.product_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX product_keywords_product_keyword_idx ON public.product_keywords (product_id, lower(keyword));

ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product keywords" ON public.product_keywords
  FOR ALL TO public USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Anyone can view product keywords" ON public.product_keywords
  FOR SELECT TO public USING (true);