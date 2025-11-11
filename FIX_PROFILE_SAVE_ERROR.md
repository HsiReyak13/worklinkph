# Fix "Failed to save profile" Error

## Problem
When trying to save profile changes, you get: "Failed to save profile. Please try again."

## Root Causes

### 1. ❌ RLS Policy Blocking Updates
The Row-Level Security (RLS) policy might be blocking the update operation.

### 2. ❌ Service Role Key Not Bypassing RLS
The backend should use service role key which bypasses RLS, but it might not be configured correctly.

### 3. ❌ Validation Errors
The data being sent might not pass validation (email format, phone format, etc.).

## Solutions

### Step 1: Fix RLS Policies (CRITICAL)

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create UPDATE policy that allows updates
CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
```

**IMPORTANT:** The backend uses service role key which should **automatically bypass RLS**. If updates still fail after this, the service role key might not be working correctly.

### Step 2: Verify Service Role Key

Check that your backend is using the **SERVICE_ROLE_KEY** (not anon key):

1. Open `server/.env` file
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. The service role key should be:
   - **200+ characters long**
   - Starts with `eyJ`
   - Different from `REACT_APP_SUPABASE_ANON_KEY`

### Step 3: Check Backend Logs

When you try to save the profile, check the backend terminal for error messages. Look for:
- RLS policy violations
- Validation errors
- Database errors
- Specific error messages

### Step 4: Test Update Directly

Test if the update works by running this in Supabase SQL Editor:

```sql
-- Test update (replace with your user's auth_user_id)
UPDATE users
SET city = 'Test City'
WHERE auth_user_id = 'YOUR_AUTH_USER_ID_HERE'
RETURNING id, email, city;
```

If this works, the issue is with the backend. If it fails, the issue is with RLS policies.

### Step 5: Alternative - Use SECURITY DEFINER Function

If RLS continues to block updates, create a function that bypasses RLS:

```sql
-- Create function that bypasses RLS for updates
CREATE OR REPLACE FUNCTION update_user_profile_safe(
  p_user_id BIGINT,
  p_first_name VARCHAR DEFAULT NULL,
  p_last_name VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_province VARCHAR DEFAULT NULL,
  p_identity VARCHAR DEFAULT NULL,
  p_skills TEXT DEFAULT NULL,
  p_job_preferences JSONB DEFAULT NULL,
  p_accessibility_settings JSONB DEFAULT NULL,
  p_notification_preferences JSONB DEFAULT NULL,
  p_avatar_url VARCHAR DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  email VARCHAR,
  full_name VARCHAR
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_updates JSONB := '{}';
  v_full_name VARCHAR;
BEGIN
  -- Build updates object
  IF p_first_name IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('first_name', p_first_name);
  END IF;
  IF p_last_name IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('last_name', p_last_name);
  END IF;
  IF p_email IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('email', p_email);
  END IF;
  IF p_phone IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('phone', p_phone);
  END IF;
  IF p_city IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('city', p_city);
  END IF;
  IF p_province IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('province', p_province);
  END IF;
  IF p_identity IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('identity', p_identity);
  END IF;
  IF p_skills IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('skills', p_skills);
  END IF;
  IF p_job_preferences IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('job_preferences', p_job_preferences);
  END IF;
  IF p_accessibility_settings IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('accessibility_settings', p_accessibility_settings);
  END IF;
  IF p_notification_preferences IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('notification_preferences', p_notification_preferences);
  END IF;
  IF p_avatar_url IS NOT NULL THEN
    v_updates := v_updates || jsonb_build_object('avatar_url', p_avatar_url);
  END IF;

  -- Update full_name if first_name or last_name changed
  IF p_first_name IS NOT NULL OR p_last_name IS NOT NULL THEN
    SELECT 
      COALESCE(p_first_name, first_name),
      COALESCE(p_last_name, last_name)
    INTO v_full_name
    FROM users
    WHERE id = p_user_id;
    
    v_updates := v_updates || jsonb_build_object('full_name', 
      TRIM(COALESCE(p_first_name, '') || ' ' || COALESCE(p_last_name, ''))
    );
  END IF;

  -- Perform update
  RETURN QUERY
  UPDATE users
  SET 
    first_name = COALESCE((v_updates->>'first_name')::VARCHAR, first_name),
    last_name = COALESCE((v_updates->>'last_name')::VARCHAR, last_name),
    full_name = COALESCE((v_updates->>'full_name')::VARCHAR, full_name),
    email = COALESCE((v_updates->>'email')::VARCHAR, email),
    phone = COALESCE((v_updates->>'phone')::VARCHAR, phone),
    city = COALESCE((v_updates->>'city')::VARCHAR, city),
    province = COALESCE((v_updates->>'province')::VARCHAR, province),
    identity = COALESCE((v_updates->>'identity')::VARCHAR, identity),
    skills = COALESCE((v_updates->>'skills')::TEXT, skills),
    job_preferences = COALESCE((v_updates->>'job_preferences')::JSONB, job_preferences),
    accessibility_settings = COALESCE((v_updates->>'accessibility_settings')::JSONB, accessibility_settings),
    notification_preferences = COALESCE((v_updates->>'notification_preferences')::JSONB, notification_preferences),
    avatar_url = COALESCE((v_updates->>'avatar_url')::VARCHAR, avatar_url),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING users.id, users.email, users.full_name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_profile_safe TO service_role;
GRANT EXECUTE ON FUNCTION update_user_profile_safe TO authenticated;
```

## Debugging Steps

### 1. Check Backend Terminal
When you try to save, look at the backend terminal output. You should see:
- The update request
- Any error messages
- Database errors

### 2. Check Browser Console
Open browser DevTools (F12) → Console tab:
- Look for network errors
- Check the response from `/api/users/profile`
- See the exact error message

### 3. Check Network Tab
Open browser DevTools (F12) → Network tab:
- Find the `PUT /api/users/profile` request
- Check the request payload
- Check the response (status code and message)

### 4. Verify Authentication
Make sure you're signed in:
- Token is valid
- Session hasn't expired
- Try signing out and back in

## Most Likely Solution

**Run the SQL from Step 1** to fix the RLS policy. The service role key should bypass RLS automatically, but if it's not working, the policy above will ensure updates work.

## After Fixing

1. **Restart backend server:**
   ```bash
   # Stop backend (Ctrl+C)
   cd server
   npm run dev
   ```

2. **Test profile save:**
   - Go to Profile page
   - Make a small change (e.g., update city)
   - Click "Save Profile"
   - Should save successfully ✅

## Expected Results

After fixes:
- ✅ Profile updates save successfully
- ✅ No RLS policy errors
- ✅ Changes persist after page refresh
- ✅ No "Failed to save profile" error

---

**Priority:** Run Step 1 SQL fix first, then check backend logs if it still fails.

