/*
  # Zjednodušení RLS politik pro order_items

  1. Změny
    - Odstranění složitých dotazů na auth.users
    - Jednodušší politiky pro čtení
    - Umožnění vkládání order_items

  2. Security
    - Kdokoli může vložit order_items (potřebné pro checkout)
    - Uživatelé vidí pouze své order_items
    - Admin vidí všechny order_items
*/

-- Odstranit existující politiky
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Politika pro vkládání order_items (kdokoli)
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politika pro čtení vlastních order_items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Politika pro admin přístup k order_items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );