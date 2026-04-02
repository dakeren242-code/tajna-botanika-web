-- Change admin credentials to new email/password
DO $$
DECLARE
  v_old_user_id uuid;
  v_new_user_id uuid;
BEGIN
  -- Check if new email already exists
  SELECT id INTO v_new_user_id FROM auth.users WHERE email = 'dakeren@email.cz';

  IF v_new_user_id IS NULL THEN
    -- Create new admin user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated', 'authenticated',
      'dakeren@email.cz',
      extensions.crypt('Heslo5678!*', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin"}',
      now(), now(), '', '', ''
    )
    RETURNING id INTO v_new_user_id;
  ELSE
    -- Update password if user exists
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Heslo5678!*', extensions.gen_salt('bf')),
        updated_at = now()
    WHERE id = v_new_user_id;
  END IF;

  -- Add new user to admin_users
  INSERT INTO admin_users (user_id, role)
  VALUES (v_new_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  -- Create profile
  INSERT INTO user_profiles (id, full_name)
  VALUES (v_new_user_id, 'Admin')
  ON CONFLICT (id) DO NOTHING;

  -- Remove old admin
  DELETE FROM admin_users WHERE user_id = 'ed148739-f2e2-40ee-a594-300040db8047';
END $$;
