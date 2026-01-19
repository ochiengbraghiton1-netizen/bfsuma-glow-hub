-- Create business registrations table
CREATE TABLE public.business_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  county_city TEXT NOT NULL,
  has_sponsor BOOLEAN NOT NULL DEFAULT false,
  sponsor_name TEXT,
  sponsor_phone TEXT,
  sponsor_membership_id TEXT,
  assigned_sponsor_id UUID REFERENCES public.business_registrations(id),
  entry_fee NUMERIC NOT NULL DEFAULT 7000,
  agreement_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejection_reason TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for sponsor relationships
CREATE INDEX idx_business_registrations_assigned_sponsor ON public.business_registrations(assigned_sponsor_id);
CREATE INDEX idx_business_registrations_status ON public.business_registrations(status);
CREATE INDEX idx_business_registrations_phone ON public.business_registrations(phone);

-- Enable RLS
ALTER TABLE public.business_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a registration
CREATE POLICY "Anyone can create registrations"
ON public.business_registrations
FOR INSERT
WITH CHECK (true);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
ON public.business_registrations
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Admins can manage registrations
CREATE POLICY "Admins can manage registrations"
ON public.business_registrations
FOR UPDATE
USING (is_admin_or_editor(auth.uid()));

-- Admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.business_registrations
FOR DELETE
USING (is_admin_or_editor(auth.uid()));

-- Users can view their own registration
CREATE POLICY "Users can view own registration"
ON public.business_registrations
FOR SELECT
USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_business_registrations_updated_at
BEFORE UPDATE ON public.business_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();