
-- 1. Public read of affiliates: replace with RPCs and drop public SELECT
DROP POLICY IF EXISTS "Anyone can view active affiliate codes" ON public.affiliates;
DROP POLICY IF EXISTS "Anyone can view active affiliate links" ON public.product_affiliate_links;

-- RPC to track an affiliate click without exposing affiliate columns
CREATE OR REPLACE FUNCTION public.track_affiliate_click(
  p_code text,
  p_user_agent text DEFAULT NULL,
  p_referrer_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.affiliates
  WHERE referral_code = p_code AND status = 'active';

  IF v_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.affiliate_clicks (affiliate_id, user_agent, referrer_url)
  VALUES (v_id, p_user_agent, p_referrer_url);

  UPDATE public.affiliates
  SET total_clicks = total_clicks + 1, updated_at = now()
  WHERE id = v_id;
END;
$$;

-- RPC to resolve product affiliate link by slug (limited columns)
CREATE OR REPLACE FUNCTION public.get_affiliate_product_link(p_slug text)
RETURNS TABLE (product_id uuid, slug text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT product_id, slug
  FROM public.product_affiliate_links
  WHERE slug = p_slug AND is_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_product_link(text) TO anon, authenticated;

-- 2. team_members: scope policies to authenticated role only
DROP POLICY IF EXISTS "Admins and editors can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins and editors can manage team members" ON public.team_members;

CREATE POLICY "Admins and editors can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can manage team members"
  ON public.team_members FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- 3. Categories storage bucket: restrict write to admins/editors
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete category images" ON storage.objects;

CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'categories' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update category images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'categories' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can delete category images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'categories' AND public.is_admin_or_editor(auth.uid()));
