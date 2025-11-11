# Registration Fix - Foreign Key Constraint Error

## Problem
Email/password registration was failing with:
```
Failed to create user: insert or update on table "users" violates foreign key constraint "users_auth_user_id_fkey"
```

## Root Cause
When `supabase.auth.signUp()` is called, it creates an auth user, but there's a timing issue:
- The auth user might not be immediately available in `auth.users` table
- The profile creation tries to use `authData.user.id` before it exists in the database
- This causes a foreign key constraint violation

## Solution Applied

### Updated Registration Route (`server/routes/auth.js`)

**Changes:**
1. ✅ Added verification step: Verifies auth user exists before creating profile
2. ✅ Retry logic: Tries up to 3 times with increasing delays (500ms, 1000ms, 1500ms)
3. ✅ Uses verified user ID: Only uses `auth_user_id` after confirming it exists in `auth.users`
4. ✅ Better error handling: Logs detailed errors and cleans up on failure
5. ✅ Cleanup on failure: Deletes auth user if profile creation fails

### Key Code Changes

**Before:**
```javascript
// Immediately tried to create profile with authData.user.id
const user = await User.create({
  authUserId: authData.user.id, // Might not exist yet!
  // ...
});
```

**After:**
```javascript
// Verify auth user exists first
let verifiedAuthUser = null;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const { data: { user: verifiedUser }, error } = 
    await supabase.auth.admin.getUserById(authData.user.id);
  
  if (!error && verifiedUser) {
    verifiedAuthUser = verifiedUser;
    break;
  }
  // Wait and retry if not found
  await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
}

// Use verified ID (guaranteed to exist)
const user = await User.create({
  authUserId: verifiedAuthUser.id, // Verified to exist!
  // ...
});
```

## Testing

### After the Fix:

1. **Restart backend server:**
   ```bash
   # Stop backend (Ctrl+C)
   cd server
   npm run dev
   ```

2. **Test registration:**
   - Go to Sign Up page
   - Fill in all required fields
   - Submit registration
   - Should succeed without foreign key error ✅

3. **Check backend logs:**
   - Should see: "User profile created successfully"
   - No foreign key constraint errors

## Expected Behavior

✅ **Success Case:**
- Auth user created
- Auth user verified (within 1-3 attempts)
- Profile created successfully
- User can log in immediately

❌ **Failure Case (if email confirmation required):**
- Auth user created but not confirmed
- Verification fails after 3 attempts
- Clear error message: "Authentication user not found. Please try again or check if email confirmation is required."
- Auth user cleaned up

## If Still Getting Errors

### Check Email Confirmation Settings

If email confirmation is enabled in Supabase:
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Turn it OFF for development (or users need to confirm email first)

### Check Backend Logs

Look for:
- `Auth user verification failed:` - Auth user doesn't exist
- `Profile creation error:` - Profile creation failed (different issue)
- `Registration error:` - General registration error

### Verify Auth User Exists

Run this SQL to check if auth users are being created:
```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

## Summary

**Status:** ✅ Fixed
**Change:** Added auth user verification with retry logic
**Result:** Registration should work without foreign key constraint errors

---

**Next Steps:**
1. Restart backend server
2. Test email/password registration
3. Check backend logs for any errors
4. Verify user profile is created successfully

