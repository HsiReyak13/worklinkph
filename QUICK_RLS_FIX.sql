-- =====================================================
-- QUICK FIX: RLS Policies for User Creation
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This fixes the "new row violates row-level security policy" error
-- =====================================================

-- Step 1: Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Step 2: Recreate policies with INSERT permission
CREATE POLICY "Users can read own profile" 
ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own profile" 
ON users
FOR DELETE 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Step 3: CRITICAL - Allow users to insert their own profile
-- This is needed for OAuth registration flows
CREATE POLICY "Allow user registration" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = auth_user_id
);

-- Step 4: Verify policies
SELECT 
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Service role key (used by backend) should bypass RLS automatically
-- 2. If you still get RLS errors, the backend might not be using service role key correctly
-- 3. Check server/.env has SUPABASE_SERVICE_ROLE_KEY (not anon key)
-- 4. Service role key is long (200+ chars) and starts with 'eyJ'
-- =====================================================

