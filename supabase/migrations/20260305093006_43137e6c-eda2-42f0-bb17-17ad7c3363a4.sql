
-- Create leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  source text NOT NULL DEFAULT 'exit_popup',
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint on email to prevent duplicates
CREATE UNIQUE INDEX leads_email_unique ON public.leads (email);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (public form)
CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- Admins can update leads (e.g. unsubscribe)
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  USING (is_admin_or_editor(auth.uid()));

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  USING (is_admin_or_editor(auth.uid()));
