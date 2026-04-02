
-- Add slug column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing products from their names
UPDATE public.products 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle any duplicate slugs by appending a suffix
DO $$
DECLARE
  dup RECORD;
  counter INT;
BEGIN
  FOR dup IN 
    SELECT slug, array_agg(id ORDER BY created_at) as ids
    FROM public.products
    GROUP BY slug
    HAVING count(*) > 1
  LOOP
    counter := 1;
    FOR i IN 2..array_length(dup.ids, 1) LOOP
      UPDATE public.products SET slug = dup.slug || '-' || counter WHERE id = dup.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);

-- Create function to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(
      regexp_replace(
        regexp_replace(
          regexp_replace(trim(NEW.name), '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    );
    final_slug := base_slug;
    LOOP
      IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug AND id != NEW.id) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.generate_product_slug();
