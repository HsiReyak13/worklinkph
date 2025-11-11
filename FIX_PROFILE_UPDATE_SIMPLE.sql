-- =====================================================
-- SIMPLE FIX: Allow Profile Updates
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create UPDATE policy that works with both user tokens and service role
-- Service role should bypass RLS automatically, but this ensures updates work
CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- =====================================================
-- CRITICAL: Verify Service Role Key is Being Used
-- =====================================================
-- The backend MUST use SUPABASE_SERVICE_ROLE_KEY (not anon key)
-- Service role key bypasses RLS automatically
-- 
-- Check server/.env:
-- - SUPABASE_SERVICE_ROLE_KEY should be set
-- - It should be 200+ characters long
-- - It starts with 'eyJ'
-- - It's different from REACT_APP_SUPABASE_ANON_KEY
-- =====================================================

-- =====================================================
-- If service role is not bypassing RLS, try this:
-- =====================================================

-- Option: Temporarily test without RLS (NOT for production!)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Then test if updates work. If they do, the issue is RLS.
-- Re-enable RLS: ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- =====================================================

