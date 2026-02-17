-- Allow anyone to view active affiliate IDs and codes for tracking purposes
CREATE POLICY "Anyone can view active affiliate codes" 
ON public.affiliates 
FOR SELECT 
USING (status = 'active');

-- Ensure anyone can insert into affiliate_clicks
-- (The policy already exists but let's make sure it's correctly applied)
-- Policy Name: Anyone can create clicks | Command: INSERT | With Check Expression: true
