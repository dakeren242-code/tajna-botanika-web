/*
  # Fix Admin User Identities and Reset Passwords

  Both admin users (nikiasek@botanika.cz and administrator@botanika.cz) are missing
  their auth.identities rows, which prevents Supabase from authenticating them.
  This migration:
  1. Creates the missing identity rows for both users
  2. Resets both passwords to a known value: Admin1234!
*/

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  -- Fix nikiasek@botanika.cz
  v_email := 'nikiasek@botanika.cz';
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt('Admin1234!', extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = v_user_id;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id::text,
        v_user_id,
        jsonb_build_object(
          'sub', v_user_id::text,
          'email', v_email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        now(), now(), now()
      );
      RAISE NOTICE 'Created identity for %', v_email;
    END IF;
  END IF;

  -- Fix administrator@botanika.cz
  v_email := 'administrator@botanika.cz';
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt('Admin1234!', extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = v_user_id;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id::text,
        v_user_id,
        jsonb_build_object(
          'sub', v_user_id::text,
          'email', v_email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        now(), now(), now()
      );
      RAISE NOTICE 'Created identity for %', v_email;
    END IF;
  END IF;
END $$;
