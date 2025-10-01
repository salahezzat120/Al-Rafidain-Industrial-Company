-- Check the actual structure of the products table
-- Run this in your Supabase SQL editor to see the real column names

-- Check if products table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') 
        THEN '✅ Products table exists'
        ELSE '❌ Products table does not exist'
    END AS table_status;

-- List all columns in the products table with their data types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check for common column name variations
SELECT 
    'Column Name Check' AS check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_of_measurement') THEN '✅' ELSE '❌' END AS unit_of_measurement,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit') THEN '✅' ELSE '❌' END AS unit,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_of_measure') THEN '✅' ELSE '❌' END AS unit_of_measure,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'measurement_unit') THEN '✅' ELSE '❌' END AS measurement_unit;

-- Show sample data to understand the structure
SELECT * FROM products LIMIT 3;
