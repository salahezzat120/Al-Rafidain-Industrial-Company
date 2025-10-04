-- Fix users table to ensure proper UUID handling
-- This script ensures the users table has the correct configuration

-- First, let's check the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- If the id column doesn't have a default value, let's add one
-- This ensures UUIDs are auto-generated
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also ensure the column is not nullable (it should already be, but let's be sure)
ALTER TABLE users 
ALTER COLUMN id SET NOT NULL;

-- Create an index on the id column for better performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create an index on role for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
