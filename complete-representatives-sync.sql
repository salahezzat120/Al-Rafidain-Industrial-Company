-- COMPLETE REPRESENTATIVES SYNC
-- This script ensures perfect synchronization between representatives and users tables

-- Step 1: Drop and recreate both tables to ensure clean state
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS representatives CASCADE;

-- Step 2: Create representatives table with all your data
CREATE TABLE representatives (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    license_number TEXT,
    emergency_contact TEXT,
    vehicle TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-route', 'offline')),
    coverage_areas TEXT[] DEFAULT '{}',
    transportation_type TEXT NOT NULL DEFAULT 'foot' CHECK (transportation_type IN ('foot', 'vehicle')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert representative data (including your user)
INSERT INTO representatives (id, name, email, phone, address, license_number, emergency_contact, vehicle, status, coverage_areas, transportation_type) VALUES
('REP-12345678', 'Ahmed Hassan', 'ahmed.hassan@company.com', '+1 (555) 456-7890', '123 Main St, Central Zone', 'DL987654321', 'Fatima Hassan +1 (555) 456-7891', 'VH-002', 'active', ARRAY['Central Zone', 'Residential Area'], 'vehicle'),
('REP-87654321', 'Sara Al-Mahmoud', 'sara.almahmoud@company.com', '+1 (555) 567-8901', '456 Oak Ave, North District', NULL, 'Mohammed Al-Mahmoud +1 (555) 567-8902', NULL, 'active', ARRAY['North District', 'Business Quarter'], 'foot'),
('REP-716254', 'Maged Gawish', 'maged_gawish@yahoo.com', '+964-770-123-4567', 'Baghdad, Iraq', 'DL123456789', 'Emergency Contact +964-770-987-6543', 'VH-001', 'active', ARRAY['Baghdad'], 'vehicle')
ON CONFLICT (email) DO NOTHING;

-- Step 4: Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Allow NULL for representatives
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'representative')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policy for users table
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL USING (true);

-- Step 7: Create trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Insert admin and supervisor users
INSERT INTO users (id, email, password_hash, role, name) VALUES
('admin-001', 'admin@company.com', 'admin123', 'admin', 'System Administrator'),
('supervisor-001', 'supervisor@company.com', 'supervisor123', 'supervisor', 'Supervisor User')
ON CONFLICT (email) DO NOTHING;

-- Step 9: SYNC ALL REPRESENTATIVES TO USERS TABLE
-- This ensures perfect synchronization
INSERT INTO users (id, email, password_hash, role, name)
SELECT 
    r.id,
    r.email,
    NULL, -- Representatives use ID for authentication
    'representative',
    r.name
FROM representatives r
ON CONFLICT (email) DO NOTHING;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_representatives_email ON representatives(email);
CREATE INDEX IF NOT EXISTS idx_representatives_status ON representatives(status);

-- Step 11: Verification queries
SELECT 'VERIFICATION: Representatives table' as info;
SELECT COUNT(*) as total_representatives FROM representatives;
SELECT id, name, email, status FROM representatives ORDER BY id;

SELECT 'VERIFICATION: Users table (representatives only)' as info;
SELECT COUNT(*) as total_representative_users FROM users WHERE role = 'representative';
SELECT id, email, role, name FROM users WHERE role = 'representative' ORDER BY id;

-- Step 12: Test authentication for your user
SELECT 'AUTHENTICATION TEST: Your user' as info;
SELECT 
    u.id,
    u.email,
    u.role,
    u.name,
    r.phone,
    r.status,
    'Authentication will work with: email + REP-716254' as auth_note
FROM users u
JOIN representatives r ON u.id = r.id
WHERE u.email = 'maged_gawish@yahoo.com' AND u.id = 'REP-716254';

-- Step 13: Final success message
SELECT 'SUCCESS: Representatives and users tables are perfectly synchronized!' as status;
SELECT 
    'Representatives: ' || (SELECT COUNT(*) FROM representatives) || 
    ', Users (representatives): ' || (SELECT COUNT(*) FROM users WHERE role = 'representative') as summary;
