-- Update the handle_referral_signup function with correct base URL
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referral_code_param TEXT;
  referrer_affiliate_id UUID;
  new_affiliate_id UUID;
  new_referral_code TEXT;
  base_url TEXT;
BEGIN
  -- Get the referral code from user metadata
  referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
  
  -- Use the correct production URL
  base_url := 'https://bfsumaroyal.com';
  
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
      
      -- Generate a new referral code for the new user
      new_referral_code := generate_referral_code();
      
      -- Create the new user's affiliate account linked to referrer
      INSERT INTO public.affiliates (
        user_id, 
        referral_code, 
        referral_url, 
        referred_by, 
        status
      ) VALUES (
        NEW.id,
        new_referral_code,
        base_url || '/?ref=' || new_referral_code,
        referrer_affiliate_id,
        'active'
      )
      RETURNING id INTO new_affiliate_id;
      
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
$function$;

-- Update existing affiliates with the correct referral_url format
UPDATE public.affiliates 
SET referral_url = 'https://bfsumaroyal.com/?ref=' || referral_code
WHERE referral_url IS NULL 
   OR referral_url LIKE '%lovable.app%';