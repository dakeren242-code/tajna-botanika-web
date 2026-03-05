/*
  # Remove Stripe Integration

  1. Changes
    - Remove `stripe_product_id` column from products table
    - Remove `stripe_prices` column from products table
    - Remove `stripe_customer_id` column from users table (if exists)
  
  2. Notes
    - Migration to Pays.cz payment gateway
    - All Stripe-related data will be removed
*/

-- Remove Stripe columns from products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products DROP COLUMN stripe_product_id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_prices'
  ) THEN
    ALTER TABLE products DROP COLUMN stripe_prices;
  END IF;
END $$;

-- Remove Stripe customer ID from users table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users DROP COLUMN stripe_customer_id;
  END IF;
END $$;
