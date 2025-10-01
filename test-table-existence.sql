-- Test which tables exist and which are missing
-- Run this in Supabase SQL Editor

-- Check if all required tables exist
SELECT 
    'main_groups' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'main_groups' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'sub_groups' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_groups' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'colors' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colors' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'materials' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'units_of_measurement' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units_of_measurement' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'warehouses' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'inventory' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
UNION ALL
SELECT 
    'stock_movements' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'MISSING' 
    END as status
ORDER BY table_name;
