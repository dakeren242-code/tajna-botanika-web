/*
  # Fix Performance and Security Issues

  This migration addresses multiple performance and security concerns identified in the database audit:

  ## 1. Unindexed Foreign Keys
  Add indexes for foreign keys to improve query performance on:
    - `cart_items.product_id`
    - `cart_items.variant_id`
    - `order_items.order_id`
    - `order_items.product_id`
    - `payment_transactions.order_id`

  ## 2. Auth RLS Optimization
  Optimize the admin_users RLS policy to use subquery pattern for better performance:
    - Replace `auth.uid()` with `(select auth.uid())`

  ## 3. Remove Unused Indexes
  Drop indexes that are not being used to reduce storage overhead:
    - `idx_addresses_user_id`
    - `idx_order_items_variant_id_new`
    - `idx_orders_billing_address_id`
    - `idx_orders_delivery_address_id`
    - `idx_orders_user_id`
    - `idx_payment_transactions_payment_method_id`

  ## 4. Consolidate Multiple Permissive Policies
  Merge multiple permissive SELECT policies into single policies for:
    - `payment_methods`
    - `product_variants`
    - `shipping_methods`

  ## Important Notes
  - Auth DB Connection Strategy and Leaked Password Protection must be configured in Supabase Dashboard
  - These settings are not available through SQL migrations
*/

-- 1. Add indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);

-- 2. Optimize admin_users RLS policy for better performance
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;

CREATE POLICY "Users can check own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 3. Remove unused indexes to reduce storage overhead
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_order_items_variant_id_new;
DROP INDEX IF EXISTS idx_orders_billing_address_id;
DROP INDEX IF EXISTS idx_orders_delivery_address_id;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_payment_transactions_payment_method_id;

-- 4. Consolidate multiple permissive policies into single policies

-- 4.1 Fix payment_methods multiple permissive policies
DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Everyone can view active payment methods" ON payment_methods;

CREATE POLICY "Users can view active payment methods or admins can manage all"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Keep admin management policies separate for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- 4.2 Fix product_variants multiple permissive policies
DROP POLICY IF EXISTS "Admins can manage variants" ON product_variants;
DROP POLICY IF EXISTS "Everyone can view variants" ON product_variants;

CREATE POLICY "Users can view all variants or admins can manage"
  ON product_variants
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users should also be able to view variants
CREATE POLICY "Anonymous can view variants"
  ON product_variants
  FOR SELECT
  TO anon
  USING (true);

-- Admin management policies
CREATE POLICY "Admins can insert variants"
  ON product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update variants"
  ON product_variants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete variants"
  ON product_variants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- 4.3 Fix shipping_methods multiple permissive policies
DROP POLICY IF EXISTS "Admins can manage shipping methods" ON shipping_methods;
DROP POLICY IF EXISTS "Everyone can view active shipping methods" ON shipping_methods;

CREATE POLICY "Users can view active shipping methods or admins can manage all"
  ON shipping_methods
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Keep admin management policies separate for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert shipping methods"
  ON shipping_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update shipping methods"
  ON shipping_methods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete shipping methods"
  ON shipping_methods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = (select auth.uid())
    )
  );
