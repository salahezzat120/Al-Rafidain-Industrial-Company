-- Diagnose warehouses table structure
-- This script shows what columns actually exist in the warehouses table

-- Show all columns in the warehouses table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'responsible_person'
    ) THEN 'EXISTS' ELSE 'MISSING' END as responsible_person_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'manager_name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as manager_name_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'capacity'
    ) THEN 'EXISTS' ELSE 'MISSING' END as capacity_status;

-- Show current data in warehouses table (if any)
SELECT COUNT(*) as total_warehouses FROM warehouses;

-- If there's data, show it
SELECT * FROM warehouses LIMIT 5;
