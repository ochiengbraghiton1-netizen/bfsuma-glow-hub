
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-posts', 'social-posts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view social post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-posts');

CREATE POLICY "Admins can upload social post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'social-posts' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can delete social post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'social-posts' AND public.is_admin_or_editor(auth.uid()));
