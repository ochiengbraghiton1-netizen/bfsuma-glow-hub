-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referral_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  commission_rate NUMERIC NOT NULL DEFAULT 10,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_signups INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_commission NUMERIC NOT NULL DEFAULT 0,
  referred_by UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_clicks table for tracking
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table to track signups and conversions
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  referral_type TEXT NOT NULL DEFAULT 'signup' CHECK (referral_type IN ('signup', 'lead', 'purchase')),
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates
CREATE POLICY "Users can view their own affiliate record"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliates"
ON public.affiliates FOR SELECT
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage affiliates"
ON public.affiliates FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- RLS Policies for affiliate_clicks
CREATE POLICY "Affiliates can view their own clicks"
ON public.affiliate_clicks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.affiliates 
  WHERE affiliates.id = affiliate_clicks.affiliate_id 
  AND affiliates.user_id = auth.uid()
));

CREATE POLICY "Admins can view all clicks"
ON public.affiliate_clicks FOR SELECT
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Anyone can create clicks"
ON public.affiliate_clicks FOR INSERT
WITH CHECK (true);

-- RLS Policies for referrals
CREATE POLICY "Affiliates can view their own referrals"
ON public.referrals FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.affiliates 
  WHERE affiliates.id = referrals.affiliate_id 
  AND affiliates.user_id = auth.uid()
));

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to handle new user signup with referral
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_code_param TEXT;
  referrer_affiliate_id UUID;
  new_affiliate_id UUID;
  base_url TEXT;
BEGIN
  -- Get the referral code from user metadata
  referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
  
  -- Get the base URL for generating referral links
  base_url := 'https://bfsuma-glow-hub.lovable.app';
  
  -- If user signed up with a referral code, find the referrer
  IF referral_code_param IS NOT NULL AND referral_code_param != '' THEN
    SELECT id INTO referrer_affiliate_id
    FROM public.affiliates
    WHERE referral_code = referral_code_param AND status = 'active';
    
    -- If referrer exists, update their signup count
    IF referrer_affiliate_id IS NOT NULL THEN
      UPDATE public.affiliates
      SET total_signups = total_signups + 1, updated_at = now()
      WHERE id = referrer_affiliate_id;
      
      -- Create the new user's affiliate account linked to referrer
      INSERT INTO public.affiliates (
        user_id, 
        referral_code, 
        referral_url, 
        referred_by, 
        status
      ) VALUES (
        NEW.id,
        generate_referral_code(),
        base_url || '/?ref=' || generate_referral_code(),
        referrer_affiliate_id,
        'active'
      )
      RETURNING id INTO new_affiliate_id;
      
      -- Update the referral_url with the actual code
      UPDATE public.affiliates
      SET referral_url = base_url || '/?ref=' || referral_code
      WHERE id = new_affiliate_id;
      
      -- Create a referral record
      INSERT INTO public.referrals (
        affiliate_id,
        referred_user_id,
        referral_type,
        status
      ) VALUES (
        referrer_affiliate_id,
        NEW.id,
        'signup',
        'approved'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user creation
CREATE TRIGGER on_auth_user_created_affiliate
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_signup();

-- Add updated_at trigger for affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for referrals
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_affiliates_referred_by ON public.affiliates(referred_by);
CREATE INDEX idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);