-- =====================================================
-- FIX: Row-Level Security (RLS) Policies
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can read all users" ON users;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Policy 2: Users can update their own profile
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

-- Policy 4: Allow service role (backend) to insert users
-- This allows the backend server to create user profiles
CREATE POLICY "Service role can insert users" 
ON users
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Policy 5: Allow service role (backend) to read all users
-- This allows the backend to query user profiles for authentication
CREATE POLICY "Service role can read all users" 
ON users
FOR SELECT 
TO service_role
USING (true);

-- Policy 6: Allow service role (backend) to update users
-- This allows the backend to update user profiles
CREATE POLICY "Service role can update users" 
ON users
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- Alternative: If service_role policies don't work,
-- we can use a function that bypasses RLS
-- =====================================================

-- Create a function to safely insert users (bypasses RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
  p_auth_user_id UUID,
  p_auth_provider VARCHAR,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_full_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_city VARCHAR,
  p_province VARCHAR,
  p_identity VARCHAR,
  p_skills TEXT,
  p_job_preferences JSONB,
  p_accessibility_settings JSONB,
  p_notification_preferences JSONB,
  p_onboarding_completed BOOLEAN,
  p_oauth_metadata JSONB,
  p_avatar_url VARCHAR,
  p_onboarding_progress JSONB
) RETURNS TABLE (
  id BIGINT,
  auth_user_id UUID,
  email VARCHAR,
  full_name VARCHAR
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (
    auth_user_id,
    auth_provider,
    first_name,
    last_name,
    full_name,
    email,
    phone,
    city,
    province,
    identity,
    skills,
    job_preferences,
    accessibility_settings,
    notification_preferences,
    onboarding_completed,
    oauth_metadata,
    avatar_url,
    onboarding_progress
  ) VALUES (
    p_auth_user_id,
    p_auth_provider,
    p_first_name,
    p_last_name,
    p_full_name,
    p_email,
    p_phone,
    p_city,
    p_province,
    p_identity,
    p_skills,
    p_job_preferences,
    p_accessibility_settings,
    p_notification_preferences,
    p_onboarding_completed,
    p_oauth_metadata,
    p_avatar_url,
    p_onboarding_progress
  )
  RETURNING users.id, users.auth_user_id, users.email, users.full_name;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- =====================================================
-- Verify policies were created
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- Test: Verify the function exists
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'create_user_profile'
AND routine_schema = 'public';

