-- Verify that product data displays names instead of IDs
-- This script checks the relationships and shows how to query products with names

-- First, let's check if all reference tables have data
SELECT 'main_groups' as table_name, COUNT(*) as record_count FROM main_groups
UNION ALL
SELECT 'sub_groups', COUNT(*) FROM sub_groups
UNION ALL
SELECT 'colors', COUNT(*) FROM colors
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'units_of_measurement', COUNT(*) FROM units_of_measurement
UNION ALL
SELECT 'products', COUNT(*) FROM products;

-- Check if products have proper relationships
SELECT 
    p.id,
    p.product_name,
    p.product_code,
    mg.group_name as main_group_name,
    sg.sub_group_name as sub_group_name,
    c.color_name,
    m.material_name,
    uom.unit_name
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
ORDER BY p.product_name;

-- Check for any NULL relationships that might cause display issues
SELECT 
    p.id,
    p.product_name,
    CASE WHEN mg.group_name IS NULL THEN 'MISSING MAIN GROUP' ELSE 'OK' END as main_group_status,
    CASE WHEN sg.sub_group_name IS NULL THEN 'MISSING SUB GROUP' ELSE 'OK' END as sub_group_status,
    CASE WHEN c.color_name IS NULL THEN 'MISSING COLOR' ELSE 'OK' END as color_status,
    CASE WHEN m.material_name IS NULL THEN 'MISSING MATERIAL' ELSE 'OK' END as material_status,
    CASE WHEN uom.unit_name IS NULL THEN 'MISSING UNIT' ELSE 'OK' END as unit_status
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
WHERE mg.group_name IS NULL 
   OR sg.sub_group_name IS NULL 
   OR c.color_name IS NULL 
   OR m.material_name IS NULL 
   OR uom.unit_name IS NULL;
