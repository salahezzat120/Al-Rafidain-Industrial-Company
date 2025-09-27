-- Populate reference tables with sample data
-- This script handles tables that may not have all expected columns

-- Add sample main groups (with Arabic names for NOT NULL constraints)
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Plastic Products', 'المنتجات البلاستيكية', 'Main plastic product category', 'الفئة الرئيسية للمنتجات البلاستيكية'),
('Raw Materials', 'المواد الخام', 'Raw materials for production', 'المواد الخام للإنتاج'),
('Finished Goods', 'المنتجات النهائية', 'Completed products ready for sale', 'المنتجات المكتملة الجاهزة للبيع'),
('Components', 'المكونات', 'Individual parts and components', 'الأجزاء والمكونات الفردية');

-- Add sample sub groups (with Arabic names for NOT NULL constraints)
INSERT INTO sub_groups (sub_group_name, sub_group_name_ar, main_group_id, description, description_ar) VALUES
('Bottles', 'الزجاجات', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'), 'Plastic bottles and containers', 'الزجاجات والحاويات البلاستيكية'),
('Pipes', 'الأنابيب', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'), 'Plastic pipes and tubing', 'الأنابيب والأنابيب البلاستيكية'),
('Sheets', 'الألواح', (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'), 'Plastic sheets and panels', 'الألواح والألواح البلاستيكية'),
('Pellets', 'الحبيبات', (SELECT id FROM main_groups WHERE group_name = 'Raw Materials'), 'Raw plastic pellets', 'حبيبات البلاستيك الخام'),
('Granules', 'الحبيبات', (SELECT id FROM main_groups WHERE group_name = 'Raw Materials'), 'Plastic granules', 'حبيبات البلاستيك');

-- Add sample colors (with Arabic names for NOT NULL constraints)
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00'),
('Yellow', 'أصفر', '#FFFF00'),
('Black', 'أسود', '#000000'),
('White', 'أبيض', '#FFFFFF'),
('Transparent', 'شفاف', 'TRANS');

-- Add sample materials (with Arabic names for NOT NULL constraints)
INSERT INTO materials (material_name, material_name_ar, description, description_ar) VALUES
('PVC', 'بولي فينيل كلوريد', 'Polyvinyl Chloride', 'بولي فينيل كلوريد'),
('PE', 'بولي إيثيلين', 'Polyethylene', 'بولي إيثيلين'),
('PP', 'بولي بروبيلين', 'Polypropylene', 'بولي بروبيلين'),
('PS', 'بولي ستايرين', 'Polystyrene', 'بولي ستايرين'),
('ABS', 'أكريلونيتريل بوتادين ستايرين', 'Acrylonitrile Butadiene Styrene', 'أكريلونيتريل بوتادين ستايرين'),
('PET', 'بولي إيثيلين تيريفثاليت', 'Polyethylene Terephthalate', 'بولي إيثيلين تيريفثاليت');

-- Add sample units of measurement (with Arabic names for NOT NULL constraints)
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'لتر', 'VOLUME'),
('Meter', 'متر', 'm', 'م', 'LENGTH'),
('Square Meter', 'متر مربع', 'm²', 'م²', 'AREA'),
('Box', 'صندوق', 'box', 'صندوق', 'COUNT'),
('Pack', 'عبوة', 'pack', 'عبوة', 'COUNT');

-- Add sample products with proper relationships
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
    selling_price
) VALUES
(
    'Water Bottle 500ml', 
    'زجاجة ماء 500 مل', 
    'WB-500-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Bottles'),
    (SELECT id FROM colors WHERE color_name = 'Transparent'),
    (SELECT id FROM materials WHERE material_name = 'PET'),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'),
    '500ml transparent water bottle',
    'زجاجة ماء شفافة 500 مل',
    0.50,
    1.00
),
(
    'PVC Pipe 2 inch', 
    'أنبوب PVC 2 بوصة', 
    'PP-2IN-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Pipes'),
    (SELECT id FROM colors WHERE color_name = 'White'),
    (SELECT id FROM materials WHERE material_name = 'PVC'),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Meter'),
    '2 inch diameter PVC pipe',
    'أنبوب PVC بقطر 2 بوصة',
    2.50,
    5.00
),
(
    'Plastic Sheet 1m x 1m', 
    'لوح بلاستيك 1م × 1م', 
    'PS-1M-001', 
    (SELECT id FROM main_groups WHERE group_name = 'Plastic Products'),
    (SELECT id FROM sub_groups WHERE sub_group_name = 'Sheets'),
    (SELECT id FROM colors WHERE color_name = 'Blue'),
    (SELECT id FROM materials WHERE material_name = 'PP'),
    (SELECT id FROM units_of_measurement WHERE unit_name = 'Square Meter'),
    '1 meter square plastic sheet',
    'لوح بلاستيك مربع 1 متر',
    3.00,
    6.00
);

-- Add sample inventory for existing warehouses
INSERT INTO inventory (product_id, warehouse_id, available_quantity, minimum_stock_level, maximum_stock_level, reorder_point)
SELECT 
    p.id,
    w.id,
    CASE 
        WHEN p.product_name = 'Water Bottle 500ml' THEN 1000
        WHEN p.product_name = 'PVC Pipe 2 inch' THEN 500
        WHEN p.product_name = 'Plastic Sheet 1m x 1m' THEN 200
        ELSE 0
    END,
    50, -- minimum stock level
    2000, -- maximum stock level
    100 -- reorder point
FROM products p, warehouses w
WHERE p.product_name IN ('Water Bottle 500ml', 'PVC Pipe 2 inch', 'Plastic Sheet 1m x 1m');
