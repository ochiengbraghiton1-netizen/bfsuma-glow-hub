-- Create product_categories join table for many-to-many relationship
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view product categories"
ON public.product_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage product categories"
ON public.product_categories
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);

-- Function to get product count per category
CREATE OR REPLACE FUNCTION public.get_category_product_count(p_category_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.product_categories pc
  JOIN public.products p ON p.id = pc.product_id
  WHERE pc.category_id = p_category_id AND p.is_active = true
$$;