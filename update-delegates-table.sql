-- Update delegates table to support representatives
-- Run this script to update your existing database

-- Add 'representative' to the role enum
ALTER TABLE delegates DROP CONSTRAINT IF EXISTS delegates_role_check;
ALTER TABLE delegates ADD CONSTRAINT delegates_role_check 
    CHECK (role IN ('driver', 'representative', 'supervisor', 'technician', 'sales_rep'));

-- Add new status values
ALTER TABLE delegates DROP CONSTRAINT IF EXISTS delegates_status_check;
ALTER TABLE delegates ADD CONSTRAINT delegates_status_check 
    CHECK (status IN ('available', 'busy', 'offline', 'on_visit', 'active', 'inactive', 'on-route'));

-- Add notes column if it doesn't exist
ALTER TABLE delegates ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing sample data to include notes
UPDATE delegates SET notes = '{"vehicle": "VH-001", "license_number": "DL123456789", "coverage_areas": ["Downtown", "Business District"]}' 
WHERE name = 'Mike Johnson' AND role = 'driver';

UPDATE delegates SET notes = '{"specializations": ["team_management", "quality_control"]}' 
WHERE name = 'Sarah Wilson' AND role = 'supervisor';

UPDATE delegates SET notes = '{"specializations": ["maintenance", "repairs"]}' 
WHERE name = 'David Chen' AND role = 'technician';

-- Insert a sample representative
INSERT INTO delegates (name, email, phone, role, status, current_location, notes) VALUES
('Ahmed Hassan', 'ahmed.hassan@company.com', '+1 (555) 456-7890', 'representative', 'active', 'Central Zone', 
 '{"vehicle": "VH-002", "license_number": "DL987654321", "coverage_areas": ["Central Zone", "Residential Area"], "emergency_contact": "Fatima Hassan +1 (555) 456-7891"}')
ON CONFLICT (email) DO NOTHING;
