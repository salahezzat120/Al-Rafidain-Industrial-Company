-- Debug Stock Movements Table
-- Run this to check if the table exists and diagnose the issue

-- Step 1: Check if stock_movements table exists
SELECT 'Checking if stock_movements table exists...' as status;

SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'stock_movements' 
AND table_schema = 'public';

-- Step 2: If table doesn't exist, show what tables do exist
SELECT 'Available tables in public schema:' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%stock%' OR table_name LIKE '%movement%'
ORDER BY table_name;

-- Step 3: Check if products and warehouses tables exist (required for foreign keys)
SELECT 'Checking required tables for foreign keys...' as status;

SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as products_table,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as warehouses_table;

-- Step 4: If tables exist, check their structure
SELECT 'Products table structure:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Warehouses table structure:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'warehouses' AND table_schema = 'public'
ORDER BY ordinal_position;
