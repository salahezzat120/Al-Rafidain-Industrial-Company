-- Complete users table setup with proper constraints
-- This script will create everything needed for authentication

-- Drop existing users table if it exists (WARNING: This removes all data)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper structure
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Allow NULL for representatives
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert admin and supervisor users
INSERT INTO users (id, email, password_hash, role, name) VALUES
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User')
ON CONFLICT (email) DO NOTHING;

-- Insert representatives from representatives table (if it exists)
INSERT INTO users (id, email, password_hash, role, name)
SELECT 
    r.id,
    r.email,
    NULL, -- No password for representatives
    'representative',
    r.name
FROM representatives r
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = r.email
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash) WHERE password_hash IS NOT NULL;

-- Verify the data
SELECT 'Users table created successfully' as status;
SELECT id, email, role, CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_PASSWORD' END as password_status FROM users ORDER BY role, email;
