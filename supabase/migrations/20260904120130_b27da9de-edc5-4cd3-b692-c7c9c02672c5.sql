CREATE TABLE public.blog_post_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_post_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_faqs TO authenticated;
GRANT ALL ON public.blog_post_faqs TO service_role;

ALTER TABLE public.blog_post_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog post faqs"
ON public.blog_post_faqs FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage blog post faqs"
ON public.blog_post_faqs FOR ALL TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE INDEX idx_blog_post_faqs_post ON public.blog_post_faqs(post_id, display_order);