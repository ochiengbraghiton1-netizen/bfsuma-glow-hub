CREATE POLICY "Admins and editors can upload content media files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-media' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update content media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-media' AND public.is_admin_or_editor(auth.uid()))
WITH CHECK (bucket_id = 'content-media' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete content media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-media' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Signed-in users can read content media files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-media');