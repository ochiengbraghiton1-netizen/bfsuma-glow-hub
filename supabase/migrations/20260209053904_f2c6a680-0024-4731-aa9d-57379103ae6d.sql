-- Add blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add blog_post_categories junction table for many-to-many relationship
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Add scheduled_at column to blog_posts for scheduling
ALTER TABLE public.blog_posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories
CREATE POLICY "Anyone can view categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.blog_categories 
FOR ALL 
USING (is_admin_or_editor(auth.uid()));

-- RLS policies for blog_post_categories
CREATE POLICY "Anyone can view post categories" 
ON public.blog_post_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage post categories" 
ON public.blog_post_categories 
FOR ALL 
USING (is_admin_or_editor(auth.uid()));

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Health Tips', 'health-tips', 'General health and wellness advice'),
('Product Updates', 'product-updates', 'News about BF SUMA products'),
('Success Stories', 'success-stories', 'Customer testimonials and success stories'),
('Nutrition', 'nutrition', 'Diet and nutrition information');