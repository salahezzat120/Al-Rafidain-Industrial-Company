-- Debug Supabase connection and table access
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if all required tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'main_groups', 'sub_groups', 'colors', 'materials', 
    'units_of_measurement', 'warehouses', 'products', 
    'inventory', 'stock_movements'
)
ORDER BY table_name;

-- 2. Check if products table has the required foreign key columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Test a simple query that the application would run
SELECT 
    p.id,
    p.product_name,
    p.product_code,
    mg.group_name as main_group_name,
    sg.sub_group_name,
    c.color_name,
    m.material_name,
    uom.unit_name
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
LIMIT 5;

-- 4. Check if there are any data in the reference tables
SELECT 'main_groups' as table_name, COUNT(*) as record_count FROM main_groups
UNION ALL
SELECT 'sub_groups' as table_name, COUNT(*) as record_count FROM sub_groups
UNION ALL
SELECT 'colors' as table_name, COUNT(*) as record_count FROM colors
UNION ALL
SELECT 'materials' as table_name, COUNT(*) as record_count FROM materials
UNION ALL
SELECT 'units_of_measurement' as table_name, COUNT(*) as record_count FROM units_of_measurement
UNION ALL
SELECT 'warehouses' as table_name, COUNT(*) as record_count FROM warehouses;
