-- Temporarily Disable RLS for Stocktaking Tables (FOR TESTING ONLY)
-- WARNING: This disables security - only use for development/testing

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Temporarily disable RLS for testing
ALTER TABLE stocktaking DISABLE ROW LEVEL SECURITY;
ALTER TABLE stocktaking_items DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Test insert to verify it works
INSERT INTO stocktaking (warehouse_id, stocktaking_date, reference_number, status, notes, created_by)
SELECT 
    w.id,
    CURRENT_DATE,
    'ST-TEST-' || EXTRACT(EPOCH FROM NOW())::INT,
    'PLANNED',
    'Test stocktaking',
    'system'
FROM warehouses w 
LIMIT 1
ON CONFLICT (reference_number) DO NOTHING;

-- Show the inserted record
SELECT 'Test record inserted:' as status;
SELECT id, warehouse_id, reference_number, status, created_by 
FROM stocktaking 
WHERE reference_number LIKE 'ST-TEST-%'
ORDER BY created_at DESC 
LIMIT 1;

SELECT 'RLS temporarily disabled for testing' as status;
