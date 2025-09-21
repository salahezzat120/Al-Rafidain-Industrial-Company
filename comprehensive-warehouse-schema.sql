-- =====================================================
-- COMPREHENSIVE WAREHOUSE MANAGEMENT SYSTEM SCHEMA
-- Al-Rafidain Industrial Company - Plastic Products
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Warehouses Table
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_name_ar VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_ar VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255),
    manager_name_ar VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    capacity DECIMAL(10,2),
    current_utilization DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units of Measurement Table
CREATE TABLE units_of_measurement (
    id SERIAL PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL,
    unit_name_ar VARCHAR(100) NOT NULL,
    unit_symbol VARCHAR(10) NOT NULL,
    unit_symbol_ar VARCHAR(10) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('WEIGHT', 'VOLUME', 'LENGTH', 'AREA', 'COUNT')),
    conversion_factor DECIMAL(10,4) DEFAULT 1,
    base_unit_id INTEGER REFERENCES units_of_measurement(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main Product Groups Table
CREATE TABLE main_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub Product Groups Table
CREATE TABLE sub_groups (
    id SERIAL PRIMARY KEY,
    main_group_id INTEGER NOT NULL REFERENCES main_groups(id) ON DELETE CASCADE,
    sub_group_name VARCHAR(255) NOT NULL,
    sub_group_name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colors Table
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(100) NOT NULL,
    color_name_ar VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) NOT NULL, -- HEX color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials Table
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    material_name_ar VARCHAR(255) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    material_type_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT MANAGEMENT
-- =====================================================

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    main_group_id INTEGER NOT NULL REFERENCES main_groups(id),
    sub_group_id INTEGER NOT NULL REFERENCES sub_groups(id),
    color_id INTEGER REFERENCES colors(id),
    material_id INTEGER REFERENCES materials(id),
    unit_of_measurement_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
    description TEXT,
    description_ar TEXT,
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    specifications JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Costs Table
CREATE TABLE product_costs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cost_price DECIMAL(10,2) NOT NULL,
    cost_date DATE NOT NULL,
    supplier VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Prices Table
CREATE TABLE product_prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    selling_price DECIMAL(10,2) NOT NULL,
    price_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'IQD',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory Table
CREATE TABLE inventory (
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

-- Stock Movements Table
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
    movement_type_ar VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    reference_number VARCHAR(100),
    reference_type VARCHAR(50),
    reference_type_ar VARCHAR(50),
    notes TEXT,
    notes_ar TEXT,
    created_by VARCHAR(255),
    created_by_ar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STOCKTAKING SYSTEM
-- =====================================================

-- Stocktaking Table
CREATE TABLE stocktaking (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    stocktaking_date DATE NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED')),
    status_ar VARCHAR(50) DEFAULT 'مخطط',
    total_items INTEGER DEFAULT 0,
    counted_items INTEGER DEFAULT 0,
    discrepancies INTEGER DEFAULT 0,
    notes TEXT,
    notes_ar TEXT,
    created_by VARCHAR(255),
    created_by_ar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocktaking Items Table
CREATE TABLE stocktaking_items (
    id SERIAL PRIMARY KEY,
    stocktaking_id INTEGER NOT NULL REFERENCES stocktaking(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    system_quantity DECIMAL(10,2) NOT NULL,
    counted_quantity DECIMAL(10,2) NOT NULL,
    difference DECIMAL(10,2) NOT NULL,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BARCODE MANAGEMENT
-- =====================================================

-- Barcodes Table
CREATE TABLE barcodes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode_value VARCHAR(255) UNIQUE NOT NULL,
    barcode_type VARCHAR(20) NOT NULL CHECK (barcode_type IN ('CODE128', 'QR_CODE', 'EAN13')),
    barcode_type_ar VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    notes_ar TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SPECIALIZED INVENTORY TRACKING
-- =====================================================

-- Consignment Stock Table
CREATE TABLE consignment_stock (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    consignee_name VARCHAR(255) NOT NULL,
    consignee_name_ar VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    consignment_date DATE NOT NULL,
    expected_return_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETURNED', 'EXPIRED')),
    status_ar VARCHAR(50) DEFAULT 'نشط',
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Damaged Goods Table
CREATE TABLE damaged_goods (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    quantity DECIMAL(10,2) NOT NULL,
    damage_type VARCHAR(100) NOT NULL,
    damage_type_ar VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    reason_ar TEXT NOT NULL,
    reported_by VARCHAR(255),
    reported_by_ar VARCHAR(255),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'INVESTIGATED', 'DISPOSED', 'RETURNED')),
    status_ar VARCHAR(50) DEFAULT 'تم الإبلاغ'
);

-- Expiry Items Table
CREATE TABLE expiry_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    quantity DECIMAL(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'DISPOSED')),
    status_ar VARCHAR(50) DEFAULT 'نشط',
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Serial Numbers Table
CREATE TABLE serial_numbers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'SOLD', 'RETURNED')),
    status_ar VARCHAR(50) DEFAULT 'متاح',
    assigned_to VARCHAR(255),
    assigned_to_ar VARCHAR(255),
    assigned_date DATE,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MOVEMENT TRACKING
-- =====================================================

-- Product Movements Table
CREATE TABLE product_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL,
    movement_type_ar VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS AND REPORTING
-- =====================================================

-- Aging Items Table
CREATE TABLE aging_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    quantity DECIMAL(10,2) NOT NULL,
    days_in_stock INTEGER NOT NULL,
    age_category VARCHAR(20) NOT NULL CHECK (age_category IN ('NEW', 'RECENT', 'AGING', 'OLD')),
    age_category_ar VARCHAR(50) NOT NULL,
    last_movement_date DATE,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Analysis Table
CREATE TABLE stock_analysis (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    analysis_date DATE NOT NULL,
    total_in DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_out DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_movement DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    turnover_rate DECIMAL(5,2),
    analysis_notes TEXT,
    analysis_notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Valuation Items Table
CREATE TABLE valuation_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    available_quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    valuation_date DATE NOT NULL,
    valuation_method VARCHAR(50),
    valuation_method_ar VARCHAR(50),
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issued Items Table
CREATE TABLE issued_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    quantity DECIMAL(10,2) NOT NULL,
    issued_to VARCHAR(255) NOT NULL,
    issued_to_ar VARCHAR(255) NOT NULL,
    issue_reason VARCHAR(255),
    issue_reason_ar VARCHAR(255),
    reference_number VARCHAR(100),
    issued_by VARCHAR(255),
    issued_by_ar VARCHAR(255),
    notes TEXT,
    notes_ar TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOM REPORTS
-- =====================================================

-- Custom Reports Table
CREATE TABLE custom_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    report_type VARCHAR(50) NOT NULL,
    report_type_ar VARCHAR(50) NOT NULL,
    filters JSONB,
    columns JSONB,
    created_by VARCHAR(255),
    created_by_ar VARCHAR(255),
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Product indexes
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_group ON products(main_group_id, sub_group_id);
CREATE INDEX idx_products_status ON products(status);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_stock_level ON inventory(available_quantity);

-- Stock movements indexes
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

-- Stocktaking indexes
CREATE INDEX idx_stocktaking_warehouse ON stocktaking(warehouse_id);
CREATE INDEX idx_stocktaking_status ON stocktaking(status);
CREATE INDEX idx_stocktaking_date ON stocktaking(stocktaking_date);

-- Barcode indexes
CREATE INDEX idx_barcodes_product ON barcodes(product_id);
CREATE INDEX idx_barcodes_value ON barcodes(barcode_value);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update inventory after stock movement
CREATE OR REPLACE FUNCTION update_inventory_after_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'IN' THEN
        UPDATE inventory 
        SET available_quantity = available_quantity + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
    ELSIF NEW.movement_type = 'OUT' THEN
        UPDATE inventory 
        SET available_quantity = available_quantity - NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock movements
CREATE TRIGGER trigger_update_inventory
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_after_movement();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER trigger_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Inventory Summary View
CREATE VIEW inventory_summary AS
SELECT 
    i.id,
    i.product_id,
    p.product_name,
    p.product_name_ar,
    p.product_code,
    i.warehouse_id,
    w.warehouse_name,
    w.warehouse_name_ar,
    i.available_quantity,
    i.reserved_quantity,
    i.minimum_stock_level,
    i.maximum_stock_level,
    i.reorder_point,
    CASE 
        WHEN i.available_quantity <= i.reorder_point THEN 'LOW_STOCK'
        WHEN i.available_quantity >= i.maximum_stock_level THEN 'OVERSTOCK'
        ELSE 'IN_STOCK'
    END as stock_status,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id;

-- Stock Movement Summary View
CREATE VIEW stock_movement_summary AS
SELECT 
    sm.id,
    sm.product_id,
    p.product_name,
    p.product_name_ar,
    sm.warehouse_id,
    w.warehouse_name,
    w.warehouse_name_ar,
    sm.movement_type,
    sm.quantity,
    sm.unit_price,
    sm.reference_number,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample units of measurement
INSERT INTO units_of_measurement (unit_name, unit_name_ar, unit_symbol, unit_symbol_ar, unit_type) VALUES
('Piece', 'قطعة', 'pcs', 'قطعة', 'COUNT'),
('Kilogram', 'كيلوغرام', 'kg', 'كغ', 'WEIGHT'),
('Liter', 'لتر', 'L', 'لتر', 'VOLUME'),
('Meter', 'متر', 'm', 'م', 'LENGTH'),
('Square Meter', 'متر مربع', 'm²', 'م²', 'AREA');

-- Insert sample main groups
INSERT INTO main_groups (group_name, group_name_ar, description, description_ar) VALUES
('Kitchenware', 'أدوات المطبخ', 'Kitchen and dining products', 'منتجات المطبخ والطعام'),
('Storage', 'التخزين', 'Storage and organization products', 'منتجات التخزين والتنظيم'),
('Packaging', 'التعبئة', 'Packaging materials', 'مواد التعبئة');

-- Insert sample sub groups
INSERT INTO sub_groups (main_group_id, sub_group_name, sub_group_name_ar, description, description_ar) VALUES
(1, 'Cups', 'أكواب', 'Drinking cups and mugs', 'أكواب الشرب والكؤوس'),
(1, 'Plates', 'أطباق', 'Dining plates and dishes', 'أطباق الطعام والأواني'),
(2, 'Boxes', 'صناديق', 'Storage boxes and containers', 'صناديق التخزين والحاويات'),
(3, 'Bags', 'أكياس', 'Plastic bags and pouches', 'أكياس بلاستيكية وحقائب');

-- Insert sample colors
INSERT INTO colors (color_name, color_name_ar, color_code) VALUES
('White', 'أبيض', '#FFFFFF'),
('Black', 'أسود', '#000000'),
('Red', 'أحمر', '#FF0000'),
('Blue', 'أزرق', '#0000FF'),
('Green', 'أخضر', '#00FF00'),
('Yellow', 'أصفر', '#FFFF00'),
('Transparent', 'شفاف', '#FFFFFF');

-- Insert sample materials
INSERT INTO materials (material_name, material_name_ar, material_type, material_type_ar, description, description_ar) VALUES
('Polypropylene', 'البولي بروبيلين', 'Plastic', 'بلاستيك', 'PP plastic material', 'مادة بلاستيكية PP'),
('Polyethylene', 'البولي إيثيلين', 'Plastic', 'بلاستيك', 'PE plastic material', 'مادة بلاستيكية PE'),
('Polystyrene', 'البولي ستايرين', 'Plastic', 'بلاستيك', 'PS plastic material', 'مادة بلاستيكية PS');

-- Insert sample warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, manager_name, manager_name_ar, contact_phone, capacity) VALUES
('Factory Warehouse', 'مستودع المصنع', 'Baghdad Industrial Zone', 'المنطقة الصناعية بغداد', 'Ahmed Ali', 'أحمد علي', '+964-1-234-5678', 10000.00),
('Cairo Distribution Warehouse', 'مستودع التوزيع بالقاهرة', 'Cairo, Egypt', 'القاهرة، مصر', 'Mohamed Hassan', 'محمد حسن', '+20-2-345-6789', 5000.00),
('Alexandria Warehouse', 'مستودع الإسكندرية', 'Alexandria, Egypt', 'الإسكندرية، مصر', 'Omar Ibrahim', 'عمر إبراهيم', '+20-3-456-7890', 3000.00);

-- Insert sample products
INSERT INTO products (product_name, product_name_ar, product_code, main_group_id, sub_group_id, color_id, material_id, unit_of_measurement_id, description, description_ar, weight, dimensions) VALUES
('White Plastic Cup 200ml', 'كوب بلاستيك أبيض 200مل', 'CUP-WH-200', 1, 1, 1, 1, 1, '200ml white plastic cup', 'كوب بلاستيك أبيض 200مل', 0.010, '200ml'),
('Red Plastic Plate 25cm', 'طبق بلاستيك أحمر 25سم', 'PLATE-RED-25', 1, 2, 3, 1, 1, '25cm red plastic plate', 'طبق بلاستيك أحمر 25سم', 0.050, '25cm'),
('Blue Storage Box 50L', 'صندوق تخزين أزرق 50لتر', 'BOX-BLUE-50L', 2, 3, 4, 2, 1, '50L blue storage box', 'صندوق تخزين أزرق 50لتر', 0.500, '50L'),
('Transparent Plastic Bag', 'كيس بلاستيك شفاف', 'BAG-TRANS', 3, 4, 7, 3, 1, 'Transparent plastic bag', 'كيس بلاستيك شفاف', 0.005, 'Standard');

-- Insert sample inventory
INSERT INTO inventory (product_id, warehouse_id, available_quantity, minimum_stock_level, maximum_stock_level, reorder_point) VALUES
(1, 1, 1000, 100, 2000, 200),
(2, 1, 500, 50, 1000, 100),
(3, 2, 200, 20, 500, 50),
(4, 3, 10000, 1000, 20000, 2000);

-- Insert sample product costs
INSERT INTO product_costs (product_id, cost_price, cost_date, supplier, notes) VALUES
(1, 0.50, CURRENT_DATE, 'Plastic Supplier Co.', 'Bulk purchase discount applied'),
(2, 1.00, CURRENT_DATE, 'Plastic Supplier Co.', 'Standard pricing'),
(3, 5.00, CURRENT_DATE, 'Storage Solutions Ltd.', 'Premium quality material'),
(4, 0.05, CURRENT_DATE, 'Bag Manufacturing Inc.', 'Economy grade bags');

-- Insert sample product prices
INSERT INTO product_prices (product_id, selling_price, price_date, currency, notes) VALUES
(1, 1.00, CURRENT_DATE, 'IQD', 'Retail price for 200ml cups'),
(2, 2.00, CURRENT_DATE, 'IQD', 'Premium plate pricing'),
(3, 10.00, CURRENT_DATE, 'IQD', 'High-quality storage box'),
(4, 0.10, CURRENT_DATE, 'IQD', 'Standard bag pricing');

-- Insert sample stock movements with Arabic support
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, movement_type_ar, quantity, unit_price, reference_number, reference_type, reference_type_ar, notes, notes_ar, created_by, created_by_ar) VALUES
(1, 1, 'IN', 'وارد', 1000, 0.50, 'PO-2024-001', 'PURCHASE_ORDER', 'أمر شراء', 'Initial stock receipt', 'استلام المخزون الأولي', 'Ahmed Ali', 'أحمد علي'),
(2, 1, 'IN', 'وارد', 500, 1.00, 'PO-2024-002', 'PURCHASE_ORDER', 'أمر شراء', 'Bulk plate order', 'طلب أطباق بالجملة', 'Ahmed Ali', 'أحمد علي'),
(3, 2, 'IN', 'وارد', 200, 5.00, 'PO-2024-003', 'PURCHASE_ORDER', 'أمر شراء', 'Storage boxes delivery', 'توصيل صناديق التخزين', 'Mohamed Hassan', 'محمد حسن'),
(4, 3, 'IN', 'وارد', 10000, 0.05, 'PO-2024-004', 'PURCHASE_ORDER', 'أمر شراء', 'Plastic bags shipment', 'شحنة الأكياس البلاستيكية', 'Omar Ibrahim', 'عمر إبراهيم');

-- Insert sample barcodes with Arabic support
INSERT INTO barcodes (product_id, barcode_value, barcode_type, barcode_type_ar, quantity, notes, notes_ar) VALUES
(1, 'CUP-WH-200-001', 'CODE128', 'كود 128', 1, 'White cup barcode', 'باركود الكوب الأبيض'),
(2, 'PLATE-RED-25-001', 'QR_CODE', 'كود QR', 1, 'Red plate QR code', 'كود QR للطبق الأحمر'),
(3, 'BOX-BLUE-50L-001', 'EAN13', 'EAN13', 1, 'Blue box barcode', 'باركود الصندوق الأزرق'),
(4, 'BAG-TRANS-001', 'CODE128', 'كود 128', 100, 'Transparent bag batch', 'دفعة الأكياس الشفافة');

-- Insert sample consignment stock
INSERT INTO consignment_stock (product_id, warehouse_id, consignee_name, consignee_name_ar, quantity, consignment_date, expected_return_date, status, status_ar, notes, notes_ar) VALUES
(1, 1, 'Cairo Restaurant Chain', 'سلسلة مطاعم القاهرة', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 'نشط', 'Consignment for restaurant chain', 'وكالة لسلسلة المطاعم'),
(2, 2, 'Alexandria Catering', 'خدمات الطعام بالإسكندرية', 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'ACTIVE', 'نشط', 'Catering service consignment', 'وكالة خدمات الطعام');

-- Insert sample damaged goods
INSERT INTO damaged_goods (product_id, warehouse_id, quantity, damage_type, damage_type_ar, reason, reason_ar, reported_by, reported_by_ar, status, status_ar) VALUES
(1, 1, 10, 'CRACKED', 'مكسور', 'Transportation damage during delivery', 'تلف أثناء النقل خلال التوصيل', 'Warehouse Staff', 'موظف المستودع', 'REPORTED', 'تم الإبلاغ'),
(2, 2, 5, 'DENTED', 'مبعوج', 'Improper storage handling', 'التعامل غير السليم مع التخزين', 'Quality Control', 'مراقبة الجودة', 'INVESTIGATED', 'قيد التحقيق');

-- Insert sample expiry items
INSERT INTO expiry_items (product_id, warehouse_id, quantity, expiry_date, batch_number, status, status_ar, notes, notes_ar) VALUES
(1, 1, 100, CURRENT_DATE + INTERVAL '90 days', 'BATCH-2024-001', 'ACTIVE', 'نشط', 'First batch of cups', 'الدفعة الأولى من الأكواب'),
(2, 2, 50, CURRENT_DATE + INTERVAL '120 days', 'BATCH-2024-002', 'ACTIVE', 'نشط', 'Premium plate batch', 'دفعة الأطباق المميزة');

-- Insert sample serial numbers
INSERT INTO serial_numbers (product_id, serial_number, status, status_ar, assigned_to, assigned_to_ar, notes, notes_ar) VALUES
(3, 'SN-BOX-001', 'AVAILABLE', 'متاح', NULL, NULL, 'Available for assignment', 'متاح للتعيين'),
(3, 'SN-BOX-002', 'ASSIGNED', 'معين', 'Customer ABC', 'العميل ABC', 'Assigned to customer', 'معين للعميل'),
(3, 'SN-BOX-003', 'SOLD', 'مباع', 'Customer XYZ', 'العميل XYZ', 'Sold to customer', 'مباع للعميل');

-- Insert sample aging items
INSERT INTO aging_items (product_id, warehouse_id, quantity, days_in_stock, age_category, age_category_ar, last_movement_date, notes, notes_ar) VALUES
(1, 1, 200, 30, 'NEW', 'جديد', CURRENT_DATE - INTERVAL '30 days', 'Recently received stock', 'مخزون مستلم حديثاً'),
(2, 2, 100, 90, 'RECENT', 'حديث', CURRENT_DATE - INTERVAL '90 days', 'Recent stock movement', 'حركة مخزون حديثة'),
(3, 3, 50, 180, 'AGING', 'متقادم', CURRENT_DATE - INTERVAL '180 days', 'Aging inventory', 'مخزون متقادم');

-- Insert sample stock analysis
INSERT INTO stock_analysis (product_id, analysis_date, total_in, total_out, net_movement, current_stock, turnover_rate, analysis_notes, analysis_notes_ar) VALUES
(1, CURRENT_DATE, 1000, 200, 800, 800, 0.25, 'Good turnover rate for cups', 'معدل دوران جيد للأكواب'),
(2, CURRENT_DATE, 500, 100, 400, 400, 0.20, 'Moderate turnover for plates', 'معدل دوران متوسط للأطباق'),
(3, CURRENT_DATE, 200, 50, 150, 150, 0.33, 'High turnover for storage boxes', 'معدل دوران عالي لصناديق التخزين');

-- Insert sample valuation items
INSERT INTO valuation_items (product_id, warehouse_id, available_quantity, unit_cost, total_value, valuation_date, valuation_method, valuation_method_ar, notes, notes_ar) VALUES
(1, 1, 800, 0.50, 400.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation method', 'طريقة تقييم أول وارد أول صادر'),
(2, 2, 400, 1.00, 400.00, CURRENT_DATE, 'AVERAGE', 'متوسط التكلفة', 'Average cost method', 'طريقة متوسط التكلفة'),
(3, 3, 150, 5.00, 750.00, CURRENT_DATE, 'STANDARD', 'التكلفة المعيارية', 'Standard cost valuation', 'تقييم التكلفة المعيارية');

-- Insert sample issued items
INSERT INTO issued_items (product_id, warehouse_id, quantity, issued_to, issued_to_ar, issue_reason, issue_reason_ar, reference_number, issued_by, issued_by_ar, notes, notes_ar) VALUES
(1, 1, 50, 'Production Department', 'قسم الإنتاج', 'PRODUCTION_USE', 'استخدام إنتاجي', 'ISSUE-2024-001', 'Warehouse Manager', 'مدير المستودع', 'Issued for production line', 'صرف لخط الإنتاج'),
(2, 2, 25, 'Quality Control', 'مراقبة الجودة', 'QUALITY_TESTING', 'اختبار الجودة', 'ISSUE-2024-002', 'QC Manager', 'مدير مراقبة الجودة', 'For quality testing', 'لاختبار الجودة'),
(3, 3, 10, 'Maintenance Department', 'قسم الصيانة', 'MAINTENANCE', 'صيانة', 'ISSUE-2024-003', 'Maintenance Supervisor', 'مشرف الصيانة', 'For maintenance work', 'لأعمال الصيانة');

-- Insert sample custom reports
INSERT INTO custom_reports (report_name, report_name_ar, description, description_ar, report_type, report_type_ar, created_by, created_by_ar, notes, notes_ar) VALUES
('Monthly Stock Report', 'تقرير المخزون الشهري', 'Monthly inventory summary report', 'تقرير ملخص المخزون الشهري', 'INVENTORY', 'مخزون', 'Admin', 'مدير النظام', 'Custom monthly report', 'تقرير شهري مخصص'),
('Product Performance Analysis', 'تحليل أداء المنتجات', 'Analysis of product performance metrics', 'تحليل مؤشرات أداء المنتجات', 'ANALYTICS', 'تحليلات', 'Analyst', 'محلل', 'Performance tracking report', 'تقرير تتبع الأداء'),
('Warehouse Utilization Report', 'تقرير استغلال المستودعات', 'Warehouse capacity and utilization report', 'تقرير سعة واستغلال المستودعات', 'WAREHOUSE', 'مستودع', 'Operations Manager', 'مدير العمليات', 'Capacity planning report', 'تقرير تخطيط السعة');

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE warehouses IS 'Warehouse locations and management information';
COMMENT ON TABLE products IS 'Product catalog with Arabic and English names';
COMMENT ON TABLE inventory IS 'Current stock levels per warehouse';
COMMENT ON TABLE stock_movements IS 'All stock movements and transactions';
COMMENT ON TABLE stocktaking IS 'Physical inventory counting operations';
COMMENT ON TABLE barcodes IS 'Generated barcodes for products';
COMMENT ON TABLE consignment_stock IS 'Stock held on consignment';
COMMENT ON TABLE damaged_goods IS 'Damaged inventory tracking';
COMMENT ON TABLE expiry_items IS 'Items with expiry dates';
COMMENT ON TABLE serial_numbers IS 'Serial number tracking for products';
COMMENT ON TABLE custom_reports IS 'User-defined custom reports';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
