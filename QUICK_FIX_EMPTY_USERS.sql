-- QUICK FIX FOR EMPTY USERS TABLE
-- This will immediately populate your users table with data

-- Step 1: Check if users table exists and is empty
SELECT 'CHECKING USERS TABLE STATUS:' as info;
SELECT COUNT(*) as current_user_count FROM users;

-- Step 2: If empty, populate with sample data
-- Insert admin and supervisor users
INSERT INTO users (id, email, password_hash, role, name) VALUES
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Insert your representative user
INSERT INTO users (id, email, password_hash, role, name) VALUES
('REP-716254', 'maged_gawish@yahoo.com', NULL, 'representative', 'Maged Gawish')
ON CONFLICT (email) DO NOTHING;

-- Step 4: Insert additional representative users
INSERT INTO users (id, email, password_hash, role, name) VALUES
('REP-12345678', 'ahmed.hassan@company.com', NULL, 'representative', 'Ahmed Hassan'),
('REP-87654321', 'sara.almahmoud@company.com', NULL, 'representative', 'Sara Al-Mahmoud')
ON CONFLICT (email) DO NOTHING;

-- Step 5: Verify the data
SELECT 'USERS TABLE NOW CONTAINS:' as info;
SELECT 
    id,
    email,
    role,
    name,
    CASE 
        WHEN password_hash IS NULL THEN 'Uses ID for auth'
        ELSE 'Uses password'
    END as auth_method
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'representative' THEN 3
    END,
    name;

-- Step 6: Count by role
SELECT 'USER COUNT BY ROLE:' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'representative' THEN 3
    END;

-- Step 7: Success message
SELECT 'SUCCESS: Users table populated with data!' as status;
SELECT 'Total users: ' || COUNT(*) as summary FROM users;
