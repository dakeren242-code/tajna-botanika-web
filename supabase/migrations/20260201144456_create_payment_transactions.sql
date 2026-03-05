/*
  # Create Payment Transactions Table

  1. New Table
    - `payment_transactions` - Payment history and tracking

  2. Features
    - Track all payment attempts (successful and failed)
    - Store gateway responses for debugging
    - Support for multiple payment attempts per order
    - Reference tracking for bank transfers

  3. Security
    - Users can view their own transactions
    - Admins can view all transactions
    - System can insert transactions (for webhooks)
*/

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),

  -- Amount
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'CZK',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
  ),

  -- References
  transaction_reference TEXT,           -- From bank, pays.cz, etc.
  gateway_transaction_id TEXT,          -- ID from payment gateway

  -- Metadata
  gateway_response JSONB,
  customer_ip TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(transaction_reference) WHERE transaction_reference IS NOT NULL;
CREATE INDEX idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Enable select for own transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payment_transactions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all transactions
CREATE POLICY "Enable select for admins"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- System can insert transactions (for webhooks)
CREATE POLICY "Enable insert for all"
  ON payment_transactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
