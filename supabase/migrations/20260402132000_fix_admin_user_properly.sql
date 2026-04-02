-- Delete broken dakeren user and recreate with all required fields
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Remove existing broken user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'dakeren@email.cz';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM admin_users WHERE user_id = v_user_id;
    DELETE FROM user_profiles WHERE id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;

  -- Create fresh user with all columns
  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, email_change_confirm_status,
    reauthentication_token,
    is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated', 'authenticated',
    'dakeren@email.cz',
    extensions.crypt('Heslo5678!*', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin"}'::jsonb,
    now(), now(),
    '', '',
    '', '',
    '', 0,
    '',
    false, false
  );

  -- Create identity row (critical for Supabase auth to work)
  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id::text,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', 'dakeren@email.cz',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(), now(), now()
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
