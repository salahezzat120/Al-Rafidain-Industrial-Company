-- Create representatives table
-- Run this script in your Supabase SQL editor

-- Representatives table
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

-- Enable RLS
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON representatives FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_representatives_updated_at BEFORE UPDATE ON representatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO representatives (id, name, email, phone, address, license_number, emergency_contact, vehicle, status, coverage_areas, transportation_type) VALUES
('REP-12345678', 'Ahmed Hassan', 'ahmed.hassan@company.com', '+1 (555) 456-7890', '123 Main St, Central Zone', 'DL987654321', 'Fatima Hassan +1 (555) 456-7891', 'VH-002', 'active', ARRAY['Central Zone', 'Residential Area'], 'vehicle'),
('REP-87654321', 'Sara Al-Mahmoud', 'sara.almahmoud@company.com', '+1 (555) 567-8901', '456 Oak Ave, North District', NULL, 'Mohammed Al-Mahmoud +1 (555) 567-8902', NULL, 'active', ARRAY['North District', 'Business Quarter'], 'foot')
ON CONFLICT (email) DO NOTHING;
