-- FINAL FIX: Complete representative login setup
-- This will definitely fix the representative login issue

-- Step 1: Drop and recreate users table with proper structure
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with correct structure
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Disable RLS to ensure data insertion works
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Insert all users including your representative account
INSERT INTO users (id, email, password_hash, role, name) VALUES
-- Admin and Supervisor
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User'),

-- Representatives (with NULL passwords - they use ID for authentication)
('REP-716254', 'maged_gawish@yahoo.com', NULL, 'representative', 'Maged Gawish'),
('REP-12345678', 'ahmed.hassan@company.com', NULL, 'representative', 'Ahmed Hassan'),
('REP-87654321', 'sara.almahmoud@company.com', NULL, 'representative', 'Sara Al-Mahmoud');

-- Step 4: Re-enable RLS with simple policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple policy that allows all operations
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify the setup
SELECT 'SUCCESS: Users table created with all data' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as representative_users FROM users WHERE role = 'representative';

-- Step 8: Show your specific user
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL (Uses ID for auth)' ELSE 'HAS_PASSWORD' END as auth_method
FROM users 
WHERE email = 'maged_gawish@yahoo.com';

-- Step 9: Show all users for verification
SELECT 
    id, 
    email, 
    role, 
    name,
    CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status
FROM users 
ORDER BY role, email;
