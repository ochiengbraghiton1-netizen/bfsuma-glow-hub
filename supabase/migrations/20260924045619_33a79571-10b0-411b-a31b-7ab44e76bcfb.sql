DROP POLICY IF EXISTS "Signed-in users can read content media files" ON storage.objects;

CREATE POLICY "Admins and editors can read content media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-media'
  AND public.is_admin_or_editor((SELECT auth.uid()))
);