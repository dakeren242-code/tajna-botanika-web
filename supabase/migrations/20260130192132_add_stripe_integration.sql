/*
  # Add Stripe Integration to Products

  ## Changes
  1. Add Stripe columns to products table:
     - `stripe_product_id` (text) - Stripe Product ID (prod_xxx)
     - `stripe_prices` (jsonb) - Map of gram amounts to Stripe Price IDs
       Example: {"1g": "price_xxx", "3g": "price_yyy", "5g": "price_zzz", "10g": "price_aaa"}
  
  2. Update orders table:
     - Add `stripe_payment_intent_id` to track Stripe payments
     - Add `stripe_checkout_session_id` for checkout sessions
     - Add `gram_amount` to store selected variant
  
  3. Update order_items table:
     - Add `gram_amount` column to track which variant was ordered
*/

-- Add Stripe columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_prices'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_prices jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add Stripe columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_checkout_session_id text;
  END IF;
END $$;

-- Add gram_amount to order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'gram_amount'
  ) THEN
    ALTER TABLE order_items ADD COLUMN gram_amount text DEFAULT '1g';
  END IF;
END $$;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_product ON products(stripe_product_id);