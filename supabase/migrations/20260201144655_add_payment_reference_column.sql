/*
  # Add Payment Reference Column

  1. Add payment_reference column to orders
  2. Create function to generate unique references
  3. Generate references for existing orders
*/

-- Add payment_reference column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_reference') THEN
    ALTER TABLE orders ADD COLUMN payment_reference TEXT UNIQUE;
  END IF;
END $$;

-- Function to generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num INTEGER;
  reference TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  -- Find the highest sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(payment_reference FROM LENGTH(year) + 1) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE payment_reference ~ ('^' || year || '[0-9]+$')
  AND payment_reference IS NOT NULL;

  -- Format: YYYYNNNNNN (e.g., 2026000001)
  reference := year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Generate payment_reference for existing orders that don't have one
DO $$
DECLARE
  order_record RECORD;
  ref TEXT;
BEGIN
  FOR order_record IN
    SELECT id FROM orders WHERE payment_reference IS NULL ORDER BY created_at
  LOOP
    ref := generate_payment_reference();
    UPDATE orders SET payment_reference = ref WHERE id = order_record.id;
  END LOOP;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON orders(payment_reference) WHERE payment_reference IS NOT NULL;
