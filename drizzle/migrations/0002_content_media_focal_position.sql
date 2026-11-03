ALTER TABLE public.content_media
  ADD COLUMN IF NOT EXISTS focal_position TEXT NOT NULL DEFAULT 'center';

ALTER TABLE public.content_media
  ADD CONSTRAINT content_media_focal_position_check
  CHECK (focal_position IN ('top-left','top','top-right','left','center','right','bottom-left','bottom','bottom-right')) NOT VALID;

COMMENT ON COLUMN public.content_media.focal_position IS 'Which part of the image should stay visible when the hero crops it (CSS object-position preset).';