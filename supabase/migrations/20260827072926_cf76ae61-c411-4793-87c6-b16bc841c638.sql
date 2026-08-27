ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS video_title text,
  ADD COLUMN IF NOT EXISTS video_description text,
  ADD COLUMN IF NOT EXISTS video_orientation text NOT NULL DEFAULT 'auto';

ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_video_orientation_check
  CHECK (video_orientation IN ('auto','portrait','landscape','square'));