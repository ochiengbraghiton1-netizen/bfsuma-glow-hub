CREATE TABLE IF NOT EXISTS public.location_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug text NOT NULL UNIQUE,
  hero_title text,
  hero_description text,
  main_content_html text,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  seo_keywords text[],
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.location_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_pages TO authenticated;
GRANT ALL ON public.location_pages TO service_role;

ALTER TABLE public.location_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published location pages"
  ON public.location_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage location pages"
  ON public.location_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE TRIGGER update_location_pages_updated_at
  BEFORE UPDATE ON public.location_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();