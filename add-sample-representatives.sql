-- Add sample representatives to existing table
-- This matches your actual table schema

INSERT INTO representatives (
  id,
  name,
  email,
  phone,
  address,
  license_number,
  emergency_contact,
  vehicle,
  status,
  coverage_areas,
  transportation_type,
  avatar_url
) VALUES 
(
  'REP-001',
  'Ahmed Hassan',
  'ahmed.hassan@company.com',
  '+964-750-123-4567',
  'Baghdad Central District',
  'LIC-001',
  '+964-750-987-6543',
  'Toyota Hilux',
  'active',
  ARRAY['Baghdad', 'Central Zone'],
  'vehicle',
  null
),
(
  'REP-002',
  'Sarah Johnson',
  'sarah.johnson@company.com',
  '+964-750-234-5678',
  'Basra Warehouse Area',
  'LIC-002',
  '+964-750-876-5432',
  'Ford Ranger',
  'active',
  ARRAY['Basra', 'Southern Zone'],
  'vehicle',
  null
),
(
  'REP-003',
  'Mohammed Ali',
  'mohammed.ali@company.com',
  '+964-750-345-6789',
  'Erbil Distribution Center',
  'LIC-003',
  '+964-750-765-4321',
  'Nissan Navara',
  'on-route',
  ARRAY['Erbil', 'Northern Zone'],
  'vehicle',
  null
),
(
  'REP-004',
  'Fatima Al-Zahra',
  'fatima.alzahra@company.com',
  '+964-750-456-7890',
  'Mosul Branch Office',
  'LIC-004',
  '+964-750-654-3210',
  'Mitsubishi L200',
  'active',
  ARRAY['Mosul', 'Northern Zone'],
  'vehicle',
  null
),
(
  'REP-005',
  'Omar Khalil',
  'omar.khalil@company.com',
  '+964-750-567-8901',
  'Najaf Office',
  'LIC-005',
  '+964-750-543-2109',
  'Isuzu D-Max',
  'active',
  ARRAY['Najaf', 'Central Zone'],
  'vehicle',
  null
),
(
  'REP-006',
  'Layla Ahmed',
  'layla.ahmed@company.com',
  '+964-750-678-9012',
  'Karbala Center',
  'LIC-006',
  '+964-750-432-1098',
  'Chevrolet Colorado',
  'offline',
  ARRAY['Karbala', 'Central Zone'],
  'vehicle',
  null
);

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_representatives,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_representatives,
  COUNT(CASE WHEN status = 'on-route' THEN 1 END) as on_route_representatives,
  COUNT(CASE WHEN status IN ('active', 'on-route') THEN 1 END) as available_representatives
FROM representatives;

-- Show sample of inserted representatives
SELECT 
  id,
  name,
  email,
  phone,
  status,
  transportation_type,
  coverage_areas
FROM representatives 
WHERE status IN ('active', 'on-route')
ORDER BY name;
