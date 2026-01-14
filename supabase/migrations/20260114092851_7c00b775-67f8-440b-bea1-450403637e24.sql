-- Create function to increment affiliate clicks
CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(affiliate_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  aff_id UUID;
BEGIN
  -- Get the affiliate ID from the referral code
  SELECT id INTO aff_id FROM public.affiliates 
  WHERE referral_code = affiliate_code AND status = 'active';
  
  IF aff_id IS NOT NULL THEN
    -- Increment the click count
    UPDATE public.affiliates 
    SET total_clicks = total_clicks + 1, updated_at = now()
    WHERE id = aff_id;
  END IF;
END;
$$;