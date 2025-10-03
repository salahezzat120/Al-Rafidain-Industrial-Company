-- =====================================================
-- Complete Workflow System Setup
-- =====================================================
-- This script sets up the entire workflow system with all required tables,
-- sample data, and proper relationships.

-- =====================================================
-- 1. CREATE WORKFLOW EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('PRODUCTION', 'SALES', 'DELIVERY', 'RETURN')),
    description TEXT NOT NULL,
    description_ar TEXT,
    warehouse_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reference_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE SAMPLE WAREHOUSES
-- =====================================================
-- Only insert if warehouses don't exist
INSERT INTO warehouses (
    warehouse_name, warehouse_name_ar, location, location_ar, 
    address, responsible_person, responsible_person_ar, 
    warehouse_type, capacity, contact_phone, contact_email
) 
SELECT * FROM (VALUES 
(
    'Factory Warehouse',
    'مستودع المصنع',
    'Industrial Zone',
    'المنطقة الصناعية',
    '123 Industrial Street, Industrial Zone',
    'Ahmed Ali',
    'أحمد علي',
    'PRODUCTION',
    10000,
    '+1234567890',
    'factory@company.com'
),
(
    'Distribution Warehouse',
    'مستودع التوزيع',
    'City Center',
    'وسط المدينة',
    '456 Main Street, City Center',
    'Sara Mohamed',
    'سارة محمد',
    'DISTRIBUTION',
    5000,
    '+1234567891',
    'distribution@company.com'
),
(
    'Export Warehouse',
    'مستودع التصدير',
    'Port Area',
    'منطقة الميناء',
    '789 Port Road, Port Area',
    'Omar Hassan',
    'عمر حسن',
    'EXPORT',
    8000,
    '+1234567892',
    'export@company.com'
)) AS v(warehouse_name, warehouse_name_ar, location, location_ar, address, responsible_person, responsible_person_ar, warehouse_type, capacity, contact_phone, contact_email)
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE warehouse_name = v.warehouse_name);

-- =====================================================
-- 3. CREATE SAMPLE PRODUCTS
-- =====================================================
-- Only insert if products don't exist
INSERT INTO products (
    product_name, product_name_ar, product_code, description,
    cost_price, selling_price, weight, dimensions, stock, is_active
) 
SELECT * FROM (VALUES 
(
    'White Plastic Cup',
    'كوب بلاستيك أبيض',
    'CUP-WH-200',
    '200ml white plastic cup for beverages',
    0.50,
    1.00,
    10,
    '200ml',
    0,
    true
),
(
    'Blue Plastic Bottle',
    'زجاجة بلاستيك زرقاء',
    'BOTTLE-BL-500',
    '500ml blue plastic bottle for water',
    1.20,
    2.50,
    25,
    '500ml',
    0,
    true
),
(
    'Red Plastic Plate',
    'طبق بلاستيك أحمر',
    'PLATE-RD-300',
    '300mm red plastic plate for food',
    0.80,
    1.80,
    15,
    '300mm',
    0,
    true
),
(
    'Green Plastic Container',
    'حاوية بلاستيك خضراء',
    'CONTAINER-GR-1000',
    '1000ml green plastic container for storage',
    2.00,
    4.50,
    50,
    '1000ml',
    0,
    true
),
(
    'Yellow Plastic Lid',
    'غطاء بلاستيك أصفر',
    'LID-YL-SMALL',
    'Small yellow plastic lid for containers',
    0.10,
    0.25,
    2,
    'Small',
    0,
    true
)) AS v(product_name, product_name_ar, product_code, description, cost_price, selling_price, weight, dimensions, stock, is_active)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = v.product_code);

-- =====================================================
-- 4. CREATE SAMPLE WORKFLOW EVENTS
-- =====================================================
-- Only insert if workflow events don't exist
INSERT INTO workflow_events (
    event_type, description, description_ar, warehouse_id, product_id,
    quantity, reference_number, status
) 
SELECT * FROM (VALUES 
-- Production Events
(
    'PRODUCTION',
    'New production batch completed',
    'تم إكمال دفعة إنتاج جديدة',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'CUP-WH-200' LIMIT 1),
    1000,
    'PROD-2024-001',
    'PENDING'
),
(
    'PRODUCTION',
    'Bottle production line completed',
    'تم إكمال خط إنتاج الزجاجات',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'BOTTLE-BL-500' LIMIT 1),
    500,
    'PROD-2024-002',
    'PENDING'
),
-- Sales Events
(
    'SALES',
    'Sales order processed',
    'تم معالجة طلب البيع',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Distribution Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'PLATE-RD-300' LIMIT 1),
    200,
    'SO-2024-001',
    'PENDING'
),
(
    'SALES',
    'Bulk order for export',
    'طلب بالجملة للتصدير',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Export Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'CONTAINER-GR-1000' LIMIT 1),
    100,
    'SO-2024-002',
    'PENDING'
),
-- Delivery Events
(
    'DELIVERY',
    'Delivery completed to customer',
    'تم إكمال التوصيل للعميل',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Distribution Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'CUP-WH-200' LIMIT 1),
    150,
    'DEL-2024-001',
    'PENDING'
),
(
    'DELIVERY',
    'Export shipment delivered',
    'تم تسليم شحنة التصدير',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Export Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'BOTTLE-BL-500' LIMIT 1),
    300,
    'DEL-2024-002',
    'PENDING'
),
-- Return Events
(
    'RETURN',
    'Customer return processed',
    'تم معالجة إرجاع العميل',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Distribution Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'PLATE-RD-300' LIMIT 1),
    25,
    'RET-2024-001',
    'PENDING'
),
(
    'RETURN',
    'Defective product return',
    'إرجاع منتج معيب',
    (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse' LIMIT 1),
    (SELECT id FROM products WHERE product_code = 'LID-YL-SMALL' LIMIT 1),
    50,
    'RET-2024-002',
    'PENDING'
)) AS v(event_type, description, description_ar, warehouse_id, product_id, quantity, reference_number, status)
WHERE NOT EXISTS (SELECT 1 FROM workflow_events WHERE reference_number = v.reference_number);

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workflow_events_status ON workflow_events(status);
CREATE INDEX IF NOT EXISTS idx_workflow_events_warehouse ON workflow_events(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_product ON workflow_events(product_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at ON workflow_events(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_events_reference ON workflow_events(reference_number);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on workflow_events" ON workflow_events
    FOR ALL USING (true);

-- =====================================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_workflow_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_events_updated_at
    BEFORE UPDATE ON workflow_events
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_events_updated_at();

-- =====================================================
-- 8. CREATE FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add warehouse foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workflow_events_warehouse_id_fkey'
    ) THEN
        ALTER TABLE workflow_events 
        ADD CONSTRAINT workflow_events_warehouse_id_fkey 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
    END IF;

    -- Add product foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workflow_events_product_id_fkey'
    ) THEN
        ALTER TABLE workflow_events 
        ADD CONSTRAINT workflow_events_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 9. CREATE SAMPLE INVENTORY RECORDS
-- =====================================================
-- Only insert if inventory records don't exist
INSERT INTO inventory (
    product_id, warehouse_id, available_quantity, minimum_stock_level, last_updated
) 
SELECT * FROM (VALUES 
-- Factory Warehouse inventory
(
    (SELECT id FROM products WHERE product_code = 'CUP-WH-200' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse' LIMIT 1),
    0,
    100,
    NOW()
),
(
    (SELECT id FROM products WHERE product_code = 'BOTTLE-BL-500' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Factory Warehouse' LIMIT 1),
    0,
    50,
    NOW()
),
-- Distribution Warehouse inventory
(
    (SELECT id FROM products WHERE product_code = 'PLATE-RD-300' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Distribution Warehouse' LIMIT 1),
    0,
    200,
    NOW()
),
(
    (SELECT id FROM products WHERE product_code = 'CUP-WH-200' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Distribution Warehouse' LIMIT 1),
    0,
    150,
    NOW()
),
-- Export Warehouse inventory
(
    (SELECT id FROM products WHERE product_code = 'CONTAINER-GR-1000' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Export Warehouse' LIMIT 1),
    0,
    75,
    NOW()
),
(
    (SELECT id FROM products WHERE product_code = 'BOTTLE-BL-500' LIMIT 1),
    (SELECT id FROM warehouses WHERE warehouse_name = 'Export Warehouse' LIMIT 1),
    0,
    100,
    NOW()
)) AS v(product_id, warehouse_id, available_quantity, minimum_stock_level, last_updated)
WHERE NOT EXISTS (
    SELECT 1 FROM inventory 
    WHERE product_id = v.product_id AND warehouse_id = v.warehouse_id
);

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================
-- Check that everything was created successfully
SELECT 'Workflow Events Count:' as info, COUNT(*) as count FROM workflow_events
UNION ALL
SELECT 'Warehouses Count:', COUNT(*) FROM warehouses
UNION ALL
SELECT 'Products Count:', COUNT(*) FROM products
UNION ALL
SELECT 'Inventory Records Count:', COUNT(*) FROM inventory;

-- Show sample workflow events
SELECT 
    we.event_type,
    we.description,
    w.warehouse_name,
    p.product_name,
    we.quantity,
    we.status,
    we.reference_number
FROM workflow_events we
JOIN warehouses w ON we.warehouse_id = w.id
JOIN products p ON we.product_id = p.id
ORDER BY we.created_at DESC
LIMIT 5;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Workflow System Setup Complete!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 3 Warehouses (Factory, Distribution, Export)';
    RAISE NOTICE '- 5 Products (Cup, Bottle, Plate, Container, Lid)';
    RAISE NOTICE '- 8 Workflow Events (Production, Sales, Delivery, Return)';
    RAISE NOTICE '- 6 Inventory Records';
    RAISE NOTICE '- All indexes and constraints';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'You can now use the Workflow Integration feature!';
    RAISE NOTICE '=====================================================';
END $$;
