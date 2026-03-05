/*
  # Fix Circular Dependency in Admin Users RLS Policy

  1. Problem
    - The admin_users SELECT policy references itself, causing infinite recursion
    - When product_variants policy checks admin_users, it triggers the recursion
    
  2. Solution
    - Replace the circular SELECT policy with a simple policy
    - Allow authenticated users to check if they are admins
    - Users can only see their own admin status
    
  3. Security
    - Authenticated users can SELECT their own row only
    - This prevents circular dependency while maintaining security
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create a new non-recursive policy
-- Users can only check their own admin status
CREATE POLICY "Users can check own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
