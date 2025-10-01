-- Check if representatives table exists and has data
-- This script will help diagnose the representatives table issue

-- 1. Check if table exists
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'representatives';

-- 2. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'representatives'
ORDER BY ordinal_position;

-- 3. Check if table has any data
SELECT COUNT(*) as total_representatives FROM representatives;

-- 4. Show sample data
SELECT * FROM representatives LIMIT 5;

-- 5. Check for specific status values
SELECT status, COUNT(*) as count 
FROM representatives 
GROUP BY status;
