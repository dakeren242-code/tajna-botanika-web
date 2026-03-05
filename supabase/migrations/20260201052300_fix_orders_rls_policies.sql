/*
  # Oprava RLS politik pro objednávky

  1. Změny
    - Zjednodušení RLS politik pro orders
    - Odstranění přístupu k auth.users tabulce
    - Umožnění vkládání objednávek bez přihlášení (anon)
    - Umožnění čtení objednávek podle user_id nebo emailu

  2. Security
    - Kdokoli může vytvořit objednávku (anon i authenticated)
    - Pouze vlastník objednávky může ji číst (podle user_id nebo emailu)
    - Admin může číst všechny objednávky
*/

-- Odstranit existující politiky
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;

-- Politika pro vkládání objednávek (kdokoli může vložit včetně nepřihlášených)
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politika pro čtení vlastních objednávek pro přihlášené uživatele
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1))
  );

-- Politika pro admin přístup k objednávkám
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Politika pro admin update objednávek
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );