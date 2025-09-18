-- Debug query to check what's in the users table
-- Run this to see exactly what data exists

-- Check all users in the table
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status,
    created_at
FROM users 
ORDER BY role, email;

-- Check specifically for your user
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
WHERE email = 'maged_gawish@yahoo.com';

-- Check if there are any users with REP-716254 ID
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
WHERE id = 'REP-716254';

-- Check all representative users
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
WHERE role = 'representative';

-- Test the exact query that the app is running
SELECT 
    id, 
    email, 
    role, 
    created_at
FROM users 
WHERE email = 'maged_gawish@yahoo.com' 
  AND id = 'REP-716254' 
  AND role = 'representative';
