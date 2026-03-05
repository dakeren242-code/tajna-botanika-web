/*
  # Create Payment and Shipping Methods Tables

  1. New Tables
    - `payment_methods` - Payment method definitions (bank transfer, card, COD)
    - `shipping_methods` - Shipping method definitions (Packeta, personal pickup)

  2. Features
    - Configurable via database (no code changes needed)
    - Support for active/inactive methods
    - Fee configuration
    - Gateway configuration (JSON for API keys, etc.)

  3. Security
    - Everyone can view active methods
    - Admins can manage methods
*/

-- =============================================================================
-- PAYMENT METHODS
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code TEXT UNIQUE NOT NULL,            -- 'bank_transfer', 'card', 'cash_on_delivery'
  name_cs TEXT NOT NULL,
  name_en TEXT,
  description_cs TEXT,
  description_en TEXT,

  -- Type
  method_type TEXT NOT NULL CHECK (
    method_type IN ('manual', 'gateway', 'offline')
  ),

  -- Settings
  is_active BOOLEAN DEFAULT false,
  requires_online_payment BOOLEAN DEFAULT false,
  adds_fee BOOLEAN DEFAULT false,
  fee_amount NUMERIC(10,2) DEFAULT 0 CHECK (fee_amount >= 0),
  fee_percentage NUMERIC(5,2) DEFAULT 0 CHECK (fee_percentage >= 0 AND fee_percentage <= 100),

  -- Gateway configuration (JSON)
  gateway_config JSONB,

  -- Display
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payment_methods_active ON payment_methods(is_active) WHERE is_active = true;
CREATE INDEX idx_payment_methods_code ON payment_methods(code);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Everyone can view active payment methods
CREATE POLICY "Enable select for active methods"
  ON payment_methods
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can manage payment methods
CREATE POLICY "Enable all for admins"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- =============================================================================
-- SHIPPING METHODS
-- =============================================================================

CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code TEXT UNIQUE NOT NULL,            -- 'zasilkovna', 'personal_pickup', etc.
  name_cs TEXT NOT NULL,
  name_en TEXT,
  description_cs TEXT,

  -- Type
  carrier_type TEXT NOT NULL CHECK (
    carrier_type IN ('packeta', 'personal', 'courier', 'post')
  ),

  -- Settings
  is_active BOOLEAN DEFAULT true,
  requires_address BOOLEAN DEFAULT true,
  requires_packeta_point BOOLEAN DEFAULT false,

  -- Pricing
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  free_shipping_threshold NUMERIC(10,2),

  -- Carrier configuration (JSON)
  carrier_config JSONB,

  -- Display
  icon_url TEXT,
  estimated_days TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipping_methods_active ON shipping_methods(is_active) WHERE is_active = true;
CREATE INDEX idx_shipping_methods_code ON shipping_methods(code);

-- Enable RLS
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

-- Everyone can view active shipping methods
CREATE POLICY "Enable select for active methods"
  ON shipping_methods
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can manage shipping methods
CREATE POLICY "Enable all for admins"
  ON shipping_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );
