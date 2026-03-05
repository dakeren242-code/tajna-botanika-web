/*
  # Fix Multiple Permissive Policies

  ## Changes
  
  1. **Split FOR ALL policies into separate actions**
    - Replace "Users can manage own profile" (FOR ALL) with separate INSERT, UPDATE, DELETE policies
    - Replace "Users can manage own addresses" (FOR ALL) with separate INSERT, UPDATE, DELETE policies
    - This eliminates the overlap with SELECT policies
  
  2. **Unused Index Explanation**
    - Unused index warnings are expected for new/low-traffic databases
    - Indexes will be utilized as the application scales and queries are executed
    - These are monitoring warnings, not actual security or performance issues
  
  3. **Admin Configuration Required**
    - Auth DB Connection Strategy: Must be configured in Supabase Dashboard
    - Leaked Password Protection: Must be enabled in Supabase Dashboard > Authentication > Policies
  
  ## Security
  - Each policy now has a single, clear purpose
  - No overlapping permissive policies
  - Better performance and maintainability
*/

-- =============================================
-- FIX user_profiles POLICIES
-- =============================================

-- Drop the "FOR ALL" policy that overlaps with SELECT
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

-- Create separate policies for each action
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- =============================================
-- FIX addresses POLICIES
-- =============================================

-- Drop the "FOR ALL" policy that overlaps with SELECT
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create separate policies for each action
CREATE POLICY "Users can insert own addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================
-- ADD POLICY COMMENTS
-- =============================================

COMMENT ON POLICY "Users can insert own profile" ON user_profiles IS 
  'Allows users to create their own profile. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users can update own profile" ON user_profiles IS 
  'Allows users to update their own profile. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users can delete own profile" ON user_profiles IS 
  'Allows users to delete their own profile. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users can insert own addresses" ON addresses IS 
  'Allows users to create their own addresses. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users can update own addresses" ON addresses IS 
  'Allows users to update their own addresses. Uses SELECT subquery for auth.uid() optimization.';

COMMENT ON POLICY "Users can delete own addresses" ON addresses IS 
  'Allows users to delete their own addresses. Uses SELECT subquery for auth.uid() optimization.';
