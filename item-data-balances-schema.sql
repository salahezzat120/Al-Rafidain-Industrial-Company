-- Item Data & Balances Database Schema
-- For Al-Rafidain Industrial Company - Plastic Products

-- 1. Items Master Data Table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    item_name_ar VARCHAR(255) NOT NULL,
    item_name_en VARCHAR(255) NOT NULL,
    main_group_id INTEGER NOT NULL REFERENCES main_groups(id),
    sub_group_id INTEGER REFERENCES sub_groups(id),
    color_id INTEGER REFERENCES colors(id),
    material_id INTEGER REFERENCES materials(id),
    unit_of_measurement_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    barcode VARCHAR(100) UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    specifications JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Item Unit Conversions Table
CREATE TABLE item_unit_conversions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    from_unit_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    to_unit_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    conversion_factor DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, from_unit_id, to_unit_id)
);

-- 3. Item Balances Table
CREATE TABLE item_balances (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    opening_balance DECIMAL(15,4) DEFAULT 0,
    current_balance DECIMAL(15,4) DEFAULT 0,
    reserved_quantity DECIMAL(15,4) DEFAULT 0,
    available_quantity DECIMAL(15,4) GENERATED ALWAYS AS (current_balance - reserved_quantity) STORED,
    minimum_stock_level DECIMAL(15,4) DEFAULT 0,
    maximum_stock_level DECIMAL(15,4),
    reorder_point DECIMAL(15,4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, warehouse_id)
);

-- 4. Item Movements Table
CREATE TABLE item_movements (
    id SERIAL PRIMARY KEY,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('GOODS_RECEIPT', 'GOODS_ISSUE', 'STOCK_TRANSFER', 'RETURN_NOTE', 'ADJUSTMENT')),
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity DECIMAL(15,4) NOT NULL,
    unit_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    reference_number VARCHAR(100),
    reference_type VARCHAR(50), -- e.g., 'PRODUCTION_ORDER', 'SALES_ORDER', 'PURCHASE_ORDER'
    notes_ar TEXT,
    notes_en TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Validation: For transfers, both warehouses must be specified
    CONSTRAINT check_transfer_warehouses CHECK (
        (movement_type = 'STOCK_TRANSFER' AND from_warehouse_id IS NOT NULL AND to_warehouse_id IS NOT NULL) OR
        (movement_type != 'STOCK_TRANSFER')
    )
);

-- 5. Inventory Counts Table
CREATE TABLE inventory_counts (
    id SERIAL PRIMARY KEY,
    count_reference VARCHAR(100) NOT NULL,
    count_date DATE NOT NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ADJUSTED')),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 6. Inventory Count Items Table
CREATE TABLE inventory_count_items (
    id SERIAL PRIMARY KEY,
    count_id INTEGER NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    system_quantity DECIMAL(15,4) NOT NULL,
    counted_quantity DECIMAL(15,4),
    difference DECIMAL(15,4) GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
    adjustment_note_ar TEXT,
    adjustment_note_en TEXT,
    is_adjusted BOOLEAN DEFAULT FALSE,
    adjusted_at TIMESTAMP,
    adjusted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(count_id, item_id)
);

-- 7. Bulk Import Batches Table
CREATE TABLE bulk_import_batches (
    id SERIAL PRIMARY KEY,
    batch_reference VARCHAR(100) NOT NULL UNIQUE,
    import_type VARCHAR(50) NOT NULL, -- 'PRODUCTION', 'PURCHASE', 'ADJUSTMENT'
    file_name VARCHAR(255),
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_log TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 8. Bulk Import Records Table
CREATE TABLE bulk_import_records (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES bulk_import_batches(id) ON DELETE CASCADE,
    item_code VARCHAR(50),
    item_name_ar VARCHAR(255),
    item_name_en VARCHAR(255),
    quantity DECIMAL(15,4),
    unit_name VARCHAR(100),
    warehouse_name VARCHAR(255),
    reference_number VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_items_code ON items(item_code);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_main_group ON items(main_group_id);
CREATE INDEX idx_items_sub_group ON items(sub_group_id);
CREATE INDEX idx_items_active ON items(is_active);

CREATE INDEX idx_item_balances_item ON item_balances(item_id);
CREATE INDEX idx_item_balances_warehouse ON item_balances(warehouse_id);
CREATE INDEX idx_item_balances_available ON item_balances(available_quantity);

CREATE INDEX idx_item_movements_item ON item_movements(item_id);
CREATE INDEX idx_item_movements_type ON item_movements(movement_type);
CREATE INDEX idx_item_movements_date ON item_movements(created_at);
CREATE INDEX idx_item_movements_warehouse_from ON item_movements(from_warehouse_id);
CREATE INDEX idx_item_movements_warehouse_to ON item_movements(to_warehouse_id);

CREATE INDEX idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX idx_inventory_counts_warehouse ON inventory_counts(warehouse_id);
CREATE INDEX idx_inventory_counts_status ON inventory_counts(status);

CREATE INDEX idx_inventory_count_items_count ON inventory_count_items(count_id);
CREATE INDEX idx_inventory_count_items_item ON inventory_count_items(item_id);

CREATE INDEX idx_bulk_import_batches_status ON bulk_import_batches(status);
CREATE INDEX idx_bulk_import_batches_type ON bulk_import_batches(import_type);

CREATE INDEX idx_bulk_import_records_batch ON bulk_import_records(batch_id);
CREATE INDEX idx_bulk_import_records_status ON bulk_import_records(status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_balances_updated_at BEFORE UPDATE ON item_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update item balances when movements are created
CREATE OR REPLACE FUNCTION update_item_balance_on_movement()
RETURNS TRIGGER AS $$
DECLARE
    target_warehouse_id INTEGER;
    balance_change DECIMAL(15,4);
BEGIN
    -- Determine target warehouse and balance change
    IF NEW.movement_type = 'GOODS_RECEIPT' THEN
        target_warehouse_id := NEW.to_warehouse_id;
        balance_change := NEW.quantity;
    ELSIF NEW.movement_type = 'GOODS_ISSUE' THEN
        target_warehouse_id := NEW.from_warehouse_id;
        balance_change := -NEW.quantity;
    ELSIF NEW.movement_type = 'STOCK_TRANSFER' THEN
        -- Update both warehouses
        -- Reduce from source warehouse
        INSERT INTO item_balances (item_id, warehouse_id, current_balance)
        VALUES (NEW.item_id, NEW.from_warehouse_id, -NEW.quantity)
        ON CONFLICT (item_id, warehouse_id)
        DO UPDATE SET 
            current_balance = item_balances.current_balance - NEW.quantity,
            last_updated = CURRENT_TIMESTAMP;
        
        -- Add to destination warehouse
        INSERT INTO item_balances (item_id, warehouse_id, current_balance)
        VALUES (NEW.item_id, NEW.to_warehouse_id, NEW.quantity)
        ON CONFLICT (item_id, warehouse_id)
        DO UPDATE SET 
            current_balance = item_balances.current_balance + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP;
        
        RETURN NEW;
    ELSIF NEW.movement_type = 'RETURN_NOTE' THEN
        target_warehouse_id := NEW.to_warehouse_id;
        balance_change := NEW.quantity;
    ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
        target_warehouse_id := NEW.to_warehouse_id;
        balance_change := NEW.quantity;
    END IF;
    
    -- Update balance for single warehouse movements
    IF target_warehouse_id IS NOT NULL THEN
        INSERT INTO item_balances (item_id, warehouse_id, current_balance)
        VALUES (NEW.item_id, target_warehouse_id, balance_change)
        ON CONFLICT (item_id, warehouse_id)
        DO UPDATE SET 
            current_balance = item_balances.current_balance + balance_change,
            last_updated = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_item_balance_on_movement
    AFTER INSERT ON item_movements
    FOR EACH ROW EXECUTE FUNCTION update_item_balance_on_movement();

-- Create view for item summary with balances
CREATE VIEW item_summary AS
SELECT 
    i.id as item_id,
    i.item_code,
    i.item_name_ar,
    i.item_name_en,
    i.barcode,
    mg.group_name as main_group,
    sg.sub_group_name as sub_group,
    c.color_name,
    m.material_name,
    uom.unit_name as unit_of_measurement,
    COALESCE(SUM(ib.current_balance), 0) as total_balance,
    COALESCE(SUM(ib.available_quantity), 0) as total_available,
    COALESCE(SUM(ib.reserved_quantity), 0) as total_reserved,
    COUNT(DISTINCT ib.warehouse_id) as warehouse_count,
    i.is_active,
    i.created_at,
    i.updated_at
FROM items i
LEFT JOIN main_groups mg ON i.main_group_id = mg.id
LEFT JOIN sub_groups sg ON i.sub_group_id = sg.id
LEFT JOIN colors c ON i.color_id = c.id
LEFT JOIN materials m ON i.material_id = m.id
JOIN units_of_measurement uom ON i.unit_of_measurement_id = uom.id
LEFT JOIN item_balances ib ON i.id = ib.item_id
GROUP BY i.id, i.item_code, i.item_name_ar, i.item_name_en, i.barcode,
         mg.group_name, sg.sub_group_name, c.color_name, m.material_name,
         uom.unit_name, i.is_active, i.created_at, i.updated_at;

-- Create view for warehouse item balances
CREATE VIEW warehouse_item_balances AS
SELECT 
    ib.id as balance_id,
    i.item_code,
    i.item_name_ar,
    i.item_name_en,
    i.barcode,
    w.warehouse_name,
    w.location as warehouse_location,
    ib.opening_balance,
    ib.current_balance,
    ib.reserved_quantity,
    ib.available_quantity,
    ib.minimum_stock_level,
    ib.maximum_stock_level,
    ib.reorder_point,
    CASE 
        WHEN ib.available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN ib.available_quantity <= ib.minimum_stock_level THEN 'LOW_STOCK'
        WHEN ib.available_quantity <= ib.reorder_point THEN 'REORDER'
        ELSE 'IN_STOCK'
    END as stock_status,
    ib.last_updated
FROM item_balances ib
JOIN items i ON ib.item_id = i.id
JOIN warehouses w ON ib.warehouse_id = w.id
WHERE i.is_active = TRUE;

-- Insert sample data
-- Sample items
INSERT INTO items (item_code, item_name_ar, item_name_en, main_group_id, sub_group_id, color_id, material_id, unit_of_measurement_id, barcode) VALUES
('WHITE-ML-200CUP', 'كوب 200 مل أبيض', 'White 200ml Cup', 
 (SELECT id FROM main_groups WHERE group_name = 'Cups'), 
 (SELECT id FROM sub_groups WHERE sub_group_name = 'Medium Cups'), 
 (SELECT id FROM colors WHERE color_name = 'White'), 
 (SELECT id FROM materials WHERE material_name = 'PP'), 
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'), '1234567890123'),

('TRANS-ML-200CUP', 'كوب 200 مل شفاف', 'Transparent 200ml Cup',
 (SELECT id FROM main_groups WHERE group_name = 'Cups'),
 (SELECT id FROM sub_groups WHERE sub_group_name = 'Medium Cups'),
 (SELECT id FROM colors WHERE color_name = 'Transparent'),
 (SELECT id FROM materials WHERE material_name = 'PP'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'), '1234567890124'),

('WHITE-SM-PLATE', 'طبق صغير أبيض', 'White Small Plate',
 (SELECT id FROM main_groups WHERE group_name = 'Plastic Plates'),
 (SELECT id FROM sub_groups WHERE sub_group_name = 'Small Plates'),
 (SELECT id FROM colors WHERE color_name = 'White'),
 (SELECT id FROM materials WHERE material_name = 'HDPE'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'), '1234567890125');

-- Sample unit conversions (1 Carton = 20 Pieces)
INSERT INTO item_unit_conversions (item_id, from_unit_id, to_unit_id, conversion_factor) VALUES
((SELECT id FROM items WHERE item_code = 'WHITE-ML-200CUP'), 
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Carton'), 20),

((SELECT id FROM items WHERE item_code = 'TRANS-ML-200CUP'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Carton'), 20),

((SELECT id FROM items WHERE item_code = 'WHITE-SM-PLATE'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Piece'),
 (SELECT id FROM units_of_measurement WHERE unit_name = 'Carton'), 50);

-- Sample opening balances
INSERT INTO item_balances (item_id, warehouse_id, opening_balance, current_balance, minimum_stock_level, reorder_point) VALUES
((SELECT id FROM items WHERE item_code = 'WHITE-ML-200CUP'),
 (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse'), 1000, 1000, 100, 200),

((SELECT id FROM items WHERE item_code = 'WHITE-ML-200CUP'),
 (SELECT id FROM warehouses WHERE warehouse_name = 'Cairo Distribution Warehouse'), 500, 500, 50, 100),

((SELECT id FROM items WHERE item_code = 'TRANS-ML-200CUP'),
 (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse'), 800, 800, 80, 160),

((SELECT id FROM items WHERE item_code = 'WHITE-SM-PLATE'),
 (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse'), 2000, 2000, 200, 400);
