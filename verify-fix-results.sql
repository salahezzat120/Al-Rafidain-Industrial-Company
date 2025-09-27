-- Verify that the product display fix worked
-- Run this to check if names are now showing instead of IDs

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

-- Step 2: Show products with names (this should show names instead of IDs)
SELECT 'Products with Names (Should show names, not IDs):' as test_name;

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
ORDER BY p.product_name;

-- Step 3: Check for any remaining issues
SELECT 'Remaining Issues (Should be empty if fix worked):' as test_name;

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

-- Step 4: Test the exact query that the frontend uses
SELECT 'Frontend Query Test (This is what your app should see):' as test_name;

-- This simulates the exact query that getProductsWithWarehouseInfo() uses
SELECT 
    p.id,
    p.product_name,
    p.product_name_ar,
    p.product_code,
    p.description,
    p.description_ar,
    p.cost_price,
    p.selling_price,
    p.created_at,
    p.updated_at,
    -- Main group information
    mg.id as main_group_id,
    mg.group_name,
    mg.group_name_ar as main_group_name_ar,
    -- Sub group information  
    sg.id as sub_group_id,
    sg.sub_group_name,
    sg.sub_group_name_ar,
    -- Color information
    c.id as color_id,
    c.color_name,
    c.color_name_ar,
    c.color_code,
    -- Material information
    m.id as material_id,
    m.material_name,
    m.material_name_ar,
    -- Unit of measurement information
    uom.id as unit_of_measurement_id,
    uom.unit_name,
    uom.unit_name_ar,
    uom.unit_symbol,
    uom.unit_type
FROM products p
LEFT JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id  
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
ORDER BY p.product_name;
