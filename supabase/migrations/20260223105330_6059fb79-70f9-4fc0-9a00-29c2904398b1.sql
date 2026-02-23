
-- Add distributor to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'distributor';

-- Add pv_value column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pv_value numeric NOT NULL DEFAULT 0;

-- Create distributor_pv_logs table
CREATE TABLE public.distributor_pv_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  pv_value numeric NOT NULL DEFAULT 0,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  referral_type text NOT NULL DEFAULT 'purchase',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.distributor_pv_logs ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own PV logs
CREATE POLICY "Distributors can view own PV logs"
ON public.distributor_pv_logs
FOR SELECT
USING (auth.uid() = distributor_id);

-- Admins can view all PV logs
CREATE POLICY "Admins can view all PV logs"
ON public.distributor_pv_logs
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Only system (via security definer functions) should insert PV logs
-- Allow inserts through authenticated users for the conversion recording function
CREATE POLICY "System can insert PV logs"
ON public.distributor_pv_logs
FOR INSERT
WITH CHECK (true);

-- Admins can manage PV logs
CREATE POLICY "Admins can manage PV logs"
ON public.distributor_pv_logs
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Create function to record distributor PV from a conversion
CREATE OR REPLACE FUNCTION public.record_distributor_pv(
  p_distributor_user_id uuid,
  p_product_id uuid,
  p_pv_value numeric,
  p_order_id uuid DEFAULT NULL,
  p_referral_type text DEFAULT 'purchase'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.distributor_pv_logs (
    distributor_id,
    product_id,
    pv_value,
    order_id,
    referral_type
  ) VALUES (
    p_distributor_user_id,
    p_product_id,
    p_pv_value,
    p_order_id,
    p_referral_type
  );
END;
$$;

-- Create function to get distributor PV summary
CREATE OR REPLACE FUNCTION public.get_distributor_pv_summary(p_distributor_id uuid)
RETURNS TABLE(total_pv numeric, total_conversions bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(SUM(pv_value), 0) as total_pv,
    COUNT(*)::bigint as total_conversions
  FROM public.distributor_pv_logs
  WHERE distributor_id = p_distributor_id;
$$;
