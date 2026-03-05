/*
  # Create Cart Tables

  1. New Tables
    - `carts` - Cart header (user or session based)
    - `cart_items` - Items in cart

  2. Features
    - Supports both authenticated users and guests (via session_id)
    - Auto-expires guest carts after 30 days
    - One cart per user/session

  3. Security
    - Enable RLS
    - Users can manage their own cart
    - Guests can manage their session cart
*/

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner (either user_id OR session_id)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,                      -- For guest users

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),

  -- Only one cart per user or session
  UNIQUE(user_id),
  UNIQUE(session_id),

  -- Must have either user_id or session_id
  CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE INDEX idx_carts_user ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session ON carts(session_id) WHERE user_id IS NULL;
CREATE INDEX idx_carts_expires ON carts(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own cart
CREATE POLICY "Enable all for own cart"
  ON carts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anonymous users can manage their session cart
CREATE POLICY "Enable all for session cart"
  ON carts
  FOR ALL
  TO anon, authenticated
  USING (session_id IS NOT NULL);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

  -- Product reference
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

  -- Quantity
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One product variant per cart
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can manage items in their cart
CREATE POLICY "Enable all for cart items"
  ON cart_items
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
    )
  );

-- Function to update cart timestamp on item change
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts
  SET updated_at = now()
  WHERE id = NEW.cart_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_update_cart_timestamp
AFTER INSERT OR UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_timestamp();
