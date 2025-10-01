-- Test warehouse data in database
-- Run this in Supabase SQL Editor to check if warehouses exist

-- Check if warehouses table exists and has data
SELECT 
    'warehouses' as table_name,
    COUNT(*) as record_count
FROM warehouses;

-- Show all warehouses
SELECT 
    id,
    warehouse_name,
    location,
    responsible_person,
    created_at
FROM warehouses
ORDER BY created_at DESC;

-- Check if the table structure is correct
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;
