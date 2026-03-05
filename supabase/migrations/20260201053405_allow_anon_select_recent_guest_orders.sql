/*
  # Allow Anonymous Users to View Recent Guest Orders

  1. Changes
    - Add policy for anonymous users to view recently created guest orders
    - This enables .select() after .insert() for non-logged-in users
  
  2. Security
    - Only guest orders (user_id IS NULL)
    - Only orders created in the last 10 minutes
    - This allows order confirmation without exposing old orders
*/

-- Allow anonymous users to view recently created guest orders
CREATE POLICY "Enable select for recent guest orders"
  ON orders
  FOR SELECT
  TO anon
  USING (
    user_id IS NULL 
    AND created_at > (NOW() - INTERVAL '10 minutes')
  );

-- Also allow anonymous users to view order items for their recent orders
CREATE POLICY "Enable select for recent guest order items"
  ON order_items
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id IS NULL
        AND orders.created_at > (NOW() - INTERVAL '10 minutes')
    )
  );
