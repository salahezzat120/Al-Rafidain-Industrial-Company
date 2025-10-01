-- Test warehouse creation
-- Run this in Supabase SQL Editor to create test warehouses

-- Insert test warehouses
INSERT INTO warehouses (
  warehouse_name, 
  warehouse_name_ar, 
  location, 
  location_ar,
  responsible_person,
  responsible_person_ar,
  warehouse_type,
  capacity
) VALUES
(
  'Test Warehouse 1', 
  'مستودع تجريبي 1', 
  'Baghdad', 
  'بغداد',
  'Ahmed Ali',
  'أحمد علي',
  'DISTRIBUTION',
  1000
),
(
  'Test Warehouse 2', 
  'مستودع تجريبي 2', 
  'Cairo', 
  'القاهرة',
  'Mohamed Hassan',
  'محمد حسن',
  'FACTORY',
  2000
)
ON CONFLICT DO NOTHING;

-- Verify the warehouses were created
SELECT 
    id,
    warehouse_name,
    location,
    responsible_person,
    created_at
FROM warehouses
ORDER BY created_at DESC;
