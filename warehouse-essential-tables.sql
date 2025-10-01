-- =====================================================
-- ESSENTIAL WAREHOUSE TABLES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Warehouses table
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

-- Main groups table
CREATE TABLE IF NOT EXISTS main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub groups table
CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colors table
CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL,
  color_name_ar VARCHAR(100),
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
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

-- Units of measurement table
CREATE TABLE IF NOT EXISTS units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_symbol_ar VARCHAR(10),
  unit_type VARCHAR(50) DEFAULT 'COUNT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_name_ar VARCHAR(255),
  product_code VARCHAR(100) UNIQUE,
  stock_number VARCHAR(100) UNIQUE,
  stock_number_ar VARCHAR(100),
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id),
  sub_group_id INTEGER REFERENCES sub_groups(id),
  color_id INTEGER REFERENCES colors(id),
  material_id INTEGER REFERENCES materials(id),
  unit_of_measurement_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
  description TEXT,
  description_ar TEXT,
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock_level DECIMAL(10,2) DEFAULT 0,
  maximum_stock_level DECIMAL(10,2),
  reorder_point DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RECEIPT', 'ISSUE')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  reference_number VARCHAR(100),
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample units of measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'لتر', 'VOLUME')
ON CONFLICT DO NOTHING;

-- Insert sample main groups
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Kitchenware', 'أدوات المطبخ', 'Kitchen and dining products', 'منتجات المطبخ والطعام'),
('Storage', 'التخزين', 'Storage and organization products', 'منتجات التخزين والتنظيم')
ON CONFLICT DO NOTHING;

-- Insert sample sub groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
(1, 'Cups', 'أكواب', 'Drinking cups and mugs', 'أكواب الشرب والكؤوس'),
(1, 'Plates', 'أطباق', 'Dining plates and dishes', 'أطباق الطعام والأواني'),
(2, 'Boxes', 'صناديق', 'Storage boxes and containers', 'صناديق التخزين والحاويات')
ON CONFLICT DO NOTHING;

-- Insert sample colors
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Black', 'أسود', '#000000'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF')
ON CONFLICT DO NOTHING;

-- Insert sample materials
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar) VALUES
('Polypropylene', 'البولي بروبيلين', 'Plastic', 'بلاستيك'),
('Polyethylene', 'البولي إيثيلين', 'Plastic', 'بلاستيك')
ON CONFLICT DO NOTHING;

-- Insert sample warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (product_name, product_name_ar, product_code, main_group_id, sub_group_id, color_id, material_id, unit_of_measurement_id, description, description_ar, cost_price, selling_price) VALUES
('White Plastic Cup', 'كوب بلاستيك أبيض', 'CUP-WH-001', 1, 1, 1, 1, 1, 'White plastic cup', 'كوب بلاستيك أبيض', 0.50, 1.00),
('Red Plastic Plate', 'طبق بلاستيك أحمر', 'PLATE-RED-001', 1, 2, 3, 1, 1, 'Red plastic plate', 'طبق بلاستيك أحمر', 1.00, 2.00)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETE!
-- =====================================================
