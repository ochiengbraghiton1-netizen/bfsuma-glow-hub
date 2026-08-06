CREATE TABLE public.blog_post_quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  label text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_post_quiz_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_quiz_options TO authenticated;
GRANT ALL ON public.blog_post_quiz_options TO service_role;

ALTER TABLE public.blog_post_quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog post quiz options"
ON public.blog_post_quiz_options FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage blog post quiz options"
ON public.blog_post_quiz_options FOR ALL TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE INDEX idx_blog_post_quiz_options_post ON public.blog_post_quiz_options(post_id, display_order);