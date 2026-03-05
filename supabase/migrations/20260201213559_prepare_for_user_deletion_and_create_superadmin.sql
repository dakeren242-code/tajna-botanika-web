/*
  # Prepare Database for User Deletion and Create Super Admin
  
  1. Changes to FK Constraints
    - Orders: user_id can be NULL (guest orders)
    - Subscriptions: user_id remains required but set to CASCADE DELETE
    - Addresses: CASCADE DELETE on user deletion
    - User profiles: CASCADE DELETE on user deletion
  
  2. Delete All Users
    - Remove all existing users from auth.users
    - Cascade will clean related records
  
  3. Create Super Admin Account
    - Email: nikiasek50@gmail.com
    - Role: super_admin in admin_users table
  
  4. Update Admin Users Table
    - Ensure proper structure for super_admin role
*/

-- Step 1: Update FK constraints for safe user deletion
-- Orders already allow NULL user_id, so no change needed

-- Subscriptions should delete when user is deleted
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Addresses should delete when user is deleted
ALTER TABLE addresses 
DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;

ALTER TABLE addresses
ADD CONSTRAINT addresses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- User profiles should delete when user is deleted
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Admin users should delete when user is deleted
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

ALTER TABLE admin_users
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Carts should delete when user is deleted
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'carts_user_id_fkey'
  ) THEN
    ALTER TABLE carts DROP CONSTRAINT carts_user_id_fkey;
  END IF;
END $$;

ALTER TABLE carts
ADD CONSTRAINT carts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 2: Delete all existing users
-- This will cascade to all related tables
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;

-- Step 3: Create super admin user
-- Using Supabase's internal function to create user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users (this is simplified - in production use Supabase Admin API)
  -- We'll use a known UUID for consistency
  new_user_id := gen_random_uuid();
  
  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'nikiasek50@gmail.com',
    crypt('Heslo123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Create profile for super admin
  INSERT INTO user_profiles (id, full_name, phone)
  VALUES (new_user_id, 'Super Admin', '');

  -- Create admin user record
  INSERT INTO admin_users (user_id, role)
  VALUES (new_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  RAISE NOTICE 'Super admin created with ID: %', new_user_id;
END $$;

-- Step 4: Update RLS policies for admin access
-- Drop existing restrictive policies on products and create admin-friendly ones
DROP POLICY IF EXISTS "Enable all for admins" ON products;

CREATE POLICY "Enable all for super_admin on products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );

-- Anyone can view products
CREATE POLICY "Enable read access for all users on products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update orders policies for super admin
DROP POLICY IF EXISTS "Enable select for admins" ON orders;

CREATE POLICY "Enable all for super_admin on orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );

-- Update subscriptions policies for super admin
DROP POLICY IF EXISTS "Enable select for admins" ON subscriptions;

CREATE POLICY "Enable all for super_admin on subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );

-- Update packs policies for super admin
DROP POLICY IF EXISTS "Enable all for admins" ON packs;

CREATE POLICY "Enable all for super_admin on packs"
  ON packs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );

-- Update product_variants policies
DROP POLICY IF EXISTS "Enable read access for all users" ON product_variants;

CREATE POLICY "Enable read for all on product_variants"
  ON product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable all for super_admin on product_variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );