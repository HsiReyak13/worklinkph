# Quick Fix: "Failed to save profile"

## The Problem
Profile updates are failing with "Failed to save profile" error.

## Quick Solution (2 minutes)

### Step 1: Run This SQL in Supabase

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Fix RLS policy for updates
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
```

### Step 2: Restart Backend

```bash
# Stop backend (Ctrl+C in terminal)
# Then restart:
cd server
npm run dev
```

### Step 3: Test

1. Go to Profile page
2. Make a small change
3. Click "Save Profile"
4. Should work now! ✅

## If It Still Doesn't Work

### Check Backend Logs

Look at the backend terminal when you try to save. You should see error messages like:
- `User update error: ...`
- `Profile update error: ...`
- `Failed to update user: ...`

### Common Issues

1. **RLS Policy Error**
   - Error message contains "row-level security"
   - **Fix:** Run the SQL above

2. **Validation Error**
   - Email format invalid
   - Phone format invalid
   - **Fix:** Check the data you're trying to save

3. **Service Role Key Issue**
   - Backend not using service role key
   - **Fix:** Check `server/.env` has `SUPABASE_SERVICE_ROLE_KEY` set

## Expected Error Messages

After the fix, error messages will be more detailed:
- ✅ "Permission denied" → RLS issue
- ✅ "Validation error" → Data format issue
- ✅ "User not found" → Authentication issue

## Summary

**Most likely cause:** RLS policy blocking updates
**Quick fix:** Run the SQL above
**Time:** 2 minutes

---

Run the SQL fix and restart the backend, then try saving your profile again!

