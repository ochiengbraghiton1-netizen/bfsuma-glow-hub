
-- Add video_url and is_featured to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Create junction table for blog posts to products
CREATE TABLE IF NOT EXISTS public.blog_post_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, product_id)
);

-- Enable RLS
ALTER TABLE public.blog_post_products ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view post products"
ON public.blog_post_products FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post products"
ON public.blog_post_products FOR ALL
USING (is_admin_or_editor(auth.uid()));
