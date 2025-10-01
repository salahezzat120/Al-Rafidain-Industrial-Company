-- Quick Database Setup for Al-Rafidain Warehouse System
-- Run this in your Supabase SQL Editor

-- 1. Create main_groups table
CREATE TABLE IF NOT EXISTS main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create sub_groups table
CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL,
  color_name_ar VARCHAR(100),
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create materials table
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

-- 5. Create units_of_measurement table
CREATE TABLE IF NOT EXISTS units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_symbol_ar VARCHAR(10),
  unit_type VARCHAR(50) DEFAULT 'COUNT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create warehouses table
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

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add responsible_person column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'responsible_person'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person VARCHAR(255);
    END IF;
    
    -- Add responsible_person_ar column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'responsible_person_ar'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person_ar VARCHAR(255);
    END IF;
    
    -- Add warehouse_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'warehouse_type'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION';
    END IF;
    
    -- Add capacity column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'capacity'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN capacity DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add current_utilization column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'current_utilization'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN current_utilization DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 7. Create products table
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

-- 8. Create inventory table
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

-- 9. Create stock_movements table
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

-- 10. Insert sample data
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Plastic Products', 'منتجات بلاستيكية', 'Various plastic items', 'مختلف المنتجات البلاستيكية'),
('Kitchenware', 'أدوات المطبخ', 'Kitchen utensils and accessories', 'أدوات وملحقات المطبخ')
ON CONFLICT DO NOTHING;

INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
(1, 'Cups', 'أكواب', 'Plastic cups', 'أكواب بلاستيكية'),
(1, 'Plates', 'أطباق', 'Plastic plates', 'أطباق بلاستيكية'),
(2, 'Utensils', 'أدوات', 'Kitchen utensils', 'أدوات المطبخ')
ON CONFLICT DO NOTHING;

INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00')
ON CONFLICT DO NOTHING;

INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar) VALUES
('Polypropylene', 'البولي بروبيلين', 'Plastic', 'بلاستيك'),
('Polyethylene', 'البولي إيثيلين', 'Plastic', 'بلاستيك')
ON CONFLICT DO NOTHING;

INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'ل', 'VOLUME')
ON CONFLICT DO NOTHING;

INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
