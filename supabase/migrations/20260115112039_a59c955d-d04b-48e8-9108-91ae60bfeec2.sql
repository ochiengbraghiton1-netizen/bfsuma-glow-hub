-- Create atomic stock decrement function with row locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
  tracks_inventory BOOLEAN;
BEGIN
  -- Lock the row and get current stock
  SELECT stock_quantity, track_inventory INTO current_stock, tracks_inventory
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  -- If product doesn't track inventory, always succeed
  IF tracks_inventory IS NULL OR tracks_inventory = FALSE THEN
    RETURN TRUE;
  END IF;
  
  -- Check if sufficient stock
  IF current_stock IS NULL OR current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  -- Atomically decrement stock
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$;