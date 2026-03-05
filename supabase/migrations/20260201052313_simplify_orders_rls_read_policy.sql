/*
  # Zjednodušení RLS politiky pro čtení objednávek

  1. Změny
    - Odstranění složitého dotazu na auth.users
    - Jednodušší kontrola pouze na user_id
    - Uživatelé mohou číst pouze objednávky kde jsou vlastníci (user_id)

  2. Security
    - Přihlášení uživatelé vidí pouze své objednávky (podle user_id)
    - Admin vidí všechny objednávky
*/

-- Odstranit existující politiku
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Jednodušší politika - pouze kontrola user_id
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());