/*
  # Fix Database Security Issues

  ## Performance Optimizations

  1. **Add Missing Foreign Key Indexes**
    - Add index on orders.billing_address_id
    - Add index on orders.delivery_address_id

  2. **Optimize RLS Policies (Auth Function Caching)**
    - Replace auth.uid() with (select auth.uid()) in all policies
    - This prevents re-evaluation for each row, dramatically improving performance

  3. **Fix Function Search Paths**
    - Add explicit search_path to all functions for security

  ## Security Fixes

  4. **Fix Products RLS Policies**
    - Products INSERT/UPDATE/DELETE should only allow admins
    - Current policies with "true" bypass all security

  5. **Consolidate Multiple Permissive Policies**
    - Merge overlapping policies for better performance

  ## Notes
  - Unused indexes warnings are expected with empty/low-data databases
  - Auth DB connection strategy requires admin panel configuration
  - Leaked password protection requires admin panel configuration
*/

-- =============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_billing_address_id 
ON orders(billing_address_id);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id 
ON orders(delivery_address_id);

-- =============================================
-- 2. FIX FUNCTION SEARCH PATHS
-- =============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  current_year TEXT;
  sequence_num INTEGER;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE current_year || '%';
  
  new_number := current_year || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================
-- 3. FIX PRODUCTS RLS POLICIES
-- =============================================

-- Drop the insecure policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create secure admin-only policies
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- =============================================
-- 4. OPTIMIZE ALL RLS POLICIES (AUTH CACHING)
-- =============================================

-- admin_users table
DROP POLICY IF EXISTS "Admins can read admin users" ON admin_users;
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users AS a
      WHERE a.user_id = (SELECT auth.uid())
    )
  );

-- user_profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Consolidated profile policies with optimized auth
CREATE POLICY "Users and admins can read profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- addresses table
DROP POLICY IF EXISTS "Users can read own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can read all addresses" ON addresses;

-- Consolidated address policies
CREATE POLICY "Users and admins can read addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can manage own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- orders table
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Consolidated order policies
CREATE POLICY "Users and admins can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

-- order_items table
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;

-- Consolidated order items policies
CREATE POLICY "Users and admins can read order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- =============================================
-- 5. ADD HELPFUL COMMENTS
-- =============================================

COMMENT ON POLICY "Users and admins can read profiles" ON user_profiles IS 
  'Allows users to read their own profile and admins to read all profiles. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users and admins can read addresses" ON addresses IS 
  'Allows users to read their own addresses and admins to read all addresses. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users and admins can read orders" ON orders IS 
  'Allows users to read their own orders and admins to read all orders. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users and admins can read order items" ON order_items IS 
  'Allows users to read their own order items and admins to read all items. Uses SELECT subquery for auth.uid() optimization.';
