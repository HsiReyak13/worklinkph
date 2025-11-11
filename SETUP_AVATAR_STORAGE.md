# Setup Avatar Storage in Supabase

## Problem
Profile picture uploads are failing with error: "Failed to upload profile picture. Please try again with a different image. Make sure the file is a valid image (JPG, PNG, or GIF) under 5MB."

## Solution
The `avatars` storage bucket needs to be created and configured in Supabase.

## Steps to Fix

### 1. Create the Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"Create Bucket"**
3. Configure the bucket:
   - **Name:** `avatars`
   - **Public:** `Yes` (so images can be accessed via public URL)
   - **File size limit:** `5242880` (5MB in bytes)
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`
4. Click **"Create Bucket"**

### 2. Set Up RLS Policies

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the SQL script from `server/database/setup_storage_bucket.sql`
3. This will create the necessary RLS policies to allow:
   - Authenticated users to upload avatars
   - Authenticated users to update avatars
   - Authenticated users to delete avatars
   - Public to read avatars (since bucket is public)

### 3. Verify Setup

After running the SQL script, verify the policies were created:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
```

You should see 4 policies:
- `Authenticated users can upload avatars`
- `Authenticated users can update avatars`
- `Authenticated users can delete avatars`
- `Public can read avatars`

### 4. Test Upload

1. Restart your frontend application
2. Go to Profile page
3. Try uploading a profile picture
4. Check browser console for any errors (improved error logging is now in place)

## Improved Error Handling

The code has been updated to:
- Better file type validation (checks both MIME type and file extension)
- Improved error logging (shows actual error messages in console)
- Better error messages for users (shows specific error instead of generic message)
- Changed `upsert: false` to `upsert: true` to allow overwriting existing files

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket `avatars` exists in Supabase Storage
- Check the bucket name matches exactly (case-sensitive)

### Error: "Permission denied" or "RLS"
- Make sure the RLS policies were created successfully
- Check that the user is authenticated
- Verify the policies allow INSERT, UPDATE, DELETE, and SELECT operations

### Error: "File is too large"
- Check the file size limit on the bucket (should be 5MB)
- Verify the file is actually under 5MB

### Still having issues?
1. Check browser console for detailed error messages
2. Check Supabase Dashboard → Storage → avatars bucket for any errors
3. Verify the user is authenticated (check session in browser)
4. Check network tab in browser dev tools for the actual API response

## File Path Structure

Files are uploaded with the path: `{userId}-{timestamp}.{ext}`
- Example: `123e4567-e89b-12d3-a456-426614174000-1234567890.jpg`
- This ensures unique filenames and allows users to identify their own files

