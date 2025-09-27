-- Test Product Relationships
-- This script will help diagnose why names aren't showing instead of IDs

-- Step 1: Check if all reference tables have data
SELECT 'Reference Tables Data Check' as test_name;

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

-- Step 2: Check if products have valid foreign key relationships
SELECT 'Product Foreign Key Relationships' as test_name;

SELECT 
    p.id,
    p.product_name,
    p.product_code,
    p.main_group_id,
    p.sub_group_id,
    p.color_id,
    p.material_id,
    p.unit_of_measurement_id,
    -- Check if foreign keys exist
    CASE WHEN mg.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as main_group_exists,
    CASE WHEN sg.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as sub_group_exists,
    CASE WHEN c.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as color_exists,
    CASE WHEN m.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as material_exists,
    CASE WHEN uom.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as unit_exists
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
ORDER BY p.id;

-- Step 3: Test the exact query that the frontend uses
SELECT 'Frontend Query Test' as test_name;

SELECT 
    p.*,
    mg.group_name as main_group_name,
    mg.group_name_ar as main_group_name_ar,
    sg.sub_group_name,
    sg.sub_group_name_ar,
    c.color_name,
    c.color_name_ar,
    m.material_name,
    m.material_name_ar,
    uom.unit_name,
    uom.unit_name_ar
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
ORDER BY p.product_name;

-- Step 4: Check for any NULL foreign keys that need fixing
SELECT 'NULL Foreign Keys Check' as test_name;

SELECT 
    p.id,
    p.product_name,
    p.main_group_id,
    p.sub_group_id,
    p.color_id,
    p.material_id,
    p.unit_of_measurement_id
FROM products p
WHERE p.main_group_id IS NULL 
   OR p.sub_group_id IS NULL 
   OR p.color_id IS NULL 
   OR p.material_id IS NULL 
   OR p.unit_of_measurement_id IS NULL;

-- Step 5: Check for invalid foreign keys (pointing to non-existent records)
SELECT 'Invalid Foreign Keys Check' as test_name;

SELECT 
    p.id,
    p.product_name,
    p.main_group_id,
    p.sub_group_id,
    p.color_id,
    p.material_id,
    p.unit_of_measurement_id
FROM products p
WHERE p.main_group_id NOT IN (SELECT id FROM main_groups WHERE id IS NOT NULL)
   OR p.sub_group_id NOT IN (SELECT id FROM sub_groups WHERE id IS NOT NULL)
   OR p.color_id NOT IN (SELECT id FROM colors WHERE id IS NOT NULL)
   OR p.material_id NOT IN (SELECT id FROM materials WHERE id IS NOT NULL)
   OR p.unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement WHERE id IS NOT NULL);
