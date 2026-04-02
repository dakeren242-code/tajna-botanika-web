-- Add current user as super_admin
INSERT INTO admin_users (user_id, role)
VALUES ('ed148739-f2e2-40ee-a594-300040db8047', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
