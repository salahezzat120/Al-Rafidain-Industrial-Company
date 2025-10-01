-- Insert Sample Data for Testing
-- Run this after essential-tables-setup.sql

-- Insert main groups
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Plastic Products', 'منتجات بلاستيكية', 'Various plastic items', 'مختلف المنتجات البلاستيكية'),
('Kitchenware', 'أدوات المطبخ', 'Kitchen utensils and accessories', 'أدوات وملحقات المطبخ')
ON CONFLICT DO NOTHING;

-- Insert sub groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
(1, 'Cups', 'أكواب', 'Plastic cups', 'أكواب بلاستيكية'),
(1, 'Plates', 'أطباق', 'Plastic plates', 'أطباق بلاستيكية'),
(2, 'Utensils', 'أدوات', 'Kitchen utensils', 'أدوات المطبخ')
ON CONFLICT DO NOTHING;

-- Insert colors
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00')
ON CONFLICT DO NOTHING;

-- Insert materials
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar) VALUES
('Polypropylene', 'البولي بروبيلين', 'Plastic', 'بلاستيك'),
('Polyethylene', 'البولي إيثيلين', 'Plastic', 'بلاستيك')
ON CONFLICT DO NOTHING;

-- Insert units of measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'ل', 'VOLUME')
ON CONFLICT DO NOTHING;

-- Insert warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Sample data inserted successfully!' as message;
SELECT COUNT(*) as main_groups_count FROM main_groups;
SELECT COUNT(*) as sub_groups_count FROM sub_groups;
SELECT COUNT(*) as colors_count FROM colors;
SELECT COUNT(*) as materials_count FROM materials;
SELECT COUNT(*) as units_count FROM units_of_measurement;
SELECT COUNT(*) as warehouses_count FROM warehouses;
