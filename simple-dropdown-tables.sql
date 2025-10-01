-- =====================================================
-- SIMPLE DROPDOWN TABLES - NO FOREIGN KEYS
-- Essential tables for product creation dropdowns
-- =====================================================

-- 1. Main Groups
CREATE TABLE IF NOT EXISTS main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sub Groups (NO foreign key)
CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL, -- Just integer reference
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Colors
CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL,
  color_name_ar VARCHAR(100),
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Materials
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  material_name VARCHAR(255) NOT NULL,
  material_name_ar VARCHAR(255),
  material_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Units of Measurement
CREATE TABLE IF NOT EXISTS units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_type VARCHAR(50) DEFAULT 'COUNT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  responsible_person VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic sample data

-- Main Groups
INSERT INTO main_groups (group_name, group_name_ar) VALUES
('Plastic Products', 'منتجات بلاستيكية'),
('Kitchenware', 'أدوات المطبخ'),
('Storage Solutions', 'حلول التخزين'),
('Industrial Products', 'المنتجات الصناعية'),
('Household Items', 'أدوات منزلية')
ON CONFLICT DO NOTHING;

-- Sub Groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar) VALUES
(1, 'Cups', 'أكواب'),
(1, 'Plates', 'أطباق'),
(1, 'Bowls', 'أوعية'),
(2, 'Utensils', 'أدوات'),
(2, 'Cutlery', 'أدوات المائدة'),
(3, 'Boxes', 'صناديق'),
(3, 'Bins', 'حاويات'),
(4, 'Pipes', 'أنابيب'),
(4, 'Sheets', 'ألواح'),
(5, 'Cleaning', 'تنظيف')
ON CONFLICT DO NOTHING;

-- Colors
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Black', 'أسود', '#000000'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00'),
('Yellow', 'أصفر', '#FFFF00')
ON CONFLICT DO NOTHING;

-- Materials
INSERT INTO materials (material_name, material_name_ar, material_type) VALUES
('Polypropylene (PP)', 'البولي بروبيلين', 'Plastic'),
('Polyethylene (PE)', 'البولي إيثيلين', 'Plastic'),
('Polystyrene (PS)', 'البوليسترين', 'Plastic'),
('PVC', 'كلوريد البولي فينيل', 'Plastic'),
('ABS', 'أكريلونيتريل بوتادين ستايرين', 'Plastic')
ON CONFLICT DO NOTHING;

-- Units of Measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'WEIGHT'),
('Liter', 'لتر', 'L', 'VOLUME'),
('Meter', 'متر', 'm', 'LENGTH'),
('Dozen', 'دزينة', 'dz', 'COUNT')
ON CONFLICT DO NOTHING;

-- Warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali'),
('Cairo Distribution', 'توزيع القاهرة', 'Cairo', 'القاهرة', 'Mohamed Hassan'),
('Alexandria Storage', 'تخزين الإسكندرية', 'Alexandria', 'الإسكندرية', 'Omar Ibrahim')
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 'Simple dropdown tables created successfully!' as message;
SELECT 'Main Groups' as table, COUNT(*) as count FROM main_groups
UNION ALL
SELECT 'Sub Groups' as table, COUNT(*) as count FROM sub_groups
UNION ALL
SELECT 'Colors' as table, COUNT(*) as count FROM colors
UNION ALL
SELECT 'Materials' as table, COUNT(*) as count FROM materials
UNION ALL
SELECT 'Units' as table, COUNT(*) as count FROM units_of_measurement
UNION ALL
SELECT 'Warehouses' as table, COUNT(*) as count FROM warehouses;
