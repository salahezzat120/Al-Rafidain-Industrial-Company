-- Fix Product Foreign Keys
-- This script ensures all products have valid foreign key relationships

-- Step 1: Check current state
SELECT 'Before Fix - Products with NULL or invalid foreign keys:' as status;

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
   OR p.unit_of_measurement_id IS NULL
   OR p.main_group_id NOT IN (SELECT id FROM main_groups WHERE id IS NOT NULL)
   OR p.sub_group_id NOT IN (SELECT id FROM sub_groups WHERE id IS NOT NULL)
   OR p.color_id NOT IN (SELECT id FROM colors WHERE id IS NOT NULL)
   OR p.material_id NOT IN (SELECT id FROM materials WHERE id IS NOT NULL)
   OR p.unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement WHERE id IS NOT NULL);

-- Step 2: Fix NULL main_group_id
UPDATE products 
SET main_group_id = (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1)
WHERE main_group_id IS NULL 
   OR main_group_id NOT IN (SELECT id FROM main_groups WHERE id IS NOT NULL);

-- Step 3: Fix NULL sub_group_id
UPDATE products 
SET sub_group_id = (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles' LIMIT 1)
WHERE sub_group_id IS NULL 
   OR sub_group_id NOT IN (SELECT id FROM sub_groups WHERE id IS NOT NULL);

-- Step 4: Fix NULL color_id
UPDATE products 
SET color_id = (SELECT id FROM colors WHERE color_name = 'Transparent' LIMIT 1)
WHERE color_id IS NULL 
   OR color_id NOT IN (SELECT id FROM colors WHERE id IS NOT NULL);

-- Step 5: Fix NULL material_id
UPDATE products 
SET material_id = (SELECT id FROM materials WHERE material_name = 'PET' LIMIT 1)
WHERE material_id IS NULL 
   OR material_id NOT IN (SELECT id FROM materials WHERE id IS NOT NULL);

-- Step 6: Fix NULL unit_of_measurement_id
UPDATE products 
SET unit_of_measurement_id = (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece' LIMIT 1)
WHERE unit_of_measurement_id IS NULL 
   OR unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement WHERE id IS NOT NULL);

-- Step 7: Verify the fix
SELECT 'After Fix - Products with proper relationships:' as status;

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

-- Step 8: Test the exact query structure that Supabase uses
SELECT 'Supabase Query Test:' as status;

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
    p.is_active,
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
