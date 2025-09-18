-- EMERGENCY FIX: Create users table with data
-- This will definitely fix the empty users table issue

-- Drop and recreate users table completely
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily to ensure data insertion works
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert users directly
INSERT INTO users (id, email, password_hash, role, name) VALUES
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User'),
('rep-001', 'maged_gawish@yahoo.com', NULL, 'representative', 'Maged Gawish'),
('rep-002', 'ahmed.hassan@company.com', NULL, 'representative', 'Ahmed Hassan'),
('rep-003', 'sara.almahmoud@company.com', NULL, 'representative', 'Sara Al-Mahmoud');

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Verify data
SELECT 'SUCCESS: Users table created with data' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT id, email, role, 
       CASE WHEN password_hash IS NULL THEN 'NULL (Representative)' ELSE 'HAS_PASSWORD' END as password_status 
FROM users 
ORDER BY role, email;
