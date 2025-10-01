-- Verification script for products table
-- Run this after creating the products table to verify all fields are present

-- Check if products table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') 
        THEN '✅ Products table exists'
        ELSE '❌ Products table does not exist'
    END AS table_status;

-- List all columns in the products table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check for all required fields
SELECT 
    'Required Fields Check' AS check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_name') THEN '✅' ELSE '❌' END AS product_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_code') THEN '✅' ELSE '❌' END AS product_code,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN '✅' ELSE '❌' END AS stock,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN '✅' ELSE '❌' END AS barcode,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'main_group') THEN '✅' ELSE '❌' END AS main_group,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sub_group') THEN '✅' ELSE '❌' END AS sub_group,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'color') THEN '✅' ELSE '❌' END AS color,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'material') THEN '✅' ELSE '❌' END AS material,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_of_measurement') THEN '✅' ELSE '❌' END AS unit_of_measurement,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN '✅' ELSE '❌' END AS description,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN '✅' ELSE '❌' END AS cost_price,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'selling_price') THEN '✅' ELSE '❌' END AS selling_price,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN '✅' ELSE '❌' END AS weight,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN '✅' ELSE '❌' END AS dimensions,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'expiry_date') THEN '✅' ELSE '❌' END AS expiry_date,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'serial_number') THEN '✅' ELSE '❌' END AS serial_number,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warehouse') THEN '✅' ELSE '❌' END AS warehouse;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products'
ORDER BY indexname;

-- Check sample data
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN is_active = true THEN 1 END) AS active_products,
    COUNT(CASE WHEN stock > 0 THEN 1 END) AS products_with_stock
FROM products;

-- Show sample data
SELECT 
    product_name,
    product_code,
    stock,
    main_group,
    sub_group,
    color,
    material,
    unit_of_measurement,
    cost_price,
    selling_price,
    warehouse
FROM products 
LIMIT 5;
