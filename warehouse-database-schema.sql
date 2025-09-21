-- Comprehensive Warehouse Management Database Schema
-- For Al-Rafidain Industrial Company - Plastic Products

-- 1. Warehouses Table
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Units of Measurement Table
CREATE TABLE units_of_measurement (
    id SERIAL PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL UNIQUE,
    unit_code VARCHAR(10) NOT NULL UNIQUE,
    is_user_defined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Main Groups Table
CREATE TABLE main_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_user_defined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sub Groups Table
CREATE TABLE sub_groups (
    id SERIAL PRIMARY KEY,
    sub_group_name VARCHAR(255) NOT NULL,
    main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
    description TEXT,
    is_user_defined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sub_group_name, main_group_id)
);

-- 5. Colors Table
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(100) NOT NULL UNIQUE,
    color_code VARCHAR(7), -- For hex color codes
    is_user_defined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Materials Table
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL UNIQUE,
    material_code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    is_user_defined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50) UNIQUE,
    main_group_id INTEGER NOT NULL REFERENCES main_groups(id),
    sub_group_id INTEGER REFERENCES sub_groups(id),
    color_id INTEGER REFERENCES colors(id),
    material_id INTEGER REFERENCES materials(id),
    unit_of_measurement_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    description TEXT,
    specifications JSONB, -- For additional product specifications
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inventory Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER NOT NULL DEFAULT 0,
    maximum_stock_level INTEGER,
    reorder_point INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

-- 9. Stock Movements Table (for tracking inventory changes)
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_main_group ON products(main_group_id);
CREATE INDEX idx_products_sub_group ON products(sub_group_id);
CREATE INDEX idx_products_color ON products(color_id);
CREATE INDEX idx_products_material ON products(material_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

-- Insert default data

-- Insert default warehouses
INSERT INTO warehouses (warehouse_name, location, responsible_person) VALUES
('Factory Warehouse', 'Main Factory Location', 'Factory Manager'),
('Cairo Distribution Warehouse', 'Cairo, Egypt', 'Cairo Warehouse Manager'),
('Alexandria Warehouse', 'Alexandria, Egypt', 'Alexandria Warehouse Manager'),
('Sales Representatives Sub-Store', 'Various Locations', 'Sales Manager');

-- Insert default units of measurement
INSERT INTO units_of_measurement (unit_name, unit_code, is_user_defined) VALUES
('Piece', 'PCS', FALSE),
('Dozen', 'DZ', FALSE),
('Carton', 'CTN', FALSE),
('Pallet', 'PLT', FALSE),
('Kilogram', 'KG', FALSE);

-- Insert default main groups
INSERT INTO main_groups (group_name, description, is_user_defined) VALUES
('Plastic Plates', 'Various types of plastic plates', FALSE),
('Plastic Boxes', 'Different sizes and types of plastic boxes', FALSE),
('Cups', 'Plastic cups for various purposes', FALSE),
('Household Items', 'General household plastic products', FALSE),
('Industrial Products', 'Industrial-grade plastic products', FALSE);

-- Insert default sub groups
INSERT INTO sub_groups (sub_group_name, main_group_id, is_user_defined) VALUES
-- Plates sub-groups
('Small Plates', (SELECT id FROM main_groups WHERE group_name = 'Plastic Plates'), FALSE),
('Medium Plates', (SELECT id FROM main_groups WHERE group_name = 'Plastic Plates'), FALSE),
('Large Plates', (SELECT id FROM main_groups WHERE group_name = 'Plastic Plates'), FALSE),
-- Boxes sub-groups
('Food Boxes', (SELECT id FROM main_groups WHERE group_name = 'Plastic Boxes'), FALSE),
('Medical Boxes', (SELECT id FROM main_groups WHERE group_name = 'Plastic Boxes'), FALSE),
-- Cups sub-groups
('Small Cups', (SELECT id FROM main_groups WHERE group_name = 'Cups'), FALSE),
('Medium Cups', (SELECT id FROM main_groups WHERE group_name = 'Cups'), FALSE),
('Large Cups', (SELECT id FROM main_groups WHERE group_name = 'Cups'), FALSE);

-- Insert default colors
INSERT INTO colors (color_name, color_code, is_user_defined) VALUES
('White', '#FFFFFF', FALSE),
('Transparent', '#F0F8FF', FALSE),
('Colored', '#FF6B6B', FALSE);

-- Insert default materials
INSERT INTO materials (material_name, material_code, description, is_user_defined) VALUES
('HDPE', 'HDPE', 'High-Density Polyethylene', FALSE),
('PET', 'PET', 'Polyethylene Terephthalate', FALSE),
('PP', 'PP', 'Polypropylene', FALSE);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for inventory summary
CREATE VIEW inventory_summary AS
SELECT 
    p.id as product_id,
    p.product_name,
    p.product_code,
    mg.group_name as main_group,
    sg.sub_group_name as sub_group,
    c.color_name,
    m.material_name,
    uom.unit_name as unit_of_measurement,
    w.warehouse_name,
    i.available_quantity,
    i.minimum_stock_level,
    i.maximum_stock_level,
    i.reorder_point,
    CASE 
        WHEN i.available_quantity <= i.minimum_stock_level THEN 'LOW_STOCK'
        WHEN i.available_quantity <= i.reorder_point THEN 'REORDER'
        ELSE 'IN_STOCK'
    END as stock_status
FROM products p
JOIN main_groups mg ON p.main_group_id = mg.id
LEFT JOIN sub_groups sg ON p.sub_group_id = sg.id
LEFT JOIN colors c ON p.color_id = c.id
LEFT JOIN materials m ON p.material_id = m.id
JOIN units_of_measurement uom ON p.unit_of_measurement_id = uom.id
JOIN inventory i ON p.id = i.product_id
JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.is_active = TRUE;
