# Supabase Auth Migration Guide

This guide documents the migration from custom JWT authentication to Supabase Auth.

## ✅ Migration Complete

Your application has been successfully migrated from custom JWT authentication to Supabase Auth.

## What Changed

### Backend Changes

1. **Authentication Middleware** (`server/middleware/auth.js`)
   - Removed custom JWT verification
   - Now uses Supabase Auth token verification
   - Verifies tokens using Supabase Admin API

2. **Auth Routes** (`server/routes/auth.js`)
   - Registration: Uses `supabase.auth.signUp()` to create Supabase Auth user
   - Login: Uses `supabase.auth.signInWithPassword()` for authentication
   - Password Reset: Uses Supabase Auth password reset flow
   - Returns Supabase Auth session tokens instead of custom JWT

3. **User Model** (`server/models/User.js`)
   - Removed password hashing (Supabase handles this)
   - Added `auth_user_id` field to link with Supabase Auth users
   - Added `findByAuthUserId()` method

4. **Database Schema** (`server/database/worklinkph.sql`)
   - Added `auth_user_id UUID` column to link with `auth.users`
   - Removed `password_hash` column (Supabase handles passwords)
   - Added Row Level Security (RLS) policies
   - Added foreign key constraint to `auth.users`

### Frontend Changes

1. **Supabase Client** (`src/config/supabase.js`)
   - New file: Supabase client configuration for frontend
   - Uses `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

2. **API Service** (`src/services/api.js`)
   - Updated to use Supabase Auth sessions
   - Automatically gets access token from Supabase session
   - Updated `authAPI` to work with Supabase Auth
   - Added session management methods

3. **Login Screen** (`src/screens/LoginScreen.js`)
   - Updated to use `authAPI.login()` with Supabase Auth
   - Added error handling and loading states

4. **Sign Up Screen** (`src/screens/SignUpScreen.js`)
   - Updated to use `authAPI.register()` with Supabase Auth
   - Added error handling and loading states

## Environment Variables

### Backend (`.env` in `server/` directory)

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration (No longer needed - can be removed)
# JWT_SECRET=...
# JWT_EXPIRE=...
```

### Frontend (`.env` in root directory)

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Setup Steps

### 1. Update Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Run the updated schema from `server/database/worklinkph.sql`
3. This will:
   - Add `auth_user_id` column to `users` table
   - Remove `password_hash` column (if it exists)
   - Add RLS policies
   - Add foreign key constraint

### 2. Enable Supabase Auth

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Email" provider
3. Configure email templates (optional)
4. Set up redirect URLs:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: Add your production URL

### 3. Update Environment Variables

**Backend:**
- Update `server/.env` with your Supabase credentials
- Remove `JWT_SECRET` and `JWT_EXPIRE` (no longer needed)

**Frontend:**
- Create `.env` in root directory
- Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

### 4. Install Dependencies

Backend dependencies are already updated. Frontend Supabase client is already installed.

### 5. Test the Migration

1. Start your backend: `cd server && npm run dev`
2. Start your frontend: `npm start`
3. Try registering a new user
4. Try logging in
5. Verify that protected routes work

## Key Differences

### Before (Custom JWT)
- Custom password hashing with bcrypt
- Custom JWT token generation
- Manual token verification
- Token stored in localStorage

### After (Supabase Auth)
- Supabase handles password hashing
- Supabase generates and manages tokens
- Automatic token verification
- Session managed by Supabase client
- Built-in password reset
- Email verification support

## Benefits

✅ **Built-in Features:**
- Email verification
- Password reset flows
- Session management
- Token refresh
- Social login (can be added later)

✅ **Security:**
- Industry-standard authentication
- Automatic token refresh
- Secure session management

✅ **Less Code:**
- No need to manage JWT secrets
- No password hashing logic
- No token generation code

## Migration Notes

### Phone Login

Your app supports phone number login. The backend handles this by:
1. Checking if identifier is email or phone
2. If phone, finding the user's email from the database
3. Using email for Supabase Auth login

### User Profiles

User profiles are stored in `public.users` table and linked to Supabase Auth users via `auth_user_id`. This allows you to:
- Keep custom profile fields
- Link to Supabase Auth users
- Use Supabase Auth for authentication

### Row Level Security (RLS)

RLS policies have been added to protect data:
- Users can only read/update their own profile
- Jobs are publicly readable
- Authenticated users can create jobs
- Users can only update/delete their own jobs

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `server/.env`
- Check that `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in root `.env`
- Restart your servers after updating `.env` files

### Error: "User profile not found"
- The user was created in Supabase Auth but profile creation failed
- Check backend logs for errors
- User may need to complete registration again

### Error: "Invalid or expired token"
- Supabase session may have expired
- User needs to log in again
- Check that Supabase Auth is properly configured

### Database Migration Issues
- If you have existing users, you'll need to migrate them
- Create a migration script to:
  1. Create Supabase Auth accounts for existing users
  2. Link them with existing profiles using `auth_user_id`

## Next Steps

1. ✅ Test registration and login
2. ✅ Test password reset (if implemented)
3. ✅ Test protected routes
4. ⚠️ Migrate existing users (if any)
5. ⚠️ Set up email templates in Supabase
6. ⚠️ Configure production redirect URLs

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Supabase Auth docs: https://supabase.com/docs/guides/auth

