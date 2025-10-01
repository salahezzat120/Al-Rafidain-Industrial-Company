-- =====================================================
-- COMPLETE DROPDOWN SETUP FOR PRODUCT CREATION
-- This script ensures all dropdown tables have sample data
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL,
  color_name_ar VARCHAR(100),
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  material_name VARCHAR(255) NOT NULL,
  material_name_ar VARCHAR(255),
  material_type VARCHAR(100),
  material_type_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_symbol_ar VARCHAR(10),
  unit_type VARCHAR(50) DEFAULT 'COUNT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  responsible_person VARCHAR(255),
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert comprehensive sample data

-- Main Groups
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Plastic Products', 'منتجات بلاستيكية', 'Various plastic items and containers', 'مختلف المنتجات والحاويات البلاستيكية'),
('Kitchenware', 'أدوات المطبخ', 'Kitchen utensils and dining accessories', 'أدوات المطبخ وملحقات الطعام'),
('Storage Solutions', 'حلول التخزين', 'Storage and organization products', 'منتجات التخزين والتنظيم'),
('Industrial Products', 'المنتجات الصناعية', 'Industrial-grade plastic products', 'منتجات بلاستيكية صناعية'),
('Household Items', 'أدوات منزلية', 'General household plastic products', 'منتجات بلاستيكية منزلية عامة')
ON CONFLICT DO NOTHING;

-- Sub Groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
-- Plastic Products sub-groups
(1, 'Cups', 'أكواب', 'Drinking cups and mugs', 'أكواب الشرب والكؤوس'),
(1, 'Plates', 'أطباق', 'Dining plates and dishes', 'أطباق الطعام والأواني'),
(1, 'Bowls', 'أوعية', 'Mixing bowls and serving bowls', 'أوعية الخلط والتقديم'),
(1, 'Containers', 'حاويات', 'Food storage containers', 'حاويات تخزين الطعام'),

-- Kitchenware sub-groups
(2, 'Utensils', 'أدوات', 'Kitchen utensils and tools', 'أدوات المطبخ والأدوات'),
(2, 'Cutlery', 'أدوات المائدة', 'Forks, spoons, and knives', 'شوك وملاعق وسكاكين'),
(2, 'Serving Items', 'أدوات التقديم', 'Serving trays and platters', 'صواني وأطباق التقديم'),

-- Storage Solutions sub-groups
(3, 'Boxes', 'صناديق', 'Storage boxes and containers', 'صناديق وحاويات التخزين'),
(3, 'Bins', 'حاويات', 'Storage bins and organizers', 'حاويات ومنظمات التخزين'),
(3, 'Baskets', 'سلال', 'Storage baskets and hampers', 'سلال وحاويات التخزين'),

-- Industrial Products sub-groups
(4, 'Pipes', 'أنابيب', 'Industrial pipes and fittings', 'أنابيب وملحقات صناعية'),
(4, 'Sheets', 'ألواح', 'Plastic sheets and panels', 'ألواح وألواح بلاستيكية'),
(4, 'Components', 'مكونات', 'Industrial components and parts', 'مكونات وأجزاء صناعية'),

-- Household Items sub-groups
(5, 'Cleaning', 'تنظيف', 'Cleaning supplies and tools', 'مستلزمات وأدوات التنظيف'),
(5, 'Organization', 'تنظيم', 'Home organization products', 'منتجات تنظيم المنزل'),
(5, 'Decorative', 'زخرفي', 'Decorative plastic items', 'عناصر بلاستيكية زخرفية')
ON CONFLICT DO NOTHING;

-- Colors
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Black', 'أسود', '#000000'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00'),
('Yellow', 'أصفر', '#FFFF00'),
('Orange', 'برتقالي', '#FFA500'),
('Purple', 'بنفسجي', '#800080'),
('Pink', 'وردي', '#FFC0CB'),
('Brown', 'بني', '#A52A2A'),
('Gray', 'رمادي', '#808080'),
('Transparent', 'شفاف', '#FFFFFF')
ON CONFLICT DO NOTHING;

-- Materials
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) VALUES
('Polypropylene (PP)', 'البولي بروبيلين', 'Plastic', 'بلاستيك', 'High-temperature resistant plastic', 'بلاستيك مقاوم لدرجات الحرارة العالية'),
('Polyethylene (PE)', 'البولي إيثيلين', 'Plastic', 'بلاستيك', 'Flexible and durable plastic', 'بلاستيك مرن ومتين'),
('Polystyrene (PS)', 'البوليسترين', 'Plastic', 'بلاستيك', 'Rigid and lightweight plastic', 'بلاستيك صلب وخفيف الوزن'),
('Polyvinyl Chloride (PVC)', 'كلوريد البولي فينيل', 'Plastic', 'بلاستيك', 'Versatile and weather-resistant plastic', 'بلاستيك متعدد الاستخدامات ومقاوم للطقس'),
('Acrylonitrile Butadiene Styrene (ABS)', 'أكريلونيتريل بوتادين ستايرين', 'Plastic', 'بلاستيك', 'Strong and impact-resistant plastic', 'بلاستيك قوي ومقاوم للصدمات'),
('Polyethylene Terephthalate (PET)', 'بولي إيثيلين تيريفثاليت', 'Plastic', 'بلاستيك', 'Clear and recyclable plastic', 'بلاستيك شفاف وقابل لإعادة التدوير'),
('High-Density Polyethylene (HDPE)', 'البولي إيثيلين عالي الكثافة', 'Plastic', 'بلاستيك', 'Dense and chemical-resistant plastic', 'بلاستيك كثيف ومقاوم للمواد الكيميائية'),
('Low-Density Polyethylene (LDPE)', 'البولي إيثيلين منخفض الكثافة', 'Plastic', 'بلاستيك', 'Flexible and soft plastic', 'بلاستيك مرن وناعم')
ON CONFLICT DO NOTHING;

-- Units of Measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Dozen', 'دزينة', 'dz', 'دزينة', 'COUNT'),
('Hundred', 'مئة', '100', 'مئة', 'COUNT'),
('Thousand', 'ألف', '1000', 'ألف', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Gram', 'غرام', 'g', 'غ', 'WEIGHT'),
('Pound', 'رطل', 'lb', 'رطل', 'WEIGHT'),
('Liter', 'لتر', 'L', 'ل', 'VOLUME'),
('Milliliter', 'مليلتر', 'ml', 'مل', 'VOLUME'),
('Gallon', 'غالون', 'gal', 'غالون', 'VOLUME'),
('Meter', 'متر', 'm', 'م', 'LENGTH'),
('Centimeter', 'سنتيمتر', 'cm', 'سم', 'LENGTH'),
('Inch', 'بوصة', 'in', 'بوصة', 'LENGTH'),
('Square Meter', 'متر مربع', 'm²', 'م²', 'AREA'),
('Cubic Meter', 'متر مكعب', 'm³', 'م³', 'VOLUME'),
('Carton', 'كرتون', 'ctn', 'كرتون', 'COUNT'),
('Box', 'صندوق', 'box', 'صندوق', 'COUNT'),
('Pack', 'عبوة', 'pack', 'عبوة', 'COUNT'),
('Set', 'مجموعة', 'set', 'مجموعة', 'COUNT'),
('Pair', 'زوج', 'pair', 'زوج', 'COUNT')
ON CONFLICT DO NOTHING;

-- Warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, warehouse_type, capacity) VALUES
('Main Factory Warehouse', 'المستودع الرئيسي للمصنع', 'Baghdad Industrial Zone', 'المنطقة الصناعية بغداد', 'Ahmed Ali', 'أحمد علي', 'PRODUCTION', 50000),
('Cairo Distribution Center', 'مركز التوزيع القاهرة', 'Cairo, Egypt', 'القاهرة، مصر', 'Mohamed Hassan', 'محمد حسن', 'DISTRIBUTION', 25000),
('Alexandria Warehouse', 'مستودع الإسكندرية', 'Alexandria, Egypt', 'الإسكندرية، مصر', 'Omar Ibrahim', 'عمر إبراهيم', 'DISTRIBUTION', 15000),
('Basra Storage Facility', 'منشأة التخزين البصرة', 'Basra, Iraq', 'البصرة، العراق', 'Khalid Al-Mansouri', 'خالد المنصوري', 'STORAGE', 30000),
('Sales Representatives Sub-Store', 'مخزن المندوبين', 'Various Locations', 'مواقع مختلفة', 'Sales Manager', 'مدير المبيعات', 'RETAIL', 5000),
('Export Warehouse', 'مستودع التصدير', 'Port Area', 'منطقة الميناء', 'Export Manager', 'مدير التصدير', 'EXPORT', 20000)
ON CONFLICT DO NOTHING;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_main_groups_name ON main_groups(group_name);
CREATE INDEX IF NOT EXISTS idx_sub_groups_main_group ON sub_groups(main_group_id);
CREATE INDEX IF NOT EXISTS idx_sub_groups_name ON sub_groups(sub_group_name);
CREATE INDEX IF NOT EXISTS idx_colors_name ON colors(color_name);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(material_name);
CREATE INDEX IF NOT EXISTS idx_units_name ON units_of_measurement(unit_name);
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(warehouse_name);
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(location);

-- 4. Verify data insertion
SELECT 'Database setup completed successfully!' as message;

-- Show counts for verification
SELECT 'Main Groups' as table_name, COUNT(*) as count FROM main_groups
UNION ALL
SELECT 'Sub Groups' as table_name, COUNT(*) as count FROM sub_groups
UNION ALL
SELECT 'Colors' as table_name, COUNT(*) as count FROM colors
UNION ALL
SELECT 'Materials' as table_name, COUNT(*) as count FROM materials
UNION ALL
SELECT 'Units of Measurement' as table_name, COUNT(*) as count FROM units_of_measurement
UNION ALL
SELECT 'Warehouses' as table_name, COUNT(*) as count FROM warehouses;

-- Show sample data
SELECT 'Sample Main Groups:' as info;
SELECT id, group_name, group_name_ar FROM main_groups LIMIT 5;

SELECT 'Sample Sub Groups:' as info;
SELECT sg.id, sg.sub_group_name, sg.sub_group_name_ar, mg.group_name as main_group 
FROM sub_groups sg 
JOIN main_groups mg ON sg.main_group_id = mg.id 
LIMIT 5;

SELECT 'Sample Colors:' as info;
SELECT id, color_name, color_name_ar, color_code FROM colors LIMIT 5;

SELECT 'Sample Materials:' as info;
SELECT id, material_name, material_name_ar, material_type FROM materials LIMIT 5;

SELECT 'Sample Units:' as info;
SELECT id, unit_name, unit_name_ar, unit_symbol, unit_type FROM units_of_measurement LIMIT 5;

SELECT 'Sample Warehouses:' as info;
SELECT id, warehouse_name, warehouse_name_ar, location, responsible_person FROM warehouses LIMIT 5;
