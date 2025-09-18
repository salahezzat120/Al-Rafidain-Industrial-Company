-- Test script to check users table
-- Run this to verify the users table has data

-- Check if users table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'Users table EXISTS' 
        ELSE 'Users table DOES NOT EXIST' 
    END as table_status;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if there are any users
SELECT COUNT(*) as user_count FROM users;

-- Show all users
SELECT id, email, role, 
       CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status,
       name, created_at 
FROM users 
ORDER BY role, email;
