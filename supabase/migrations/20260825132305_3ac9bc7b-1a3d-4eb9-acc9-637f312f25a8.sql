ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS content_category text NOT NULL DEFAULT 'health';

ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_content_category_check
  CHECK (content_category IN ('health', 'business'));