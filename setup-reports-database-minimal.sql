-- Minimal Reports Database Setup
-- This script creates all necessary tables for the reports system
-- without any foreign key dependencies

-- =====================================================
-- REPORTS SYSTEM TABLES
-- =====================================================

-- Serial Numbers Table
CREATE TABLE IF NOT EXISTS serial_numbers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SOLD', 'DAMAGED')),
    status_ar VARCHAR(20) DEFAULT 'نشط',
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aging Items Table
CREATE TABLE IF NOT EXISTS aging_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    days_in_stock INTEGER NOT NULL,
    age_category VARCHAR(20) NOT NULL CHECK (age_category IN ('NEW', 'RECENT', 'AGING', 'OLD')),
    age_category_ar VARCHAR(20) NOT NULL,
    last_movement_date DATE,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Analysis Table
CREATE TABLE IF NOT EXISTS stock_analysis (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    analysis_date DATE NOT NULL,
    total_in DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_out DECIMAL(15,4) NOT NULL DEFAULT 0,
    net_movement DECIMAL(15,4) NOT NULL DEFAULT 0,
    current_stock DECIMAL(15,4) NOT NULL DEFAULT 0,
    turnover_rate DECIMAL(5,2),
    analysis_notes TEXT,
    analysis_notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Valuation Items Table
CREATE TABLE IF NOT EXISTS valuation_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2),
    valuation_date DATE NOT NULL,
    valuation_method VARCHAR(50) DEFAULT 'FIFO',
    valuation_method_ar VARCHAR(50) DEFAULT 'أول وارد أول صادر',
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consignment Items Table
CREATE TABLE IF NOT EXISTS consignment_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    consignment_quantity DECIMAL(15,4) NOT NULL,
    consignment_value DECIMAL(15,2) NOT NULL,
    consignment_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (consignment_status IN ('ACTIVE', 'RETURNED', 'SOLD')),
    consignment_status_ar VARCHAR(20) DEFAULT 'نشط',
    consignment_date DATE NOT NULL,
    return_date DATE,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Damaged Goods Table
CREATE TABLE IF NOT EXISTS damaged_goods (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    damage_quantity DECIMAL(15,4) NOT NULL,
    damage_reason VARCHAR(100) NOT NULL,
    damage_reason_ar VARCHAR(100) NOT NULL,
    damage_value DECIMAL(15,2) NOT NULL,
    damage_date DATE NOT NULL,
    reported_by VARCHAR(255),
    reported_by_ar VARCHAR(255),
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expiry Tracking Table
CREATE TABLE IF NOT EXISTS expiry_tracking (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    days_until_expiry INTEGER,
    status VARCHAR(20),
    status_ar VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Reports Table
CREATE TABLE IF NOT EXISTS custom_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_name_ar VARCHAR(255),
    report_description TEXT,
    report_description_ar TEXT,
    report_type VARCHAR(50) DEFAULT 'CUSTOM',
    report_config JSONB NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_by_ar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Serial Numbers Indexes
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product_id ON serial_numbers (product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_warehouse_id ON serial_numbers (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers (status);

-- Aging Items Indexes
CREATE INDEX IF NOT EXISTS idx_aging_items_product_id ON aging_items (product_id);
CREATE INDEX IF NOT EXISTS idx_aging_items_warehouse_id ON aging_items (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_aging_items_age_category ON aging_items (age_category);

-- Stock Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_stock_analysis_product_id ON stock_analysis (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_analysis_date ON stock_analysis (analysis_date);

-- Valuation Items Indexes
CREATE INDEX IF NOT EXISTS idx_valuation_items_product_id ON valuation_items (product_id);
CREATE INDEX IF NOT EXISTS idx_valuation_items_warehouse_id ON valuation_items (warehouse_id);

-- Consignment Items Indexes
CREATE INDEX IF NOT EXISTS idx_consignment_items_product_id ON consignment_items (product_id);
CREATE INDEX IF NOT EXISTS idx_consignment_items_warehouse_id ON consignment_items (warehouse_id);

-- Damaged Goods Indexes
CREATE INDEX IF NOT EXISTS idx_damaged_goods_product_id ON damaged_goods (product_id);
CREATE INDEX IF NOT EXISTS idx_damaged_goods_warehouse_id ON damaged_goods (warehouse_id);

-- Expiry Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_product_id ON expiry_tracking (product_id);
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_warehouse_id ON expiry_tracking (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_expiry_date ON expiry_tracking (expiry_date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aging_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE damaged_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Allow authenticated users to manage serial_numbers" ON serial_numbers FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage aging_items" ON aging_items FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage stock_analysis" ON stock_analysis FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage valuation_items" ON valuation_items FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage consignment_items" ON consignment_items FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage damaged_goods" ON damaged_goods FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage expiry_tracking" ON expiry_tracking FOR ALL TO authenticated;
CREATE POLICY "Allow authenticated users to manage custom_reports" ON custom_reports FOR ALL TO authenticated;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample serial numbers (using hardcoded IDs)
INSERT INTO serial_numbers (product_id, warehouse_id, serial_number, status, notes) VALUES
(1, 1, 'SN001', 'ACTIVE', 'Sample serial number 1'),
(1, 1, 'SN002', 'ACTIVE', 'Sample serial number 2');

-- Insert sample aging items
INSERT INTO aging_items (product_id, warehouse_id, quantity, days_in_stock, age_category, age_category_ar) VALUES
(1, 1, 100, 30, 'NEW', 'جديد'),
(1, 1, 50, 90, 'AGING', 'متقادم');

-- Insert sample stock analysis
INSERT INTO stock_analysis (product_id, analysis_date, total_in, total_out, net_movement, current_stock, turnover_rate) VALUES
(1, CURRENT_DATE, 1000, 800, 200, 200, 4.0);

-- Insert sample valuation items
INSERT INTO valuation_items (product_id, warehouse_id, quantity, unit_cost, total_value, valuation_date) VALUES
(1, 1, 100, 10.50, 1050.00, CURRENT_DATE);

-- Insert sample consignment items
INSERT INTO consignment_items (product_id, warehouse_id, consignment_quantity, consignment_value, consignment_date) VALUES
(1, 1, 50, 525.00, CURRENT_DATE);

-- Insert sample damaged goods
INSERT INTO damaged_goods (product_id, warehouse_id, damage_quantity, damage_reason, damage_reason_ar, damage_value, damage_date) VALUES
(1, 1, 5, 'Water damage', 'تلف بالماء', 52.50, CURRENT_DATE);

-- Insert sample expiry tracking
INSERT INTO expiry_tracking (product_id, warehouse_id, batch_number, expiry_date, quantity, days_until_expiry, status, status_ar) VALUES
(1, 1, 'BATCH001', CURRENT_DATE + INTERVAL '30 days', 100, 30, 'EXPIRING_SOON', 'ينتهي قريباً');

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Reports Database Setup Complete!' as status;

-- Show table counts
SELECT 
    'serial_numbers' as table_name, 
    COUNT(*) as record_count 
FROM serial_numbers
UNION ALL
SELECT 'aging_items', COUNT(*) FROM aging_items
UNION ALL
SELECT 'stock_analysis', COUNT(*) FROM stock_analysis
UNION ALL
SELECT 'valuation_items', COUNT(*) FROM valuation_items
UNION ALL
SELECT 'consignment_items', COUNT(*) FROM consignment_items
UNION ALL
SELECT 'damaged_goods', COUNT(*) FROM damaged_goods
UNION ALL
SELECT 'expiry_tracking', COUNT(*) FROM expiry_tracking;
