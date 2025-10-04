-- Fix representatives table issues
-- This script will help diagnose and fix the representatives table

-- 1. Check if representatives table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'representatives';

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'representatives'
ORDER BY ordinal_position;

-- 3. Check if there are any representatives
SELECT COUNT(*) as total_representatives FROM representatives;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'representatives';

-- 5. If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS representatives (
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

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_representatives_email ON representatives(email);
CREATE INDEX IF NOT EXISTS idx_representatives_status ON representatives(status);
CREATE INDEX IF NOT EXISTS idx_representatives_id ON representatives(id);

-- 7. Enable RLS
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy to allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON representatives;
CREATE POLICY "Allow all operations for authenticated users" ON representatives 
FOR ALL USING (auth.role() = 'authenticated');

-- 9. Insert sample representatives if table is empty
INSERT INTO representatives (id, name, email, phone, status, transportation_type) VALUES
('REP-001', 'Ahmed Hassan', 'ahmed.hassan@company.com', '+964-770-123-4567', 'active', 'vehicle'),
('REP-002', 'Sara Al-Mahmoud', 'sara.almahmoud@company.com', '+964-770-234-5678', 'active', 'foot'),
('REP-003', 'Omar Ali', 'omar.ali@company.com', '+964-770-345-6789', 'on-route', 'vehicle'),
('REP-004', 'Fatima Khalil', 'fatima.khalil@company.com', '+964-770-456-7890', 'active', 'foot')
ON CONFLICT (email) DO NOTHING;

-- 10. Verify the data
SELECT id, name, email, status, transportation_type FROM representatives ORDER BY name;
