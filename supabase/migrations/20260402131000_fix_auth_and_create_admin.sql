-- Fix: remove incomplete user created without identity, then recreate properly
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find the broken user (has no identity row)
  SELECT u.id INTO v_user_id
  FROM auth.users u
  LEFT JOIN auth.identities i ON i.user_id = u.id
  WHERE u.email = 'dakeren@email.cz' AND i.id IS NULL;

  IF v_user_id IS NOT NULL THEN
    -- Remove from admin_users first
    DELETE FROM admin_users WHERE user_id = v_user_id;
    -- Remove from user_profiles
    DELETE FROM user_profiles WHERE id = v_user_id;
    -- Remove broken user
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;

  -- Now create user properly with identity
  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated', 'authenticated',
    'dakeren@email.cz',
    extensions.crypt('Heslo5678!*', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin"}',
    now(), now(), '', '', '', false
  );

  -- Create the identity row (required by Supabase auth)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id, v_user_id, 'dakeren@email.cz',
    jsonb_build_object('sub', v_user_id::text, 'email', 'dakeren@email.cz', 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now()
  );

  -- Add to admin_users
  INSERT INTO admin_users (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  -- Create profile
  INSERT INTO user_profiles (id, full_name)
  VALUES (v_user_id, 'Admin')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Admin user created: dakeren@email.cz with ID %', v_user_id;
END $$;
