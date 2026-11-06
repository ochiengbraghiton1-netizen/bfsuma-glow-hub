ALTER TABLE public.content_media ALTER COLUMN overlay_level SET DEFAULT 'none';
UPDATE public.content_media SET overlay_level = 'none' WHERE slot_key = 'hero';