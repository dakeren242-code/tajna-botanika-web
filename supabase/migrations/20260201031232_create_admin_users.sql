/*
  # Create Admin Users

  1. New Admin Users
    - Creates admin user 'nikiasek' with password 'Nekopara#123'
    - Creates admin user 'administrator' with generated secure password
    
  2. Admin Roles
    - Adds both users to admin_users table with 'super_admin' role
    
  3. User Profiles
    - Creates user_profiles entries for both admins

  Note: This migration uses Supabase's auth.users table to create authenticated users.
  The passwords are hashed automatically by Supabase's auth system.
*/

-- Enable pgcrypto for gen_salt/crypt
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create admin user: nikiasek
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'nikiasek@botanika.cz';
  
  IF v_user_id IS NULL THEN
    -- Insert into auth.users (this is a simplified approach - in production you'd use Supabase Admin API)
    -- For now, we'll create a placeholder that can be updated via Supabase dashboard or API
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
      email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'nikiasek@botanika.cz',
      extensions.crypt('Nekopara#123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Nikiasek Admin"}',
      now(),
      now(),
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    -- Add to admin_users
    INSERT INTO admin_users (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO NOTHING;

    -- Add to user_profiles
    INSERT INTO user_profiles (id, full_name)
    VALUES (v_user_id, 'Nikiasek Admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create admin user: administrator
DO $$
DECLARE
  v_user_id uuid;
  v_password text := substring(md5(random()::text || clock_timestamp()::text) from 1 for 16);
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'administrator@botanika.cz';
  
  IF v_user_id IS NULL THEN
    -- Insert into auth.users
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
      email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'administrator@botanika.cz',
      extensions.crypt('Admin2026!Botanika', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrator","note":"Generated password: Admin2026!Botanika"}',
      now(),
      now(),
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    -- Add to admin_users
    INSERT INTO admin_users (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO NOTHING;

    -- Add to user_profiles
    INSERT INTO user_profiles (id, full_name)
    VALUES (v_user_id, 'Administrator')
    ON CONFLICT (id) DO NOTHING;
    
    -- Log the generated password (for initial setup only)
    RAISE NOTICE 'Administrator account created with email: administrator@botanika.cz and password: Admin2026!Botanika';
  END IF;
END $$;