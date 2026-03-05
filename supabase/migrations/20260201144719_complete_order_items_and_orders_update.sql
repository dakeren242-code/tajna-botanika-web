/*
  # Complete Order Items and Orders Update

  1. Order Items
    - Add variant_id and historical data columns
    - Migrate existing data

  2. Orders
    - Add customer data columns
    - Add pricing breakdown columns
    - Add fulfillment status
*/

-- =============================================================================
-- 1. UPDATE ORDER_ITEMS
-- =============================================================================

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
    ALTER TABLE order_items ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_sku') THEN
    ALTER TABLE order_items ADD COLUMN product_sku TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_name') THEN
    ALTER TABLE order_items ADD COLUMN variant_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_weight_grams') THEN
    ALTER TABLE order_items ADD COLUMN variant_weight_grams INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'line_total') THEN
    ALTER TABLE order_items ADD COLUMN line_total NUMERIC(10,2);
  END IF;
END $$;

-- Migrate existing data
UPDATE order_items
SET
  variant_name = COALESCE(gram_amount, '1g'),
  variant_weight_grams = CAST(REGEXP_REPLACE(COALESCE(gram_amount, '1g'), '[^0-9]', '', 'g') AS INTEGER),
  line_total = unit_price * quantity
WHERE variant_name IS NULL OR line_total IS NULL;

-- Link existing order_items to variants (best effort)
UPDATE order_items oi
SET variant_id = pv.id
FROM product_variants pv
WHERE oi.product_id = pv.product_id
AND oi.variant_name = pv.variant_name
AND oi.variant_id IS NULL;

-- =============================================================================
-- 2. ENHANCE ORDERS TABLE
-- =============================================================================

-- Add columns if they don't exist
DO $$
BEGIN
  -- Customer data columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_first_name') THEN
    ALTER TABLE orders ADD COLUMN customer_first_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_last_name') THEN
    ALTER TABLE orders ADD COLUMN customer_last_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
  END IF;

  -- Pricing breakdown columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
    ALTER TABLE orders ADD COLUMN subtotal NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
    ALTER TABLE orders ADD COLUMN shipping_cost NUMERIC(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cod_fee') THEN
    ALTER TABLE orders ADD COLUMN cod_fee NUMERIC(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(10,2) DEFAULT 0;
  END IF;

  -- Additional metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_notes') THEN
    ALTER TABLE orders ADD COLUMN customer_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'internal_notes') THEN
    ALTER TABLE orders ADD COLUMN internal_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'confirmed_at') THEN
    ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
    ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_status') THEN
    ALTER TABLE orders ADD COLUMN fulfillment_status TEXT DEFAULT 'unfulfilled';
  END IF;
END $$;

-- Migrate existing data from old columns to new columns
UPDATE orders
SET
  customer_first_name = COALESCE(customer_first_name, first_name),
  customer_last_name = COALESCE(customer_last_name, last_name),
  customer_email = COALESCE(customer_email, email),
  customer_phone = COALESCE(customer_phone, phone),
  subtotal = COALESCE(subtotal, total_amount),
  confirmed_at = COALESCE(confirmed_at, created_at)
WHERE customer_first_name IS NULL OR subtotal IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status);
