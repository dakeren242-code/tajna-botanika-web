/*
  # Add payment_method and shipping_method columns to orders table

  1. Changes
    - Add `payment_method` column to orders table (TEXT)
      - Valid values: 'bank_transfer', 'card', 'cash_on_delivery'
    - Add `shipping_method` column to orders table (TEXT)
      - Valid values: 'zasilkovna', 'personal_pickup', 'personal_invoice'
  
  2. Notes
    - Using IF NOT EXISTS to prevent errors if columns already exist
    - Columns are nullable to support existing orders
*/

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT;
  END IF;
END $$;

-- Add shipping_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_method TEXT;
  END IF;
END $$;

-- Add check constraint for payment_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method IN ('bank_transfer', 'card', 'cash_on_delivery'));
  END IF;
END $$;

-- Add check constraint for shipping_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'orders_shipping_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_shipping_method_check 
    CHECK (shipping_method IN ('zasilkovna', 'personal_pickup', 'personal_invoice'));
  END IF;
END $$;