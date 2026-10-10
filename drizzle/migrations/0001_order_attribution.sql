ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agent_code text,
  ADD COLUMN IF NOT EXISTS referral_source text CHECK (referral_source IN ('product_link','ref_code'));
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id ON public.orders(affiliate_id);