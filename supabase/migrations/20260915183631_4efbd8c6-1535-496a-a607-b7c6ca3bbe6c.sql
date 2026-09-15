CREATE TABLE public.content_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  slot_key text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  media_url text NOT NULL,
  alt_text text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_media_slot_key_valid CHECK (slot_key IN ('hero','recognition','desired_outcome','education','product_context','trust','closing')),
  CONSTRAINT content_media_unique_slot UNIQUE (content_type, content_id, slot_key)
);

GRANT SELECT ON public.content_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_media TO authenticated;
GRANT ALL ON public.content_media TO service_role;

ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media for active wellness hubs"
ON public.content_media FOR SELECT
USING (
  content_type = 'wellness_hub'
  AND EXISTS (
    SELECT 1 FROM public.wellness_hubs h
    WHERE h.id = content_media.content_id AND h.is_active = true
  )
);

CREATE POLICY "Admins and editors can manage content media"
ON public.content_media FOR ALL
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE INDEX idx_content_media_lookup ON public.content_media (content_type, content_id);

CREATE TRIGGER update_content_media_updated_at
BEFORE UPDATE ON public.content_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();