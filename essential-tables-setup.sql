-- Essential Tables Setup for Product Creation
-- Run this in Supabase SQL Editor

-- 1. Main Groups
CREATE TABLE IF NOT EXISTS main_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sub Groups
CREATE TABLE IF NOT EXISTS sub_groups (
  id SERIAL PRIMARY KEY,
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
  sub_group_name VARCHAR(255) NOT NULL,
  sub_group_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
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
  material_type_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Units of Measurement
CREATE TABLE IF NOT EXISTS units_of_measurement (
  id SERIAL PRIMARY KEY,
  unit_name VARCHAR(100) NOT NULL,
  unit_name_ar VARCHAR(100),
  unit_symbol VARCHAR(10),
  unit_symbol_ar VARCHAR(10),
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
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products
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

-- 8. Inventory
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

-- 9. Stock Movements
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
