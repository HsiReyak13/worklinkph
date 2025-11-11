-- =====================================================
-- SIMPLE FIX: Row-Level Security (RLS) Policies
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- IMPORTANT: When using service_role key, RLS should be bypassed automatically
-- But if it's not working, we need to add policies that allow inserts

-- Option 1: Temporarily disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: Add policy that allows inserts (RECOMMENDED)
-- Drop existing insert-related policies
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow service role inserts" ON users;

-- Create a policy that allows authenticated users to insert their own profile
-- This works for both email/password and OAuth registration
CREATE POLICY "Allow user registration" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = auth_user_id
);

-- IMPORTANT: The backend uses service_role key which should bypass RLS
-- But if it doesn't, we need to ensure the client is configured correctly
-- The service_role key should automatically bypass all RLS policies

-- =====================================================
-- Verify RLS status
-- =====================================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

-- =====================================================
-- View current policies
-- =====================================================
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
-- If the above doesn't work, use SECURITY DEFINER function (see FIX_RLS_POLICIES.sql)
-- =====================================================

