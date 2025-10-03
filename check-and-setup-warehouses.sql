-- Check and Setup Warehouses for Stocktaking
-- Run this script first to ensure warehouses exist

-- Check if warehouses table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') 
        THEN 'Warehouses table exists' 
        ELSE 'Warehouses table does not exist' 
    END as table_status;

-- Check if warehouses table has data
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM warehouses LIMIT 1) 
        THEN 'Warehouses table has data' 
        ELSE 'Warehouses table is empty' 
    END as data_status;

-- Show existing warehouses
SELECT 'Existing warehouses:' as info;
SELECT id, warehouse_name, warehouse_name_ar, warehouse_type, location 
FROM warehouses 
ORDER BY id;

-- If no warehouses exist, create a sample warehouse
INSERT INTO warehouses (
    warehouse_name, 
    warehouse_name_ar, 
    location, 
    location_ar, 
    address, 
    warehouse_type, 
    capacity, 
    responsible_person, 
    responsible_person_ar, 
    contact_phone, 
    contact_email
)
SELECT 
    'Main Warehouse',
    'المستودع الرئيسي',
    'Baghdad',
    'بغداد',
    'Main Street, Baghdad',
    'DISTRIBUTION',
    1000,
    'Warehouse Manager',
    'مدير المستودع',
    '+964-1-123-4567',
    'warehouse@company.com'
WHERE NOT EXISTS (SELECT 1 FROM warehouses LIMIT 1);

-- Show final warehouse list
SELECT 'Final warehouse list:' as info;
SELECT id, warehouse_name, warehouse_name_ar, warehouse_type 
FROM warehouses 
ORDER BY id;
