-- Complete Product Display Fix
-- This script addresses all possible issues with product display

-- Step 1: Ensure all reference tables have data
-- This is the most critical step - without this data, names can't be displayed

-- Insert main groups if missing
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Plastic Products', 'المنتجات البلاستيكية', 'Main plastic product category', 'الفئة الرئيسية للمنتجات البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Plastic Products');

INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Raw Materials', 'المواد الخام', 'Raw materials for production', 'المواد الخام للإنتاج'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Raw Materials');

-- Insert sub groups if missing
INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Bottles', 'الزجاجات', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic bottles and containers', 'الزجاجات والحاويات البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Bottles');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Pipes', 'الأنابيب', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic pipes and tubing', 'الأنابيب والأنابيب البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Pipes');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Sheets', 'الألواح', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic sheets and panels', 'الألواح والألواح البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Sheets');

-- Insert colors if missing
INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Red', 'أحمر', '#FF0000'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Red');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Blue', 'أزرق', '#0000FF'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Blue');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Green', 'أخضر', '#00FF00'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Green');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Yellow', 'أصفر', '#FFFF00'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Yellow');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Black', 'أسود', '#000000'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Black');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'White', 'أبيض', '#FFFFFF'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'White');

INSERT INTO colors (color_name, color_name_ar, color_code) 
SELECT 'Transparent', 'شفاف', 'TRANS'
WHERE NOT EXISTS (SELECT 1 FROM colors WHERE color_name = 'Transparent');

-- Insert materials if missing (with material_type column)
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'PVC', 'بولي فينيل كلوريد', 'Thermoplastic', 'بلاستيك حراري', 'Polyvinyl Chloride', 'بولي فينيل كلوريد'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PVC');

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'PE', 'بولي إيثيلين', 'Thermoplastic', 'بلاستيك حراري', 'Polyethylene', 'بولي إيثيلين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PE');

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'PP', 'بولي بروبيلين', 'Thermoplastic', 'بلاستيك حراري', 'Polypropylene', 'بولي بروبيلين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PP');

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'PS', 'بولي ستايرين', 'Thermoplastic', 'بلاستيك حراري', 'Polystyrene', 'بولي ستايرين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PS');

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'ABS', 'أكريلونيتريل بوتادين ستايرين', 'Thermoplastic', 'بلاستيك حراري', 'Acrylonitrile Butadiene Styrene', 'أكريلونيتريل بوتادين ستايرين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'ABS');

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) 
SELECT 'PET', 'بولي إيثيلين تيريفثاليت', 'Thermoplastic', 'بلاستيك حراري', 'Polyethylene Terephthalate', 'بولي إيثيلين تيريفثاليت'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PET');

-- Insert units of measurement if missing
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Piece');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Kilogram');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Liter', 'لتر', 'L', 'لتر', 'VOLUME'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Liter');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Meter', 'متر', 'm', 'م', 'LENGTH'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Meter');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Square Meter', 'متر مربع', 'm²', 'م²', 'AREA'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Square Meter');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Box', 'صندوق', 'box', 'صندوق', 'COUNT'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Box');

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) 
SELECT 'Pack', 'عبوة', 'pack', 'عبوة', 'COUNT'
WHERE NOT EXISTS (SELECT 1 FROM units_of_measurement WHERE unit_name = 'Pack');

-- Step 2: Fix all products to have valid foreign key relationships
-- This ensures every product has proper references to the lookup tables

UPDATE products 
SET main_group_id = (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1)
WHERE main_group_id IS NULL 
   OR main_group_id NOT IN (SELECT id FROM main_groups WHERE id IS NOT NULL);

UPDATE products 
SET sub_group_id = (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles' LIMIT 1)
WHERE sub_group_id IS NULL 
   OR sub_group_id NOT IN (SELECT id FROM sub_groups WHERE id IS NOT NULL);

UPDATE products 
SET color_id = (SELECT id FROM colors WHERE color_name = 'Transparent' LIMIT 1)
WHERE color_id IS NULL 
   OR color_id NOT IN (SELECT id FROM colors WHERE id IS NOT NULL);

UPDATE products 
SET material_id = (SELECT id FROM materials WHERE material_name = 'PET' LIMIT 1)
WHERE material_id IS NULL 
   OR material_id NOT IN (SELECT id FROM materials WHERE id IS NOT NULL);

UPDATE products 
SET unit_of_measurement_id = (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece' LIMIT 1)
WHERE unit_of_measurement_id IS NULL 
   OR unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement WHERE id IS NOT NULL);

-- Step 3: Create a view that shows products with names (for verification)
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

-- Step 4: Grant permissions for the view
GRANT SELECT ON products_with_names TO authenticated;

-- Step 5: Verify the fix
SELECT 'Verification: Products with names instead of IDs' as status;

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

-- Step 6: Check for any remaining issues
SELECT 'Remaining Issues Check:' as status;

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
