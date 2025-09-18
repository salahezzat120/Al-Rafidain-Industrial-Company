-- CHECK REPRESENTATIVES SYNC STATUS
-- Run this to see if representatives and users tables are in sync

-- Check representatives table
SELECT 'REPRESENTATIVES TABLE:' as table_name;
SELECT 
    id,
    name,
    email,
    phone,
    status,
    transportation_type
FROM representatives 
ORDER BY id;

-- Check users table (representatives only)
SELECT 'USERS TABLE (representatives only):' as table_name;
SELECT 
    id,
    email,
    role,
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL (Uses ID)' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
WHERE role = 'representative'
ORDER BY id;

-- Check for mismatches
SELECT 'SYNC STATUS CHECK:' as info;

-- Representatives not in users table
SELECT 'Representatives missing from users table:' as issue;
SELECT r.id, r.name, r.email
FROM representatives r
LEFT JOIN users u ON r.id = u.id
WHERE u.id IS NULL;

-- Users (representatives) not in representatives table
SELECT 'Users (representatives) missing from representatives table:' as issue;
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN representatives r ON u.id = r.id
WHERE u.role = 'representative' AND r.id IS NULL;

-- Check your specific user
SELECT 'YOUR USER STATUS:' as info;
SELECT 
    'In representatives table:' as check,
    CASE WHEN EXISTS(SELECT 1 FROM representatives WHERE id = 'REP-716254') THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
    'In users table:' as check,
    CASE WHEN EXISTS(SELECT 1 FROM users WHERE id = 'REP-716254' AND role = 'representative') THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
    'Email matches:' as check,
    CASE WHEN EXISTS(SELECT 1 FROM representatives r JOIN users u ON r.id = u.id WHERE r.id = 'REP-716254' AND r.email = u.email) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
    'Name matches:' as check,
    CASE WHEN EXISTS(SELECT 1 FROM representatives r JOIN users u ON r.id = u.id WHERE r.id = 'REP-716254' AND r.name = u.name) THEN 'YES' ELSE 'NO' END as status;

-- Final sync status
SELECT 'FINAL SYNC STATUS:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM representatives) = (SELECT COUNT(*) FROM users WHERE role = 'representative')
        THEN 'TABLES ARE IN SYNC'
        ELSE 'TABLES ARE OUT OF SYNC - RUN SYNC SCRIPT'
    END as sync_status;
