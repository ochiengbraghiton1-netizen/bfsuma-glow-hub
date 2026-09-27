CREATE TABLE public.team_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  photo_url text,
  bio text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO authenticated;
GRANT ALL ON public.team_profiles TO service_role;
ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active team profiles" ON public.team_profiles FOR SELECT USING (is_active = true OR public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors manage team profiles" ON public.team_profiles FOR ALL TO authenticated USING (public.is_admin_or_editor(auth.uid())) WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE TRIGGER update_team_profiles_updated_at BEFORE UPDATE ON public.team_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view join business media" ON public.content_media FOR SELECT USING (content_type = 'business' AND content_id = 'join-business');