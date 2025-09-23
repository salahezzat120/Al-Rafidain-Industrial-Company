-- =====================================================
-- FIX WAREHOUSE DATABASE DATA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Insert sample main groups if they don't exist
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Kitchenware', 'أدوات المطبخ', 'Kitchen and dining products', 'منتجات المطبخ والطعام'),
('Storage', 'التخزين', 'Storage and organization products', 'منتجات التخزين والتنظيم')
ON CONFLICT DO NOTHING;

-- Insert sample units of measurement if they don't exist
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'لتر', 'VOLUME')
ON CONFLICT DO NOTHING;

-- Insert sample sub groups if they don't exist
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
(1, 'Cups', 'أكواب', 'Drinking cups and mugs', 'أكواب الشرب والكؤوس'),
(1, 'Plates', 'أطباق', 'Dining plates and dishes', 'أطباق الطعام والأواني'),
(2, 'Boxes', 'صناديق', 'Storage boxes and containers', 'صناديق التخزين والحاويات')
ON CONFLICT DO NOTHING;

-- Insert sample colors if they don't exist
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Black', 'أسود', '#000000'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF')
ON CONFLICT DO NOTHING;

-- Insert sample materials if they don't exist
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar) VALUES
('Polypropylene', 'البولي بروبيلين', 'Plastic', 'بلاستيك'),
('Polyethylene', 'البولي إيثيلين', 'Plastic', 'بلاستيك')
ON CONFLICT DO NOTHING;

-- Insert sample warehouses if they don't exist
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 5000)
ON CONFLICT DO NOTHING;

-- Test product creation
INSERT INTO products (product_name, product_name_ar, product_code, main_group_id, sub_group_id, unit_of_measurement_id, description, description_ar) VALUES
('Test Product', 'منتج تجريبي', 'TEST-001', 1, 1, 1, 'Test product for debugging', 'منتج تجريبي للتصحيح')
ON CONFLICT (product_code) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if data was inserted
SELECT 'main_groups' as table_name, COUNT(*) as count FROM main_groups
UNION ALL
SELECT 'units_of_measurement', COUNT(*) FROM units_of_measurement
UNION ALL
SELECT 'sub_groups', COUNT(*) FROM sub_groups
UNION ALL
SELECT 'colors', COUNT(*) FROM colors
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'products', COUNT(*) FROM products;

-- =====================================================
-- COMPLETE!
-- =====================================================
