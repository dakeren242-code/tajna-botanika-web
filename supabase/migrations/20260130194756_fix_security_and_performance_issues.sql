/*
  # Fix Security and Performance Issues
  
  ## Overview
  This migration addresses critical security and performance issues identified by Supabase.
  
  ## Changes
  
  ### 1. RLS Performance Optimization
  Updates RLS policies to use `(select auth.uid())` instead of `auth.uid()` to prevent 
  re-evaluation for each row, significantly improving query performance at scale.
  
  **Affected tables:**
  - `stripe_customers` - "Users can view their own customer data"
  - `stripe_subscriptions` - "Users can view their own subscription data"  
  - `stripe_orders` - "Users can view their own order data"
  
  ### 2. Remove Unused Indexes
  Drops indexes that are not being used by queries to reduce storage overhead and 
  improve write performance.
  
  **Indexes removed:**
  - `idx_orders_delivery_address_id`
  - `idx_email_subscribers_email`
  - `idx_email_subscribers_active`
  - `idx_orders_stripe_session`
  - `idx_orders_stripe_payment`
  - `idx_products_stripe_product`
  - `idx_addresses_user_id`
  - `idx_orders_user_id`
  - `idx_orders_order_number`
  - `idx_orders_status`
  - `idx_orders_payment_status`
  - `idx_order_items_order_id`
  - `idx_order_items_product_id`
  - `idx_orders_billing_address_id`
  
  ### 3. Fix Email Subscribers RLS Policy
  Replaces the "always true" policy with proper validation requiring a valid email format.
  
  ## Important Notes
  
  **Configuration changes (manual):**
  The following issues require manual configuration in Supabase Dashboard and cannot be 
  fixed via migration:
  
  1. **Auth DB Connection Strategy**: Switch from fixed number to percentage-based 
     allocation in Database Settings
  2. **Leaked Password Protection**: Enable HaveIBeenPwned integration in Auth Settings
*/

-- ============================================================================
-- 1. FIX RLS PERFORMANCE ISSUES
-- ============================================================================

-- Drop and recreate stripe_customers policy with optimized auth check
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- Drop and recreate stripe_subscriptions policy with optimized auth check
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- Drop and recreate stripe_orders policy with optimized auth check
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_orders_delivery_address_id;
DROP INDEX IF EXISTS idx_email_subscribers_email;
DROP INDEX IF EXISTS idx_email_subscribers_active;
DROP INDEX IF EXISTS idx_orders_stripe_session;
DROP INDEX IF EXISTS idx_orders_stripe_payment;
DROP INDEX IF EXISTS idx_products_stripe_product;
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_order_number;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_payment_status;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_orders_billing_address_id;

-- ============================================================================
-- 3. FIX EMAIL SUBSCRIBERS RLS POLICY
-- ============================================================================

-- Drop the insecure "always true" policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON email_subscribers;

-- Create a new policy with email validation
CREATE POLICY "Anyone can subscribe with valid email"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND char_length(email) <= 255
  );
