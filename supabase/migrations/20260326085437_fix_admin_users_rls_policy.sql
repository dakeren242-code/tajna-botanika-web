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
-- Handle both schemas: 'id' (setup_complete_schema_v2) or 'user_id' (earlier migration)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can check their own admin status"
      ON admin_users FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  ELSE
    CREATE POLICY "Users can check their own admin status"
      ON admin_users FOR SELECT TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;
