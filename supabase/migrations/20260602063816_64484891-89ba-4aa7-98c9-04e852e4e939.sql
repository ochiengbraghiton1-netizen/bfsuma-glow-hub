ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'health'
CHECK (content_type IN ('health', 'business'));

CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type_status
ON public.blog_posts (content_type, status);