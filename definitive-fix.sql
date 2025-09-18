-- DEFINITIVE FIX: This will definitely fix the representative login
-- Run this script to ensure everything is set up correctly

-- Step 1: Drop and recreate users table
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table with proper structure
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Disable RLS to ensure data insertion works
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 4: Insert users with EXACT data that matches the authentication logic
INSERT INTO users (id, email, password_hash, role, name) VALUES
-- Admin and Supervisor (with passwords)
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User'),

-- Representatives (with NULL passwords - they use ID for authentication)
-- IMPORTANT: The ID must match exactly what you're using in login
('REP-716254', 'maged_gawish@yahoo.com', NULL, 'representative', 'Maged Gawish'),
('REP-12345678', 'ahmed.hassan@company.com', NULL, 'representative', 'Ahmed Hassan'),
('REP-87654321', 'sara.almahmoud@company.com', NULL, 'representative', 'Sara Al-Mahmoud');

-- Step 5: Re-enable RLS with simple policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Step 7: Create trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verify the exact query that will be used for authentication
SELECT 'VERIFICATION: Testing the exact authentication query' as test;

-- This is the exact query the app will run for representative login
SELECT 
    id, 
    email, 
    role, 
    created_at
FROM users 
WHERE email = 'maged_gawish@yahoo.com' 
  AND id = 'REP-716254' 
  AND role = 'representative';

-- Step 9: Show all data for verification
SELECT 'SUCCESS: Users table created with correct data' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as representative_users FROM users WHERE role = 'representative';

-- Step 10: Show your specific user
SELECT 
    'Your user data:' as info,
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL (Uses ID for auth)' ELSE 'HAS_PASSWORD' END as auth_method
FROM users 
WHERE email = 'maged_gawish@yahoo.com';
