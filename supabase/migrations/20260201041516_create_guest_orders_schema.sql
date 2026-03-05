/*
  # Schéma pro objednávky bez registrace

  1. Úprava tabulky orders
    - Přidání sloupců pro jméno, příjmení, email, telefon
    - Změna user_id na nullable
    - Přidání indexů pro rychlejší vyhledávání
  
  2. Nová tabulka order_items
    - `id` (uuid, primary key)
    - `order_id` (uuid, foreign key)
    - `product_id` (uuid, foreign key)
    - `product_name` (text)
    - `product_price` (decimal)
    - `quantity` (integer)
    - `variant` (text)
    
  3. Security
    - RLS pro orders umožňuje vkládání bez přihlášení
    - RLS pro order_items umožňuje vkládání bez přihlášení
    - Čtení pouze pro vlastníka nebo admin
*/

-- Přidání sloupců do orders pro objednávky bez registrace
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE orders ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_address jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_point_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_point_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'packeta_point_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN packeta_point_name text;
  END IF;
END $$;

-- Změna user_id na nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Vytvoření tabulky order_items pokud neexistuje
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price decimal(10, 2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  variant text,
  created_at timestamptz DEFAULT now()
);

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS pro order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Politika pro vkládání order_items (kdokoli může vložit)
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politika pro čtení order_items (vlastník nebo admin)
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Politika pro admin přístup k order_items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Upravit RLS pro orders aby umožňovala vkládání bez přihlášení
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politika pro čtení vlastních objednávek (i pro nepřihlášené přes email)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );