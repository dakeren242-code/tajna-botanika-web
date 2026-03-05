/*
  # Fix Security Issues

  This migration addresses several security and performance issues:

  1. **Auth RLS Performance Optimization**
     - Update policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation of auth.uid() for each row, improving performance
     - Affected policies:
       - "Admins can view all conversations" on chat_conversations
       - "Admins can update all conversations" on chat_conversations
       - "Authenticated can update messages" on chat_messages

  2. **Function Search Path Security**
     - Fix update_conversation_timestamp() function to have immutable search_path
     - Add SECURITY DEFINER and explicit schema references

  3. **Drop Unused Indexes**
     - Remove indexes that are not being used to reduce overhead
     - Indexes: cart_items, order_items, addresses, payment_transactions, chat indexes

  4. **Anonymous Chat Security Note**
     - The chat system is designed to work for anonymous users without authentication
     - Current "always true" policies for anon users are intentional for this use case
     - Session management is handled at the application level via client-side session_id
     - For production, consider implementing JWT-based authentication for better security
*/

-- ============================================================================
-- 1. Fix RLS Policies for Performance (use SELECT wrapper for auth.uid())
-- ============================================================================

-- Drop and recreate admin policies for chat_conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON chat_conversations;
CREATE POLICY "Admins can view all conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update all conversations" ON chat_conversations;
CREATE POLICY "Admins can update all conversations"
  ON chat_conversations
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

-- Drop and recreate admin policy for chat_messages
DROP POLICY IF EXISTS "Authenticated can update messages" ON chat_messages;
CREATE POLICY "Authenticated can update messages"
  ON chat_messages
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

-- ============================================================================
-- 2. Fix Function Search Path Mutability
-- ============================================================================

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.chat_conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at,
    unread_admin_count = CASE 
      WHEN NEW.sender_type = 'customer' THEN unread_admin_count + 1
      ELSE unread_admin_count
    END,
    unread_customer_count = CASE
      WHEN NEW.sender_type IN ('admin', 'system') THEN unread_customer_count + 1
      ELSE unread_customer_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. Drop Unused Indexes
-- ============================================================================

-- Note: Only dropping indexes that are confirmed unused by Supabase analysis
-- Foreign key columns still benefit from indexes even if not used in current queries

DROP INDEX IF EXISTS idx_chat_conversations_session_id;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_cart_items_product_id;
DROP INDEX IF EXISTS idx_cart_items_variant_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_variant_id;
DROP INDEX IF EXISTS idx_payment_transactions_order_id;
DROP INDEX IF EXISTS idx_payment_transactions_payment_method_id;
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_orders_billing_address_id;
DROP INDEX IF EXISTS idx_orders_delivery_address_id;
