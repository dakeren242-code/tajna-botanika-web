/*
  # Create Product Variants Table

  1. New Table
    - `product_variants` - Different gram amounts with individual prices
      - Links to products
      - Stores price, stock, availability per variant
      - Supports future bundle/subscription variants

  2. Security
    - Enable RLS
    - Everyone can view available variants
    - Admins can manage all variants
*/

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Variant details
  variant_name TEXT NOT NULL,           -- "1g", "3g", "5g", "10g"
  variant_type TEXT NOT NULL DEFAULT 'weight',  -- 'weight', 'bundle', 'subscription'
  weight_grams INTEGER NOT NULL,        -- 1, 3, 5, 10

  -- Pricing
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10,2),       -- Original price for discount display
  cost_price NUMERIC(10,2),             -- Cost for margin calculation

  -- Inventory
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 5,

  -- Metadata
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(product_id, variant_name)
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_available ON product_variants(is_available) WHERE is_available = true;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can view available variants
CREATE POLICY "Enable select for all users"
  ON product_variants
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Admins can manage variants
CREATE POLICY "Enable all for admins"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- Function to decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET
    stock = stock - p_quantity,
    updated_at = now()
  WHERE id = p_variant_id
  AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
