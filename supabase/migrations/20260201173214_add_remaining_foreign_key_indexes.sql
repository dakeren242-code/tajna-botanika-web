/*
  # Add Remaining Foreign Key Indexes

  This migration adds indexes for foreign keys that are currently missing indexes.
  These indexes are essential for query performance, particularly for JOIN operations.

  ## 1. Unindexed Foreign Keys - Adding Indexes
  Add indexes for the following foreign keys:
    - `addresses.user_id` - for user address lookups
    - `order_items.variant_id` - for order item variant joins
    - `orders.billing_address_id` - for billing address lookups
    - `orders.delivery_address_id` - for delivery address lookups
    - `orders.user_id` - for user order history queries
    - `payment_transactions.payment_method_id` - for payment method lookups

  ## 2. Note on "Unused" Indexes
  Indexes flagged as "unused" (like idx_cart_items_product_id, idx_order_items_order_id, etc.)
  are newly created and haven't been used in queries yet. They should NOT be removed as they
  will improve performance when the application runs queries using these foreign keys.

  ## Important Notes
  - Auth DB Connection Strategy: Configure in Supabase Dashboard → Settings → Database → Connection Pooling
    Change from "Fixed (10)" to "Percentage-based" allocation
  - Leaked Password Protection: Enable in Supabase Dashboard → Authentication → Settings
    Enable "Leaked Password Protection" to check against HaveIBeenPwned.org
*/

-- Add indexes for foreign keys to improve JOIN and lookup performance

-- Index for addresses.user_id (user address lookups)
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Index for order_items.variant_id (order item variant joins)
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Index for orders.billing_address_id (billing address lookups)
CREATE INDEX IF NOT EXISTS idx_orders_billing_address_id ON orders(billing_address_id);

-- Index for orders.delivery_address_id (delivery address lookups)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id ON orders(delivery_address_id);

-- Index for orders.user_id (user order history queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index for payment_transactions.payment_method_id (payment method lookups)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method_id ON payment_transactions(payment_method_id);
