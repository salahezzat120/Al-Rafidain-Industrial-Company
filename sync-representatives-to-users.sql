-- SYNC REPRESENTATIVES TO USERS TABLE
-- This script ensures that all representatives in the representatives table
-- have corresponding entries in the users table with matching data

-- Step 1: Check current data in both tables
SELECT 'CURRENT REPRESENTATIVES TABLE:' as info;
SELECT id, name, email, phone, status FROM representatives ORDER BY id;

SELECT 'CURRENT USERS TABLE (representatives only):' as info;
SELECT id, email, role, name FROM users WHERE role = 'representative' ORDER BY id;

-- Step 2: Delete existing representative entries from users table
-- (We'll recreate them to ensure perfect sync)
DELETE FROM users WHERE role = 'representative';

-- Step 3: Insert all representatives from representatives table into users table
INSERT INTO users (id, email, password_hash, role, name)
SELECT 
    r.id,
    r.email,
    NULL, -- Representatives use ID for authentication, no password
    'representative',
    r.name
FROM representatives r
ORDER BY r.id;

-- Step 4: Verify the sync
SELECT 'SYNC COMPLETE - VERIFICATION:' as info;

SELECT 'Representatives in representatives table:' as table_name;
SELECT COUNT(*) as count FROM representatives;

SELECT 'Representatives in users table:' as table_name;
SELECT COUNT(*) as count FROM users WHERE role = 'representative';

-- Step 5: Show the synced data
SELECT 'SYNCED REPRESENTATIVE DATA:' as info;
SELECT 
    u.id,
    u.email,
    u.role,
    u.name,
    r.phone,
    r.status,
    r.transportation_type,
    CASE WHEN u.password_hash IS NULL THEN 'Uses ID for auth' ELSE 'Has password' END as auth_method
FROM users u
JOIN representatives r ON u.id = r.id
WHERE u.role = 'representative'
ORDER BY u.id;

-- Step 6: Test the exact authentication query for your user
SELECT 'AUTHENTICATION TEST FOR YOUR USER:' as info;
SELECT 
    id, 
    email, 
    role, 
    created_at
FROM users 
WHERE email = 'maged_gawish@yahoo.com' 
  AND id = 'REP-716254' 
  AND role = 'representative';

-- Step 7: Final verification
SELECT 'SUCCESS: Representatives synced to users table' as status;
SELECT 
    'Total representatives: ' || COUNT(*) as summary
FROM users 
WHERE role = 'representative';
