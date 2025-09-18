-- DISPLAY ALL USERS TABLE DATA
-- Run this in your Supabase SQL Editor to see all users

-- Show all users with detailed information
SELECT 
    'ALL USERS IN DATABASE' as info,
    id,
    email,
    role,
    name,
    CASE 
        WHEN password_hash IS NULL THEN 'NULL (Uses ID for auth)'
        ELSE 'HAS_PASSWORD'
    END as password_status,
    created_at,
    updated_at
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'representative' THEN 3
        ELSE 4
    END,
    name;

-- Count users by role
SELECT 
    'USER COUNT BY ROLE' as info,
    role,
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'representative' THEN 3
        ELSE 4
    END;

-- Show only representatives
SELECT 
    'REPRESENTATIVES ONLY' as info,
    id,
    email,
    name,
    'Uses ID for authentication' as auth_method,
    created_at
FROM users 
WHERE role = 'representative'
ORDER BY name;

-- Show only admin and supervisor users
SELECT 
    'ADMIN & SUPERVISOR USERS' as info,
    id,
    email,
    role,
    name,
    'Uses password for authentication' as auth_method,
    created_at
FROM users 
WHERE role IN ('admin', 'supervisor')
ORDER BY role, name;

-- Show your specific user
SELECT 
    'YOUR USER DATA' as info,
    id,
    email,
    role,
    name,
    CASE 
        WHEN password_hash IS NULL THEN 'NULL (Representative - uses ID)'
        ELSE 'HAS_PASSWORD'
    END as auth_method,
    created_at
FROM users 
WHERE email = 'maged_gawish@yahoo.com' OR id = 'REP-716254';

-- Summary
SELECT 
    'SUMMARY' as info,
    'Total users: ' || COUNT(*) as total_users,
    'Admins: ' || COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    'Supervisors: ' || COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisors,
    'Representatives: ' || COUNT(CASE WHEN role = 'representative' THEN 1 END) as representatives
FROM users;
