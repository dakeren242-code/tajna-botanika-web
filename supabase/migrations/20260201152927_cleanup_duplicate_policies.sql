/*
  # Cleanup Duplicate Policies
  
  Remove old policies that are causing "Multiple Permissive Policies" warnings.
  The new consolidated policies already cover these cases.
*/

-- Remove duplicate policies that are now handled by consolidated policies
DROP POLICY IF EXISTS "Enable select for recent guest orders" ON orders;
DROP POLICY IF EXISTS "Enable select for recent guest order items" ON order_items;
