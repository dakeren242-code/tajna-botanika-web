/*
  # Fix Order Status Constraints

  1. Problem
    - Old constraint allows: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    - Application sends: 'awaiting_payment', 'paid', 'confirmed'
    - Result: ERROR 23514

  2. Solution
    - Drop old constraints
    - Add new correct constraints
    - Separate concepts:
      - orders.status = order lifecycle
      - orders.payment_status = payment state
      - orders.fulfillment_status = fulfillment state

  3. Status values
    - order status: pending, confirmed, processing, shipped, delivered, cancelled, failed
    - payment status: pending, awaiting_confirmation, paid, failed, refunded, partially_refunded
    - fulfillment status: unfulfilled, partial, fulfilled, returned
*/

-- Drop old constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_payment_status;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_fulfillment_status;

-- Add correct constraints

-- orders.status - Order lifecycle
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',       -- Waiting for confirmation
    'confirmed',     -- Confirmed by customer
    'processing',    -- Being prepared/packed
    'shipped',       -- Sent to customer
    'delivered',     -- Delivered to customer
    'cancelled',     -- Cancelled
    'failed'         -- Failed (technical error, out of stock)
  )
);

-- orders.payment_status - Payment state
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (
  payment_status IN (
    'pending',                -- Waiting for payment
    'awaiting_confirmation',  -- Payment initiated, waiting for confirmation
    'paid',                   -- Paid
    'failed',                 -- Payment failed
    'refunded',               -- Refunded
    'partially_refunded'      -- Partially refunded
  )
);

-- orders.fulfillment_status - Fulfillment state
ALTER TABLE orders ADD CONSTRAINT orders_fulfillment_status_check CHECK (
  fulfillment_status IN (
    'unfulfilled',   -- Not fulfilled
    'partial',       -- Partially fulfilled
    'fulfilled',     -- Fully fulfilled
    'returned'       -- Returned by customer
  )
);

-- Update existing orders to have correct status
-- Old 'pending' -> new 'confirmed' (they are confirmed orders)
UPDATE orders
SET status = 'confirmed'
WHERE status = 'pending';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status_payment ON orders(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status);
