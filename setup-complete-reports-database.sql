-- Complete Reports Database Setup
-- This script creates all necessary tables for the reports system to work properly

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
    unit_cost DECIMAL(15,4) NOT NULL,
    total_value DECIMAL(15,4) NOT NULL,
    valuation_date DATE NOT NULL,
    valuation_method VARCHAR(50) DEFAULT 'FIFO',
    valuation_method_ar VARCHAR(50) DEFAULT 'أول وارد أول صادر',
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

-- Issued Items Table
CREATE TABLE IF NOT EXISTS issued_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    issued_to VARCHAR(255) NOT NULL,
    issued_to_ar VARCHAR(255),
    issued_quantity DECIMAL(15,4) NOT NULL,
    issued_date DATE NOT NULL,
    issued_by VARCHAR(255) NOT NULL,
    issued_by_ar VARCHAR(255),
    department VARCHAR(100),
    department_ar VARCHAR(100),
    purpose TEXT,
    purpose_ar TEXT,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'RETURNED', 'PARTIAL_RETURN')),
    status_ar VARCHAR(20) DEFAULT 'مصروف',
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Monitoring Table
CREATE TABLE IF NOT EXISTS product_monitoring (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    monitoring_date DATE NOT NULL,
    stock_level DECIMAL(15,4) NOT NULL,
    movement_count INTEGER DEFAULT 0,
    last_movement_date DATE,
    average_daily_consumption DECIMAL(15,4) DEFAULT 0,
    reorder_point DECIMAL(15,4),
    max_stock_level DECIMAL(15,4),
    monitoring_notes TEXT,
    monitoring_notes_ar TEXT,
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
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial_number ON serial_numbers (serial_number);

-- Aging Items Indexes
CREATE INDEX IF NOT EXISTS idx_aging_items_product_id ON aging_items (product_id);
CREATE INDEX IF NOT EXISTS idx_aging_items_warehouse_id ON aging_items (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_aging_items_age_category ON aging_items (age_category);
CREATE INDEX IF NOT EXISTS idx_aging_items_days_in_stock ON aging_items (days_in_stock);

-- Stock Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_stock_analysis_product_id ON stock_analysis (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_analysis_date ON stock_analysis (analysis_date);

-- Valuation Items Indexes
CREATE INDEX IF NOT EXISTS idx_valuation_items_product_id ON valuation_items (product_id);
CREATE INDEX IF NOT EXISTS idx_valuation_items_warehouse_id ON valuation_items (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_valuation_items_valuation_date ON valuation_items (valuation_date);

-- Expiry Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_product_id ON expiry_tracking (product_id);
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_warehouse_id ON expiry_tracking (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_expiry_date ON expiry_tracking (expiry_date);
CREATE INDEX IF NOT EXISTS idx_expiry_tracking_status ON expiry_tracking (status);

-- Issued Items Indexes
CREATE INDEX IF NOT EXISTS idx_issued_items_product_id ON issued_items (product_id);
CREATE INDEX IF NOT EXISTS idx_issued_items_warehouse_id ON issued_items (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_issued_items_issued_date ON issued_items (issued_date);
CREATE INDEX IF NOT EXISTS idx_issued_items_status ON issued_items (status);

-- Product Monitoring Indexes
CREATE INDEX IF NOT EXISTS idx_product_monitoring_product_id ON product_monitoring (product_id);
CREATE INDEX IF NOT EXISTS idx_product_monitoring_warehouse_id ON product_monitoring (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_product_monitoring_date ON product_monitoring (monitoring_date);

-- Custom Reports Indexes
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON custom_reports (created_by);
CREATE INDEX IF NOT EXISTS idx_custom_reports_type ON custom_reports (report_type);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample serial numbers
INSERT INTO serial_numbers (product_id, warehouse_id, serial_number, status, status_ar, notes, notes_ar) VALUES
(1, 1, 'SN001-001', 'ACTIVE', 'نشط', 'New product serial', 'رقم تسلسلي جديد'),
(1, 1, 'SN001-002', 'ACTIVE', 'نشط', 'New product serial', 'رقم تسلسلي جديد'),
(2, 1, 'SN002-001', 'SOLD', 'مباع', 'Sold to customer', 'مباع للعميل'),
(2, 1, 'SN002-002', 'ACTIVE', 'نشط', 'Available for sale', 'متاح للبيع'),
(3, 2, 'SN003-001', 'DAMAGED', 'تالف', 'Damaged during transport', 'تالف أثناء النقل')
ON CONFLICT (serial_number) DO NOTHING;

-- Insert sample aging items
INSERT INTO aging_items (product_id, warehouse_id, quantity, days_in_stock, age_category, age_category_ar, last_movement_date, notes, notes_ar) VALUES
(1, 1, 100.00, 5, 'NEW', 'جديد', CURRENT_DATE - INTERVAL '5 days', 'Recently received', 'تم استلامه مؤخراً'),
(1, 1, 50.00, 30, 'RECENT', 'حديث', CURRENT_DATE - INTERVAL '30 days', 'Good turnover', 'دوران جيد'),
(2, 1, 25.00, 90, 'AGING', 'متقادم', CURRENT_DATE - INTERVAL '90 days', 'Slow moving', 'بطيء الحركة'),
(2, 1, 10.00, 180, 'OLD', 'قديم', CURRENT_DATE - INTERVAL '180 days', 'Very slow moving', 'بطيء جداً'),
(3, 2, 75.00, 15, 'NEW', 'جديد', CURRENT_DATE - INTERVAL '15 days', 'Fast moving', 'سريع الحركة')
ON CONFLICT DO NOTHING;

-- Insert sample stock analysis
INSERT INTO stock_analysis (product_id, analysis_date, total_in, total_out, net_movement, current_stock, turnover_rate, analysis_notes, analysis_notes_ar) VALUES
(1, CURRENT_DATE, 500.00, 400.00, 100.00, 150.00, 2.67, 'Good turnover rate', 'معدل دوران جيد'),
(2, CURRENT_DATE, 200.00, 150.00, 50.00, 35.00, 4.29, 'High turnover rate', 'معدل دوران عالي'),
(3, CURRENT_DATE, 300.00, 250.00, 50.00, 75.00, 3.33, 'Moderate turnover', 'دوران معتدل'),
(4, CURRENT_DATE, 100.00, 80.00, 20.00, 20.00, 4.00, 'Steady movement', 'حركة ثابتة'),
(5, CURRENT_DATE, 150.00, 120.00, 30.00, 30.00, 4.00, 'Consistent sales', 'مبيعات ثابتة')
ON CONFLICT DO NOTHING;

-- Insert sample valuation items
INSERT INTO valuation_items (product_id, warehouse_id, quantity, unit_cost, total_value, valuation_date, valuation_method, valuation_method_ar, notes, notes_ar) VALUES
(1, 1, 150.00, 25.50, 3825.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation', 'تقييم أول وارد أول صادر'),
(2, 1, 35.00, 45.00, 1575.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation', 'تقييم أول وارد أول صادر'),
(3, 2, 75.00, 30.00, 2250.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation', 'تقييم أول وارد أول صادر'),
(4, 1, 20.00, 15.00, 300.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation', 'تقييم أول وارد أول صادر'),
(5, 2, 30.00, 20.00, 600.00, CURRENT_DATE, 'FIFO', 'أول وارد أول صادر', 'FIFO valuation', 'تقييم أول وارد أول صادر')
ON CONFLICT DO NOTHING;

-- Insert sample expiry tracking
INSERT INTO expiry_tracking (product_id, warehouse_id, batch_number, expiry_date, quantity, days_until_expiry, status, status_ar) VALUES
(1, 1, 'BATCH001', CURRENT_DATE + INTERVAL '30 days', 50.00, 30, 'GOOD', 'جيد'),
(1, 1, 'BATCH002', CURRENT_DATE + INTERVAL '15 days', 25.00, 15, 'WARNING', 'تحذير'),
(2, 1, 'BATCH003', CURRENT_DATE + INTERVAL '60 days', 30.00, 60, 'GOOD', 'جيد'),
(3, 2, 'BATCH004', CURRENT_DATE + INTERVAL '7 days', 20.00, 7, 'CRITICAL', 'حرج'),
(4, 1, 'BATCH005', CURRENT_DATE + INTERVAL '45 days', 15.00, 45, 'GOOD', 'جيد')
ON CONFLICT DO NOTHING;

-- Insert sample issued items
INSERT INTO issued_items (product_id, warehouse_id, issued_to, issued_to_ar, issued_quantity, issued_date, issued_by, issued_by_ar, department, department_ar, purpose, purpose_ar, status, status_ar, notes, notes_ar) VALUES
(1, 1, 'Production Department', 'قسم الإنتاج', 25.00, CURRENT_DATE - INTERVAL '5 days', 'John Smith', 'جون سميث', 'Production', 'الإنتاج', 'Manufacturing process', 'عملية التصنيع', 'ISSUED', 'مصروف', 'For production line', 'لخط الإنتاج'),
(2, 1, 'Maintenance Department', 'قسم الصيانة', 10.00, CURRENT_DATE - INTERVAL '3 days', 'Jane Doe', 'جين دو', 'Maintenance', 'الصيانة', 'Equipment maintenance', 'صيانة المعدات', 'ISSUED', 'مصروف', 'Regular maintenance', 'صيانة دورية'),
(3, 2, 'Quality Control', 'مراقبة الجودة', 15.00, CURRENT_DATE - INTERVAL '7 days', 'Mike Johnson', 'مايك جونسون', 'Quality', 'الجودة', 'Quality testing', 'اختبار الجودة', 'RETURNED', 'مُرجع', 'Testing completed', 'تم الانتهاء من الاختبار'),
(4, 1, 'Research & Development', 'البحث والتطوير', 5.00, CURRENT_DATE - INTERVAL '2 days', 'Sarah Wilson', 'سارة ويلسون', 'R&D', 'البحث والتطوير', 'Product development', 'تطوير المنتج', 'ISSUED', 'مصروف', 'New product testing', 'اختبار منتج جديد'),
(5, 2, 'Sales Department', 'قسم المبيعات', 8.00, CURRENT_DATE - INTERVAL '1 day', 'David Brown', 'ديفيد براون', 'Sales', 'المبيعات', 'Customer samples', 'عينات العملاء', 'ISSUED', 'مصروف', 'Customer presentation', 'عرض للعميل')
ON CONFLICT DO NOTHING;

-- Insert sample product monitoring
INSERT INTO product_monitoring (product_id, warehouse_id, monitoring_date, stock_level, movement_count, last_movement_date, average_daily_consumption, reorder_point, max_stock_level, monitoring_notes, monitoring_notes_ar) VALUES
(1, 1, CURRENT_DATE, 150.00, 5, CURRENT_DATE - INTERVAL '1 day', 10.00, 50.00, 200.00, 'Good stock level', 'مستوى مخزون جيد'),
(2, 1, CURRENT_DATE, 35.00, 3, CURRENT_DATE - INTERVAL '2 days', 5.00, 20.00, 100.00, 'Moderate movement', 'حركة معتدلة'),
(3, 2, CURRENT_DATE, 75.00, 8, CURRENT_DATE - INTERVAL '1 day', 15.00, 30.00, 150.00, 'High movement', 'حركة عالية'),
(4, 1, CURRENT_DATE, 20.00, 2, CURRENT_DATE - INTERVAL '3 days', 3.00, 15.00, 50.00, 'Low movement', 'حركة منخفضة'),
(5, 2, CURRENT_DATE, 30.00, 4, CURRENT_DATE - INTERVAL '1 day', 8.00, 25.00, 80.00, 'Steady movement', 'حركة ثابتة')
ON CONFLICT DO NOTHING;

-- Insert sample custom reports
INSERT INTO custom_reports (report_name, report_name_ar, report_description, report_description_ar, report_type, report_config, created_by, created_by_ar) VALUES
('Monthly Stock Report', 'تقرير المخزون الشهري', 'Monthly stock movement analysis', 'تحليل حركة المخزون الشهرية', 'CUSTOM', '{"tables": ["inventory", "products"], "fields": {"inventory": ["available_quantity", "minimum_stock_level"], "products": ["product_name", "product_code"]}, "filters": [], "sorting": [{"field": "products.product_name", "direction": "ASC"}]}', 'admin', 'مدير'),
('Product Performance', 'أداء المنتج', 'Product sales and movement analysis', 'تحليل مبيعات وحركة المنتج', 'CUSTOM', '{"tables": ["products", "stock_movements"], "fields": {"products": ["product_name", "sales_price"], "stock_movements": ["quantity", "movement_type"]}, "filters": [{"field": "stock_movements.movement_type", "operator": "=", "value": "OUT"}], "sorting": [{"field": "products.product_name", "direction": "ASC"}]}', 'admin', 'مدير')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Complete reports database setup completed successfully!' as status;

