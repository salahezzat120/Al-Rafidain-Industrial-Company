-- Complete Database Setup for Product Display
-- This script ensures all reference data is properly populated and relationships work

-- Step 1: Create all reference tables if they don't exist
CREATE TABLE IF NOT EXISTS main_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_groups (
    id SERIAL PRIMARY KEY,
    sub_group_name VARCHAR(255) NOT NULL,
    sub_group_name_ar VARCHAR(255) NOT NULL,
    main_group_id INTEGER REFERENCES main_groups(id),
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(255) NOT NULL,
    color_name_ar VARCHAR(255) NOT NULL,
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    material_name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units_of_measurement (
    id SERIAL PRIMARY KEY,
    unit_name VARCHAR(255) NOT NULL,
    unit_name_ar VARCHAR(255) NOT NULL,
    unit_symbol VARCHAR(10),
    unit_symbol_ar VARCHAR(10),
    unit_type VARCHAR(50) DEFAULT 'COUNT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Handle existing data and foreign key constraints
-- First, check if we have existing stock movements or inventory
DO $$
BEGIN
    -- If there are stock movements, we need to handle them carefully
    IF EXISTS (SELECT 1 FROM stock_movements LIMIT 1) THEN
        RAISE NOTICE 'Found existing stock movements. Preserving data and updating references instead of deleting.';
        
        -- Update existing products to use proper foreign keys instead of deleting
        UPDATE products 
        SET main_group_id = (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1)
        WHERE main_group_id IS NULL OR main_group_id NOT IN (SELECT id FROM main_groups);
        
        UPDATE products 
        SET sub_group_id = (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles' LIMIT 1)
        WHERE sub_group_id IS NULL OR sub_group_id NOT IN (SELECT id FROM sub_groups);
        
        UPDATE products 
        SET color_id = (SELECT id FROM colors WHERE color_name = 'Transparent' LIMIT 1)
        WHERE color_id IS NULL OR color_id NOT IN (SELECT id FROM colors);
        
        UPDATE products 
        SET material_id = (SELECT id FROM materials WHERE material_name = 'PET' LIMIT 1)
        WHERE material_id IS NULL OR material_id NOT IN (SELECT id FROM materials);
        
        UPDATE products 
        SET unit_of_measurement_id = (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece' LIMIT 1)
        WHERE unit_of_measurement_id IS NULL OR unit_of_measurement_id NOT IN (SELECT id FROM units_of_measurement);
        
    ELSE
        -- No existing data, safe to clear and repopulate
        DELETE FROM products WHERE id > 0;
        DELETE FROM sub_groups WHERE id > 0;
        DELETE FROM main_groups WHERE id > 0;
        DELETE FROM colors WHERE id > 0;
        DELETE FROM materials WHERE id > 0;
        DELETE FROM units_of_measurement WHERE id > 0;
        
        -- Reset sequences
        ALTER SEQUENCE main_groups_id_seq RESTART WITH 1;
        ALTER SEQUENCE sub_groups_id_seq RESTART WITH 1;
        ALTER SEQUENCE colors_id_seq RESTART WITH 1;
        ALTER SEQUENCE materials_id_seq RESTART WITH 1;
        ALTER SEQUENCE units_of_measurement_id_seq RESTART WITH 1;
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Step 3: Insert reference data in correct order (using INSERT ... WHERE NOT EXISTS)
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Plastic Products', 'المنتجات البلاستيكية', 'Main plastic product category', 'الفئة الرئيسية للمنتجات البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Plastic Products');

INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Raw Materials', 'المواد الخام', 'Raw materials for production', 'المواد الخام للإنتاج'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Raw Materials');

INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Finished Goods', 'المنتجات النهائية', 'Completed products ready for sale', 'المنتجات المكتملة الجاهزة للبيع'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Finished Goods');

INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) 
SELECT 'Components', 'المكونات', 'Individual parts and components', 'الأجزاء والمكونات الفردية'
WHERE NOT EXISTS (SELECT 1 FROM main_groups WHERE group_name = 'Components');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Bottles', 'الزجاجات', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic bottles and containers', 'الزجاجات والحاويات البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Bottles');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Pipes', 'الأنابيب', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic pipes and tubing', 'الأنابيب والأنابيب البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Pipes');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Sheets', 'الألواح', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1), 'Plastic sheets and panels', 'الألواح والألواح البلاستيكية'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Sheets');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Pellets', 'الحبيبات', (SELECT id FROM main_groups WHERE group_name = 'Raw Materials' LIMIT 1), 'Raw plastic pellets', 'حبيبات البلاستيك الخام'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Pellets');

INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) 
SELECT 'Granules', 'الحبيبات', (SELECT id FROM main_groups WHERE group_name = 'Raw Materials' LIMIT 1), 'Plastic granules', 'حبيبات البلاستيك'
WHERE NOT EXISTS (SELECT 1 FROM sub_groups WHERE sub_group_name = 'Granules');

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

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'PVC', 'بولي فينيل كلوريد', 'Polyvinyl Chloride', 'بولي فينيل كلوريد'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PVC');

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'PE', 'بولي إيثيلين', 'Polyethylene', 'بولي إيثيلين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PE');

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'PP', 'بولي بروبيلين', 'Polypropylene', 'بولي بروبيلين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PP');

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'PS', 'بولي ستايرين', 'Polystyrene', 'بولي ستايرين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PS');

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'ABS', 'أكريلونيتريل بوتادين ستايرين', 'Acrylonitrile Butadiene Styrene', 'أكريلونيتريل بوتادين ستايرين'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'ABS');

INSERT INTO materials (material_name, material_name_ar, description, description_ar) 
SELECT 'PET', 'بولي إيثيلين تيريفثاليت', 'Polyethylene Terephthalate', 'بولي إيثيلين تيريفثاليت'
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE material_name = 'PET');

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

-- Step 4: Insert products with proper relationships (only if they don't exist)
INSERT INTO products (
    product_name, 
    product_name_ar, 
    product_code, 
    main_group_id, 
    sub_group_id, 
    color_id, 
    material_id, 
    unit_of_measurement_id, 
    description, 
    description_ar,
    cost_price,
    selling_price,
    is_active
) VALUES
(
    'Water Bottle 500ml', 
    'زجاجة ماء 500 مل', 
    'WB-500-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles' LIMIT 1),
    (SELECT id FROM colors WHERE color_name = 'Transparent' LIMIT 1),
    (SELECT id FROM materials WHERE material_name = 'PET' LIMIT 1),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece' LIMIT 1),
    '500ml transparent water bottle',
    'زجاجة ماء شفافة 500 مل',
    0.50,
    1.00,
    true
),
(
    'PVC Pipe 2 inch', 
    'أنبوب PVC 2 بوصة', 
    'PP-2IN-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Pipes' LIMIT 1),
    (SELECT id FROM colors WHERE color_name = 'White' LIMIT 1),
    (SELECT id FROM materials WHERE material_name = 'PVC' LIMIT 1),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Meter' LIMIT 1),
    '2 inch diameter PVC pipe',
    'أنبوب PVC بقطر 2 بوصة',
    2.50,
    5.00,
    true
),
(
    'Plastic Sheet 1m x 1m', 
    'لوح بلاستيك 1م × 1م', 
    'PS-1M-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products' LIMIT 1),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Sheets' LIMIT 1),
    (SELECT id FROM colors WHERE color_name = 'Blue' LIMIT 1),
    (SELECT id FROM materials WHERE material_name = 'PP' LIMIT 1),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Square Meter' LIMIT 1),
    '1 meter square plastic sheet',
    'لوح بلاستيك مربع 1 متر',
    3.00,
    6.00,
    true
)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WB-500-001');

-- Step 5: Verify the relationships work
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

-- Step 6: Create RLS policies if needed
ALTER TABLE main_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measurement ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read reference tables
CREATE POLICY "Allow read access to main_groups" ON main_groups FOR SELECT TO authenticated;
CREATE POLICY "Allow read access to sub_groups" ON sub_groups FOR SELECT TO authenticated;
CREATE POLICY "Allow read access to colors" ON colors FOR SELECT TO authenticated;
CREATE POLICY "Allow read access to materials" ON materials FOR SELECT TO authenticated;
CREATE POLICY "Allow read access to units_of_measurement" ON units_of_measurement FOR SELECT TO authenticated;
