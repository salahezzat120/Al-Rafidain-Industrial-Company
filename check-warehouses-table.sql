-- Check the structure of the warehouses table
-- This will help identify what columns actually exist

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM warehouses LIMIT 3;

-- Test inserting a simple warehouse
INSERT INTO warehouses (warehouse_name, location) VALUES
('Test Warehouse', 'Test Location')
ON CONFLICT DO NOTHING;

-- Verify the insert worked
SELECT * FROM warehouses WHERE warehouse_name = 'Test Warehouse';

-- Clean up test data
DELETE FROM warehouses WHERE warehouse_name = 'Test Warehouse';
