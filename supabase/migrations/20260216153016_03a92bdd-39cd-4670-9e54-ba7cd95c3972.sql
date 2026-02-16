-- Create a function to record affiliate conversions atomically
-- Called from checkout after order is created
CREATE OR REPLACE FUNCTION public.record_affiliate_conversion(
  p_referral_code text,
  p_order_id uuid,
  p_order_total numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_affiliate_id UUID;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Look up active affiliate by referral code
  SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
  FROM public.affiliates
  WHERE referral_code = p_referral_code AND status = 'active'
  FOR UPDATE;

  IF v_affiliate_id IS NULL THEN
    RETURN; -- Invalid or inactive code, silently skip
  END IF;

  -- Calculate commission
  v_commission_amount := ROUND((p_order_total * v_commission_rate / 100), 2);

  -- Create referral record
  INSERT INTO public.referrals (
    affiliate_id,
    order_id,
    referral_type,
    commission_amount,
    status
  ) VALUES (
    v_affiliate_id,
    p_order_id,
    'purchase',
    v_commission_amount,
    'approved'
  );

  -- Update affiliate counters
  UPDATE public.affiliates
  SET 
    total_conversions = total_conversions + 1,
    total_sales = total_sales + p_order_total,
    total_commission = total_commission + v_commission_amount,
    updated_at = now()
  WHERE id = v_affiliate_id;
END;
$function$;