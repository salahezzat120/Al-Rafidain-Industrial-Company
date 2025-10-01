-- Populate reference tables with sample data
-- This will ensure the form has data to work with

-- Insert sample main groups
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar, is_active) VALUES
('Plastic Products', 'منتجات بلاستيكية', 'Various plastic products', 'منتجات بلاستيكية متنوعة', true),
('Industrial Equipment', 'معدات صناعية', 'Industrial machinery and equipment', 'آلات ومعدات صناعية', true),
('Construction Materials', 'مواد البناء', 'Building and construction materials', 'مواد البناء والإنشاء', true),
('Electronics', 'إلكترونيات', 'Electronic devices and components', 'الأجهزة والمكونات الإلكترونية', true),
('Automotive Parts', 'قطع غيار السيارات', 'Car parts and accessories', 'قطع غيار وملحقات السيارات', true)
ON CONFLICT (group_name) DO NOTHING;

-- Insert sample sub groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar, is_active) VALUES
(1, 'Containers', 'حاويات', 'Plastic containers and boxes', 'حاويات وصناديق بلاستيكية', true),
(1, 'Bottles', 'زجاجات', 'Plastic bottles and flasks', 'زجاجات وقوارير بلاستيكية', true),
(1, 'Pipes', 'أنابيب', 'Plastic pipes and tubes', 'أنابيب وأنابيب بلاستيكية', true),
(2, 'Machinery', 'آلات', 'Industrial machinery', 'آلات صناعية', true),
(2, 'Tools', 'أدوات', 'Industrial tools and equipment', 'أدوات ومعدات صناعية', true),
(3, 'Cement', 'أسمنت', 'Cement and concrete products', 'منتجات الأسمنت والخرسانة', true),
(3, 'Steel', 'حديد', 'Steel and metal products', 'منتجات الحديد والمعادن', true),
(4, 'Computers', 'أجهزة كمبيوتر', 'Computer systems and components', 'أنظمة ومكونات الكمبيوتر', true),
(4, 'Mobile Devices', 'أجهزة محمولة', 'Mobile phones and tablets', 'هواتف محمولة وأجهزة لوحية', true),
(5, 'Engine Parts', 'قطع المحرك', 'Engine components and parts', 'مكونات وأجزاء المحرك', true),
(5, 'Body Parts', 'قطع الهيكل', 'Car body parts and panels', 'أجزاء وألواح هيكل السيارة', true)
ON CONFLICT (sub_group_name) DO NOTHING;

-- Insert sample colors
INSERT INTO colors (color_name, color_name_ar, color_code, is_active) VALUES
('Red', 'أحمر', '#FF0000', true),
('Blue', 'أزرق', '#0000FF', true),
('Green', 'أخضر', '#00FF00', true),
('Yellow', 'أصفر', '#FFFF00', true),
('Black', 'أسود', '#000000', true),
('White', 'أبيض', '#FFFFFF', true),
('Gray', 'رمادي', '#808080', true),
('Brown', 'بني', '#A52A2A', true),
('Orange', 'برتقالي', '#FFA500', true),
('Purple', 'بنفسجي', '#800080', true)
ON CONFLICT (color_name) DO NOTHING;

-- Insert sample materials
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar, is_active) VALUES
('HDPE', 'البولي إيثيلين عالي الكثافة', 'Plastic', 'بلاستيك', 'High-density polyethylene', 'البولي إيثيلين عالي الكثافة', true),
('LDPE', 'البولي إيثيلين منخفض الكثافة', 'Plastic', 'بلاستيك', 'Low-density polyethylene', 'البولي إيثيلين منخفض الكثافة', true),
('PET', 'البولي إيثيلين تيريفثاليت', 'Plastic', 'بلاستيك', 'Polyethylene terephthalate', 'البولي إيثيلين تيريفثاليت', true),
('PVC', 'كلوريد البوليفينيل', 'Plastic', 'بلاستيك', 'Polyvinyl chloride', 'كلوريد البوليفينيل', true),
('Steel', 'الحديد', 'Metal', 'معدن', 'Steel material', 'مادة الحديد', true),
('Aluminum', 'الألمنيوم', 'Metal', 'معدن', 'Aluminum material', 'مادة الألمنيوم', true),
('Wood', 'الخشب', 'Natural', 'طبيعي', 'Wood material', 'مادة الخشب', true),
('Glass', 'الزجاج', 'Natural', 'طبيعي', 'Glass material', 'مادة الزجاج', true),
('Rubber', 'المطاط', 'Synthetic', 'اصطناعي', 'Rubber material', 'مادة المطاط', true),
('Fabric', 'النسيج', 'Textile', 'نسيج', 'Fabric material', 'مادة النسيج', true)
ON CONFLICT (material_name) DO NOTHING;

-- Insert sample units of measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type, is_active) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT', true),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT', true),
('Gram', 'غرام', 'g', 'غ', 'WEIGHT', true),
('Liter', 'لتر', 'L', 'ل', 'VOLUME', true),
('Meter', 'متر', 'm', 'م', 'LENGTH', true),
('Centimeter', 'سنتيمتر', 'cm', 'سم', 'LENGTH', true),
('Millimeter', 'مليمتر', 'mm', 'مم', 'LENGTH', true),
('Square Meter', 'متر مربع', 'm²', 'م²', 'AREA', true),
('Cubic Meter', 'متر مكعب', 'm³', 'م³', 'VOLUME', true),
('Box', 'صندوق', 'box', 'صندوق', 'COUNT', true),
('Pack', 'عبوة', 'pack', 'عبوة', 'COUNT', true),
('Set', 'مجموعة', 'set', 'مجموعة', 'COUNT', true)
ON CONFLICT (unit_name) DO NOTHING;

-- Verify the data was inserted
SELECT 'Main Groups' as table_name, COUNT(*) as count FROM main_groups
UNION ALL
SELECT 'Sub Groups' as table_name, COUNT(*) as count FROM sub_groups
UNION ALL
SELECT 'Colors' as table_name, COUNT(*) as count FROM colors
UNION ALL
SELECT 'Materials' as table_name, COUNT(*) as count FROM materials
UNION ALL
SELECT 'Units of Measurement' as table_name, COUNT(*) as count FROM units_of_measurement;