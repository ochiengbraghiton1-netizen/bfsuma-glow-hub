
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paypal_transaction_id text;

-- Backfill existing orders based on current status
UPDATE public.orders SET payment_method = 'paypal', payment_status = 'paid' WHERE status = 'paid';
UPDATE public.orders SET payment_method = 'whatsapp', payment_status = 'pending' WHERE status IN ('pending_whatsapp', 'whatsapp_initiated', 'pending');
UPDATE public.orders SET payment_status = 'paid' WHERE status IN ('confirmed', 'completed');
