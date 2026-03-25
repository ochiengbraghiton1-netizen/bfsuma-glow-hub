ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS delivery_location text DEFAULT 'nairobi',
  ADD COLUMN IF NOT EXISTS shipping_fee numeric NOT NULL DEFAULT 0;