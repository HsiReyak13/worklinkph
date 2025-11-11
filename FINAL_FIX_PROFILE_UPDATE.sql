-- =====================================================
-- FINAL FIX: Profile Update RLS Policy
-- =====================================================
-- This fixes the "Failed to save profile" error
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Step 1: Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can read all users" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;

-- Step 2: Recreate policies with proper permissions
-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Policy 2: Users can update their own profile
-- IMPORTANT: Service role (backend) should bypass RLS automatically
-- But this policy ensures authenticated users can update their own profile
CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Users can delete their own profile
CREATE POLICY "Users can delete own profile" 
ON users
FOR DELETE 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Policy 4: Allow user registration (for OAuth and email/password)
CREATE POLICY "Allow user registration" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Service role key (SUPABASE_SERVICE_ROLE_KEY) should 
--    automatically bypass ALL RLS policies
-- 2. If updates still fail, check:
--    - Backend is using service role key (not anon key)
--    - Service role key is 200+ characters
--    - Backend server is restarted after .env changes
-- 3. The backend uses service role, so RLS should not apply
--    But these policies ensure frontend (authenticated users) can also work
-- =====================================================

-- Step 3: Verify policies were created
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- Step 4: Verify RLS is enabled (it should be)
-- =====================================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

-- Expected result: rls_enabled = true
-- =====================================================

