-- FORCE CREATE USERS TABLE
-- This will definitely create the users table and populate it

-- Step 1: Drop table if exists (to start fresh)
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Allow NULL for representatives
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Disable RLS temporarily to ensure data insertion works
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 4: Insert users directly
INSERT INTO users (id, email, password_hash, role, name) VALUES
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User'),
('REP-716254', 'maged_gawish@yahoo.com', NULL, 'representative', 'Maged Gawish'),
('REP-12345678', 'ahmed.hassan@company.com', NULL, 'representative', 'Ahmed Hassan'),
('REP-87654321', 'sara.almahmoud@company.com', NULL, 'representative', 'Sara Al-Mahmoud');

-- Step 5: Re-enable RLS with simple policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 7: Verify the data
SELECT 'SUCCESS: Users table created and populated!' as status;
SELECT COUNT(*) as total_users FROM users;

SELECT 'ALL USERS:' as info;
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

-- Step 8: Test your specific user
SELECT 'YOUR USER TEST:' as info;
SELECT 
    id,
    email,
    role,
    name
FROM users 
WHERE email = 'maged_gawish@yahoo.com' AND id = 'REP-716254';
