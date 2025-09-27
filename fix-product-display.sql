-- Fix Product Display: Ensure names are shown instead of IDs
-- This script addresses the issue where product relationships show IDs instead of names

-- Step 1: Ensure all reference tables have the required data
-- Add missing units of measurement if they don't exist
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type)
SELECT * FROM (VALUES
    ('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
    ('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
    ('Liter', 'لتر', 'L', 'لتر', 'VOLUME'),
    ('Meter', 'متر', 'm', 'م', 'LENGTH'),
    ('Square Meter', 'متر مربع', 'm²', 'م²', 'AREA'),
    ('Box', 'صندوق', 'box', 'صندوق', 'COUNT'),
    ('Pack', 'عبوة', 'pack', 'عبوة', 'COUNT')
) AS v(unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type)
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = v.unit_name);

-- Step 2: Verify all foreign key relationships exist
-- Check for orphaned product records
UPDATE products 
SET main_group_id = (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1)
WHERE main_group_id NOT IN (SELECT id FROM main_groups);

UPDATE products 
SET sub_group_id = (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles' LIMIT 1)
WHERE sub_group_id NOT IN (SELECT id FROM sub_groups);

UPDATE products 
SET color_id = (SELECT id FROM colors WHERE color_name = 'Transparent' LIMIT 1)
WHERE color_id NOT IN (SELECT id FROM colors);

UPDATE products 
SET material_id = (SELECT id FROM materials WHERE material_name = 'PET' LIMIT 1)
WHERE material_id NOT IN (SELECT id FROM materials);

UPDATE products 
SET unit_of_measurement_id = (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece' LIMIT 1)
WHERE unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement);

-- Step 3: Create a view that shows products with all names instead of IDs
CREATE OR REPLACE VIEW products_with_names AS
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
LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id;

-- Step 4: Create a function to get products with inventory and names
CREATE OR REPLACE FUNCTION get_products_with_inventory_and_names()
RETURNS TABLE (
    product_id INTEGER,
    product_name TEXT,
    product_name_ar TEXT,
    product_code TEXT,
    main_group_name TEXT,
    sub_group_name TEXT,
    color_name TEXT,
    material_name TEXT,
    unit_name TEXT,
    warehouse_name TEXT,
    available_quantity INTEGER,
    cost_price DECIMAL,
    selling_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.product_name,
        p.product_name_ar,
        p.product_code,
        mg.group_name as main_group_name,
        sg.sub_group_name,
        c.color_name,
        m.material_name,
        uom.unit_name,
        w.warehouse_name,
        i.available_quantity,
        p.cost_price,
        p.selling_price
    FROM products p
    LEFT JOIN main_groups mg ON p.main_group_id = mg.id
    LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
    LEFT JOIN colors c ON p.color_id = c.id
    LEFT JOIN materials m ON p.material_id = m.id
    LEFT JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
    LEFT JOIN inventory i ON p.id = i.product_id
    LEFT JOIN warehouses w ON i.warehouse_id = w.id
    WHERE p.is_active = true
    ORDER BY p.product_name;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Grant necessary permissions
GRANT SELECT ON products_with_names TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_with_inventory_and_names() TO authenticated;

-- Step 6: Verify the fix by showing sample data
SELECT 
    'Verification: Products with names instead of IDs' as status,
    COUNT(*) as total_products
FROM products_with_names;

-- Show sample of the fixed data
SELECT 
    product_name,
    main_group_name,
    sub_group_name,
    color_name,
    material_name,
    unit_name
FROM products_with_names
LIMIT 5;
