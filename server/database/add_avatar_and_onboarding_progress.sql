-- Migration: Add avatar_url and onboarding_progress columns to users table

-- Add avatar_url column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1024);

-- Add onboarding_progress column (JSONB to store step data)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}'::jsonb;

-- Add index for avatar_url lookups (optional, but can be useful)
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url) WHERE avatar_url IS NOT NULL;

