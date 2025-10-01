-- Diagnose what tables are missing
-- Run this in Supabase SQL Editor to see what tables exist

-- Check which tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'main_groups', 'sub_groups', 'colors', 'materials', 
    'units_of_measurement', 'warehouses', 'products', 
    'inventory', 'stock_movements'
)
ORDER BY table_name;

-- Check what tables are missing
SELECT 
    'main_groups' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'main_groups' AND table_schema = 'public')
UNION ALL
SELECT 
    'sub_groups' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_groups' AND table_schema = 'public')
UNION ALL
SELECT 
    'colors' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colors' AND table_schema = 'public')
UNION ALL
SELECT 
    'materials' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials' AND table_schema = 'public')
UNION ALL
SELECT 
    'units_of_measurement' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units_of_measurement' AND table_schema = 'public')
UNION ALL
SELECT 
    'warehouses' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public')
UNION ALL
SELECT 
    'inventory' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public')
UNION ALL
SELECT 
    'stock_movements' as missing_table
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements' AND table_schema = 'public');

-- Check if products table has the required columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
