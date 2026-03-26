/*
  # Fix admin_users RLS policy

  1. Changes
    - Drop the circular dependency policy on admin_users table
    - Create a new policy that allows authenticated users to check their own admin status
    - This allows the AuthContext to properly check if a user is an admin
  
  2. Security
    - Users can only see their own admin status (auth.uid() = id)
    - Still maintains security by preventing users from seeing other users' admin status
*/

-- Drop the circular dependency policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create a new policy that allows users to check their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
