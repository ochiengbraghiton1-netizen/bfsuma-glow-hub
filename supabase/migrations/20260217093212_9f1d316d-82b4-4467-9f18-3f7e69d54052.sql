
-- 1. Add name and email columns to affiliates table
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Make user_id nullable (admin-created affiliates don't need auth accounts)
ALTER TABLE public.affiliates ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add affiliate_id FK column to product_affiliate_links
ALTER TABLE public.product_affiliate_links ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- 4. Migrate existing TESTLINK1 affiliate - set a name
UPDATE public.affiliates SET name = 'Test Affiliate' WHERE referral_code = 'TESTLINK1' AND name IS NULL;

-- 5. Create affiliate records for each unique assigned_to name in product_affiliate_links
-- and link them back
DO $$
DECLARE
  assignee_name TEXT;
  new_aff_id UUID;
  new_code TEXT;
BEGIN
  FOR assignee_name IN 
    SELECT DISTINCT assigned_to FROM public.product_affiliate_links 
    WHERE assigned_to IS NOT NULL AND assigned_to != ''
  LOOP
    -- Generate a unique referral code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Create affiliate record
    INSERT INTO public.affiliates (name, referral_code, referral_url, status, user_id)
    VALUES (
      assignee_name, 
      new_code, 
      'https://bfsumaroyal.com/?ref=' || new_code,
      'active',
      NULL
    )
    RETURNING id INTO new_aff_id;
    
    -- Link existing product_affiliate_links to this affiliate
    UPDATE public.product_affiliate_links 
    SET affiliate_id = new_aff_id 
    WHERE assigned_to = assignee_name;
  END LOOP;
END $$;

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_affiliate_links_affiliate_id ON public.product_affiliate_links(affiliate_id);
