# Fix Authentication & RLS Issues

## Problems Identified

From your backend logs, I found two critical issues:

### 1. ❌ 401 Unauthorized Errors
```
GET /api/users/profile HTTP/1.1" 401
```
**Cause:** Authentication token is missing or invalid when frontend tries to load profile.

### 2. ❌ Row-Level Security (RLS) Policy Violation
```
Error: Failed to create user: new row violates row-level security policy for table "users"
```
**Cause:** RLS policies are blocking user creation from the backend, even though service role key should bypass RLS.

## Solutions

### Step 1: Fix RLS Policies (CRITICAL)

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- Recreate policies with proper permissions
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

-- Policy 4: Allow user registration (for OAuth and email/password)
-- This allows users to create their own profile during registration
CREATE POLICY "Allow user registration" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = auth_user_id
);

-- IMPORTANT: Service role key should automatically bypass RLS
-- But if it doesn't, we need to ensure backend can insert users
-- The service role client should bypass all RLS policies automatically
```

### Step 2: Verify Service Role Key is Being Used

The backend should be using `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS automatically. Verify:

1. Check `server/.env` file has `SUPABASE_SERVICE_ROLE_KEY` set
2. The service role key should start with `eyJ...` and be very long (200+ characters)
3. It should NOT be the anon key (which is shorter)

### Step 3: Fix Authentication Token Issue

The 401 errors suggest tokens aren't being sent properly. Check:

1. **Frontend is sending tokens:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look at `/api/users/profile` request
   - Check if `Authorization: Bearer <token>` header is present

2. **Token is valid:**
   - Sign out and sign back in
   - This will refresh the authentication token
   - Try accessing profile again

3. **Session is maintained:**
   - Check if Supabase session is stored in localStorage
   - Open DevTools → Application → Local Storage
   - Look for `sb-<project-id>-auth-token`

### Step 4: Alternative Solution - Use SECURITY DEFINER Function

If RLS policies still don't work, use a database function that bypasses RLS:

**Run this SQL:**

```sql
-- Create function that bypasses RLS for user creation
CREATE OR REPLACE FUNCTION create_user_profile_safe(
  p_auth_user_id UUID,
  p_auth_provider VARCHAR,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_full_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_province VARCHAR DEFAULT NULL,
  p_identity VARCHAR DEFAULT NULL,
  p_skills TEXT DEFAULT NULL,
  p_job_preferences JSONB DEFAULT '{}',
  p_accessibility_settings JSONB DEFAULT '{}',
  p_notification_preferences JSONB DEFAULT '{}',
  p_onboarding_completed BOOLEAN DEFAULT FALSE,
  p_oauth_metadata JSONB DEFAULT '{}',
  p_avatar_url VARCHAR DEFAULT NULL,
  p_onboarding_progress JSONB DEFAULT '{}'
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO authenticated;
```

Then update `server/models/User.js` to use this function (I can help with this if needed).

## Quick Test

After applying the fixes:

1. **Restart backend server:**
   ```bash
   # Stop backend (Ctrl+C)
   # Restart
   cd server
   npm run dev
   ```

2. **Test user registration:**
   - Try signing up with email/password
   - Try signing in with Google OAuth
   - Check if user is created successfully

3. **Test profile loading:**
   - Sign in
   - Go to Profile page
   - Should load without 401 error

## Expected Results

After fixes:
- ✅ User registration works (no RLS errors)
- ✅ Profile loads successfully (no 401 errors)
- ✅ Google OAuth works
- ✅ Email/password registration works

## If Still Not Working

1. **Check backend logs** for specific error messages
2. **Check browser console** for frontend errors
3. **Verify service role key** is correct in `server/.env`
4. **Check Supabase Dashboard → Logs** for database errors
5. **Verify RLS policies** were created successfully

## Files to Update

1. ✅ `server/config/database.js` - Updated to ensure proper client configuration
2. ⚠️ `server/models/User.js` - May need to use RPC function if RLS still blocks
3. ⚠️ Database - Run SQL to fix RLS policies

---

**Priority:** Fix RLS policies first (Step 1), then test authentication (Step 3).

