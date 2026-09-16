DROP POLICY IF EXISTS "Public can view media for active wellness hubs" ON public.content_media;

ALTER TABLE public.content_media ALTER COLUMN content_id TYPE text USING content_id::text;

CREATE POLICY "Public can view media for active content"
ON public.content_media
FOR SELECT
USING (
  (content_type = 'wellness_hub' AND EXISTS (
    SELECT 1 FROM public.wellness_hubs h
    WHERE h.id::text = content_media.content_id AND h.is_active = true
  ))
  OR
  (content_type = 'location' AND EXISTS (
    SELECT 1 FROM public.location_pages lp
    WHERE lp.city_slug = content_media.content_id AND lp.is_published = true
  ))
);