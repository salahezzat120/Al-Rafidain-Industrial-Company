-- Complete Stock Movements Setup
-- This script creates products, warehouses, and stock movements in the correct order

-- Step 1: Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255),
    product_code VARCHAR(100),
    stock_number VARCHAR(100),
    barcode VARCHAR(100),
    main_group_id INTEGER,
    sub_group_id INTEGER,
    color_id INTEGER,
    material_id INTEGER,
    unit_of_measurement_id INTEGER,
    description TEXT,
    description_ar TEXT,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    expiry_date DATE,
    serial_number VARCHAR(100),
    warehouses TEXT,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create warehouses table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_name_ar VARCHAR(255),
    location VARCHAR(255),
    location_ar VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    responsible_person VARCHAR(255),
    responsible_person_ar VARCHAR(255),
    warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
    capacity INTEGER DEFAULT 0,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Insert sample products if none exist
INSERT INTO products (
    product_name,
    product_name_ar,
    product_code,
    stock_number,
    barcode,
    description,
    description_ar,
    cost_price,
    selling_price,
    weight,
    dimensions
) VALUES 
(
    'Plastic Container 500ml',
    'حاوية بلاستيكية 500 مل',
    'PC-500',
    'ST-001',
    '1234567890123',
    'High-quality plastic container',
    'حاوية بلاستيكية عالية الجودة',
    15.50,
    25.00,
    0.5,
    '10x10x15 cm'
),
(
    'Plastic Bottle 1L',
    'زجاجة بلاستيكية 1 لتر',
    'PB-1000',
    'ST-002',
    '1234567890124',
    'Durable plastic bottle',
    'زجاجة بلاستيكية متينة',
    20.00,
    35.00,
    0.8,
    '8x8x20 cm'
),
(
    'Plastic Bag Small',
    'كيس بلاستيكي صغير',
    'PB-SM',
    'ST-003',
    '1234567890125',
    'Small plastic bag',
    'كيس بلاستيكي صغير',
    2.00,
    5.00,
    0.1,
    '20x30 cm'
)
ON CONFLICT (product_code) DO NOTHING;

-- Step 4: Insert sample warehouses if none exist
INSERT INTO warehouses (
    warehouse_name,
    warehouse_name_ar,
    location,
    location_ar,
    address,
    responsible_person,
    responsible_person_ar,
    warehouse_type,
    capacity,
    contact_phone,
    contact_email
) VALUES 
(
    'Main Warehouse',
    'المستودع الرئيسي',
    'Baghdad, Iraq',
    'بغداد، العراق',
    'Industrial Zone, Baghdad',
    'Ahmed Ali',
    'أحمد علي',
    'DISTRIBUTION',
    10000,
    '+964-1-234-5678',
    'main@warehouse.com'
),
(
    'Secondary Warehouse',
    'المستودع الثانوي',
    'Basra, Iraq',
    'البصرة، العراق',
    'Port Area, Basra',
    'Omar Hassan',
    'عمر حسن',
    'STORAGE',
    5000,
    '+964-1-234-5679',
    'secondary@warehouse.com'
),
(
    'Production Warehouse',
    'مستودع الإنتاج',
    'Erbil, Iraq',
    'أربيل، العراق',
    'Industrial Complex, Erbil',
    'Fatima Mohammed',
    'فاطمة محمد',
    'PRODUCTION',
    8000,
    '+964-1-234-5680',
    'production@warehouse.com'
)
ON CONFLICT (warehouse_name) DO NOTHING;

-- Step 5: Drop stock_movements table if it exists to recreate
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Step 6: Create stock_movements table with minimal structure
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    movement_type_ar VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    reference_number VARCHAR(100),
    reference_number_ar VARCHAR(100),
    notes TEXT,
    notes_ar TEXT,
    created_by VARCHAR(255) DEFAULT 'System',
    created_by_ar VARCHAR(255) DEFAULT 'النظام',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Add foreign key constraints
ALTER TABLE stock_movements 
ADD CONSTRAINT stock_movements_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE stock_movements 
ADD CONSTRAINT stock_movements_warehouse_id_fkey 
FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

-- Step 8: Create indexes for better performance
CREATE INDEX idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at);

-- Step 9: Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies
CREATE POLICY "stock_movements_select_policy" 
ON stock_movements FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "stock_movements_insert_policy" 
ON stock_movements FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "stock_movements_update_policy" 
ON stock_movements FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "stock_movements_delete_policy" 
ON stock_movements FOR DELETE 
TO authenticated 
USING (true);

-- Step 11: Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON warehouses TO authenticated;

-- Step 12: Insert sample stock movements using existing data
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    movement_type_ar, 
    quantity, 
    unit_price, 
    reference_number, 
    reference_number_ar, 
    notes, 
    notes_ar, 
    created_by, 
    created_by_ar
) 
SELECT 
    p.id,
    w.id,
    'IN',
    'دخول',
    100,
    25.50,
    'REF-001',
    'مرجع-001',
    'Initial stock receipt',
    'استلام المخزون الأولي',
    'System',
    'النظام'
FROM products p, warehouses w
WHERE p.id = (SELECT id FROM products ORDER BY id LIMIT 1)
AND w.id = (SELECT id FROM warehouses ORDER BY id LIMIT 1)
LIMIT 1;

-- Step 13: Verify the setup
SELECT 'Complete stock movements setup completed successfully!' as status;

-- Show products
SELECT 
    id,
    product_name,
    product_name_ar,
    product_code,
    cost_price,
    selling_price
FROM products 
ORDER BY id 
LIMIT 5;

-- Show warehouses
SELECT 
    id,
    warehouse_name,
    warehouse_name_ar,
    location,
    warehouse_type
FROM warehouses 
ORDER BY id 
LIMIT 5;

-- Show stock movements
SELECT 
    sm.id,
    sm.movement_type,
    sm.movement_type_ar,
    sm.quantity,
    sm.reference_number,
    p.product_name,
    w.warehouse_name
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses w ON sm.warehouse_id = w.id
ORDER BY sm.created_at DESC
LIMIT 5;
