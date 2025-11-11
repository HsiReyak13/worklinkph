-- =====================================================
-- FIX: Profile Update RLS Policies
-- =====================================================
-- This fixes the "Failed to save profile" error
-- The issue is that RLS policies are blocking updates
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Step 1: Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 2: Create a more permissive UPDATE policy
-- This allows users to update their own profile AND
-- allows service role (backend) to update any user profile
CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
USING (
  -- Allow if user is updating their own profile
  auth.uid() = auth_user_id
  OR
  -- Allow service role (backend) to update any profile
  -- Service role should bypass RLS, but this ensures it works
  auth.jwt() ->> 'role' = 'service_role'
)
WITH CHECK (
  -- Same conditions for the new row
  auth.uid() = auth_user_id
  OR
  auth.jwt() ->> 'role' = 'service_role'
);

-- =====================================================
-- Alternative: If the above doesn't work, 
-- allow service role explicitly by checking if RLS is bypassed
-- =====================================================

-- Option 2: Create a separate policy for service role
-- (Service role should bypass RLS automatically, but this ensures it)
DROP POLICY IF EXISTS "Service role can update users" ON users;

-- Note: Service role key should automatically bypass RLS
-- If it doesn't, check that you're using SUPABASE_SERVICE_ROLE_KEY
-- and not SUPABASE_ANON_KEY in your backend .env file

-- =====================================================
-- Verify the policy was created
-- =====================================================
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'UPDATE';

-- =====================================================
-- Test: Verify service role can update
-- =====================================================
-- The backend uses service role key which should bypass RLS
-- But if it's not working, the policy above should help
-- =====================================================

-- =====================================================
-- IMPORTANT: Verify your backend is using SERVICE_ROLE_KEY
-- =====================================================
-- Check server/.env file:
-- - SUPABASE_SERVICE_ROLE_KEY should be set (200+ characters)
-- - It should NOT be the anon key (shorter)
-- - Service role key starts with 'eyJ' and is very long
-- =====================================================

