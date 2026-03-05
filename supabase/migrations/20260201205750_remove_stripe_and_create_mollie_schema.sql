/*
  # Remove Stripe and Create Mollie Schema
  
  1. Cleanup
    - Drop all Stripe-related tables
    - Remove obsolete Stripe columns from orders
  
  2. New Tables
    - `packs` - Product/subscription packages
      - id, name, price, currency
      - type (one_time or subscription)
      - interval (for subscriptions: month, year)
    
    - `subscriptions` - Customer subscriptions via Mollie
      - id, user_id, pack_id
      - mollie_customer_id, mollie_subscription_id
      - status (active, canceled, failed)
  
  3. Orders Table Updates
    - Add mollie_payment_id for tracking payments
    - Remove Stripe-specific columns
  
  4. Security
    - Enable RLS on all new tables
    - Users can view their own subscriptions
    - Admins can view all subscriptions
    - Anyone can view active packs
*/

-- Drop Stripe tables
DROP TABLE IF EXISTS stripe_orders CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;

-- Remove Stripe columns from orders (if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders DROP COLUMN stripe_payment_intent_id;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE orders DROP COLUMN stripe_checkout_session_id;
  END IF;
END $$;

-- Add mollie_payment_id column to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'mollie_payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN mollie_payment_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_mollie_payment_id ON orders(mollie_payment_id) WHERE mollie_payment_id IS NOT NULL;

-- Create packs table
CREATE TABLE IF NOT EXISTS packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  type TEXT NOT NULL CHECK (type IN ('one_time', 'subscription')),
  interval TEXT CHECK (interval IN ('month', 'year') OR interval IS NULL),
  interval_count INTEGER DEFAULT 1 CHECK (interval_count > 0),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_packs_type ON packs(type);
CREATE INDEX IF NOT EXISTS idx_packs_is_active ON packs(is_active);

-- Enable RLS on packs
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packs
CREATE POLICY "Enable select for active packs"
  ON packs
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can manage packs
CREATE POLICY "Enable all for admins"
  ON packs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES packs(id) ON DELETE RESTRICT,
  mollie_customer_id TEXT NOT NULL,
  mollie_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'canceled', 'suspended', 'completed', 'failed', 'pending')
  ),
  next_payment_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pack_id ON subscriptions(pack_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mollie_customer_id ON subscriptions(mollie_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mollie_subscription_id ON subscriptions(mollie_subscription_id) WHERE mollie_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Enable select for own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own subscriptions
CREATE POLICY "Enable insert for authenticated users"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all subscriptions
CREATE POLICY "Enable select for admins"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- System can update subscriptions (webhooks)
CREATE POLICY "Enable update for all"
  ON subscriptions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);