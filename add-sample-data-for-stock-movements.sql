-- Add Sample Data for Stock Movements Testing
-- This script ensures we have products and warehouses for testing stock movements

-- Step 1: Add sample products if they don't exist
INSERT INTO products (
    product_name,
    product_name_ar,
    product_code,
    stock_number,
    barcode,
    main_group_id,
    sub_group_id,
    color_id,
    material_id,
    unit_of_measurement_id,
    description,
    description_ar,
    cost_price,
    selling_price,
    weight,
    dimensions,
    expiry_date,
    serial_number,
    warehouses,
    specifications
) VALUES 
(
    'Plastic Container 500ml',
    'حاوية بلاستيكية 500 مل',
    'PC-500',
    'ST-001',
    '1234567890123',
    1, -- main_group_id
    1, -- sub_group_id
    1, -- color_id
    1, -- material_id
    1, -- unit_of_measurement_id
    'High-quality plastic container',
    'حاوية بلاستيكية عالية الجودة',
    15.50,
    25.00,
    0.5,
    '10x10x15 cm',
    '2025-12-31',
    'SN-001',
    'Main Warehouse',
    '{"capacity": "500ml", "material": "PET"}'
),
(
    'Plastic Bottle 1L',
    'زجاجة بلاستيكية 1 لتر',
    'PB-1000',
    'ST-002',
    '1234567890124',
    1, -- main_group_id
    1, -- sub_group_id
    2, -- color_id
    1, -- material_id
    1, -- unit_of_measurement_id
    'Durable plastic bottle',
    'زجاجة بلاستيكية متينة',
    20.00,
    35.00,
    0.8,
    '8x8x20 cm',
    '2025-12-31',
    'SN-002',
    'Main Warehouse',
    '{"capacity": "1L", "material": "HDPE"}'
),
(
    'Plastic Bag Small',
    'كيس بلاستيكي صغير',
    'PB-SM',
    'ST-003',
    '1234567890125',
    1, -- main_group_id
    2, -- sub_group_id
    3, -- color_id
    2, -- material_id
    2, -- unit_of_measurement_id
    'Small plastic bag',
    'كيس بلاستيكي صغير',
    2.00,
    5.00,
    0.1,
    '20x30 cm',
    '2025-12-31',
    'SN-003',
    'Secondary Warehouse',
    '{"size": "20x30cm", "material": "LDPE"}'
)
ON CONFLICT (product_code) DO NOTHING;

-- Step 2: Add sample warehouses if they don't exist
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

-- Step 3: Add sample stock movements if they don't exist
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
    created_by_ar,
    status
) VALUES 
(
    1, -- product_id (Plastic Container 500ml)
    1, -- warehouse_id (Main Warehouse)
    'IN',
    'دخول',
    100,
    15.50,
    'REF-001',
    'مرجع-001',
    'Initial stock receipt',
    'استلام المخزون الأولي',
    'System',
    'النظام',
    'APPROVED'
),
(
    1, -- product_id (Plastic Container 500ml)
    1, -- warehouse_id (Main Warehouse)
    'OUT',
    'خروج',
    10,
    15.50,
    'REF-002',
    'مرجع-002',
    'Stock issue for production',
    'صرف مخزون للإنتاج',
    'System',
    'النظام',
    'APPROVED'
),
(
    2, -- product_id (Plastic Bottle 1L)
    2, -- warehouse_id (Secondary Warehouse)
    'IN',
    'دخول',
    50,
    20.00,
    'REF-003',
    'مرجع-003',
    'Stock transfer from main warehouse',
    'نقل مخزون من المستودع الرئيسي',
    'System',
    'النظام',
    'PENDING'
)
ON CONFLICT DO NOTHING;

-- Step 4: Verify the data
SELECT 'Sample data added successfully!' as status;

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
    sm.status,
    p.product_name,
    w.warehouse_name
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses w ON sm.warehouse_id = w.id
ORDER BY sm.created_at DESC
LIMIT 5;
