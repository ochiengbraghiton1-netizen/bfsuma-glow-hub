
-- Create public categories storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true);

-- Allow public read access
CREATE POLICY "Public read access for categories" ON storage.objects
  FOR SELECT USING (bucket_id = 'categories');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'categories');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update category images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'categories');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'categories');
