-- Verify that the representative user exists in the database
-- Run this to check if maged_gawish@yahoo.com is in the users table

-- Check if the user exists
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL (Representative)' ELSE 'HAS_PASSWORD' END as password_status,
    created_at
FROM users 
WHERE email = 'maged_gawish@yahoo.com';

-- Check all representative users
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL (Representative)' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
WHERE role = 'representative'
ORDER BY email;

-- Check total users count
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as representative_users FROM users WHERE role = 'representative';
