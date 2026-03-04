
-- Create social_posts table for admin-curated UGC
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'instagram',
  author_name TEXT NOT NULL,
  author_handle TEXT,
  author_avatar_url TEXT,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  post_url TEXT,
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved posts
CREATE POLICY "Anyone can view approved social posts"
ON public.social_posts
FOR SELECT
USING (is_approved = true);

-- Admins can manage all posts
CREATE POLICY "Admins can manage social posts"
ON public.social_posts
FOR ALL
USING (is_admin_or_editor(auth.uid()));
