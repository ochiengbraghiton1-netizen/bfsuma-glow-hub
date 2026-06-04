
CREATE TABLE public.location_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_slug TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (city_slug, product_id)
);

CREATE INDEX idx_location_products_city ON public.location_products(city_slug, position);

GRANT SELECT ON public.location_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_products TO authenticated;
GRANT ALL ON public.location_products TO service_role;

ALTER TABLE public.location_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view location products"
  ON public.location_products FOR SELECT
  USING (true);

CREATE POLICY "Admins/editors can manage location products"
  ON public.location_products FOR ALL
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_location_products_updated_at
  BEFORE UPDATE ON public.location_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
