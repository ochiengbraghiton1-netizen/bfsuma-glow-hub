-- Create product_affiliate_links table
CREATE TABLE public.product_affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  agent_code TEXT NOT NULL,
  assigned_to TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast slug lookups
CREATE INDEX idx_product_affiliate_links_slug ON public.product_affiliate_links(slug);
CREATE INDEX idx_product_affiliate_links_product_id ON public.product_affiliate_links(product_id);

-- Enable RLS
ALTER TABLE public.product_affiliate_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view active affiliate links (needed for resolving links)
CREATE POLICY "Anyone can view active affiliate links"
ON public.product_affiliate_links
FOR SELECT
USING (is_active = true);

-- Admins can manage all affiliate links
CREATE POLICY "Admins can manage affiliate links"
ON public.product_affiliate_links
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Function to generate next agent code
CREATE OR REPLACE FUNCTION public.generate_next_agent_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_code INTEGER;
  next_code TEXT;
BEGIN
  -- Extract the numeric part from existing codes and find the max
  SELECT COALESCE(MAX(CAST(SUBSTRING(agent_code FROM 2) AS INTEGER)), 0)
  INTO max_code
  FROM public.product_affiliate_links
  WHERE agent_code ~ '^A[0-9]+$';
  
  -- Generate next code with zero-padding
  next_code := 'A' || LPAD((max_code + 1)::TEXT, 2, '0');
  
  RETURN next_code;
END;
$$;

-- Function to increment click count
CREATE OR REPLACE FUNCTION public.increment_affiliate_link_clicks(link_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_affiliate_links
  SET click_count = click_count + 1, updated_at = now()
  WHERE slug = link_slug AND is_active = true;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_product_affiliate_links_updated_at
BEFORE UPDATE ON public.product_affiliate_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();