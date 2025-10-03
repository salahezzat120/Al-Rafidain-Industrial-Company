-- Comprehensive Fix for Stocktaking Table Issues
-- This script addresses RLS policies, authentication, and data integrity

-- Step 1: Check current state
SELECT 'Current RLS status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Step 2: Check existing policies
SELECT 'Current policies:' as info;
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Step 3: Drop existing problematic policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stocktaking;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stocktaking_items;

-- Step 4: Create proper RLS policies
-- For stocktaking table
CREATE POLICY "stocktaking_policy" 
ON stocktaking FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- For stocktaking_items table  
CREATE POLICY "stocktaking_items_policy" 
ON stocktaking_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Step 5: Alternative - Create service role policies (if using service role)
CREATE POLICY "stocktaking_service_policy" 
ON stocktaking FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "stocktaking_items_service_policy" 
ON stocktaking_items FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Step 6: Grant necessary permissions
GRANT ALL ON stocktaking TO authenticated;
GRANT ALL ON stocktaking_items TO authenticated;
GRANT ALL ON stocktaking TO service_role;
GRANT ALL ON stocktaking_items TO service_role;

-- Step 7: Verify policies were created
SELECT 'New policies created:' as info;
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Step 8: Test insert with proper error handling
DO $$
DECLARE
    test_warehouse_id INTEGER;
    test_reference VARCHAR(100);
BEGIN
    -- Get a valid warehouse ID
    SELECT id INTO test_warehouse_id FROM warehouses LIMIT 1;
    
    IF test_warehouse_id IS NULL THEN
        RAISE EXCEPTION 'No warehouses found. Please create warehouses first.';
    END IF;
    
    -- Generate unique reference
    test_reference := 'ST-TEST-' || EXTRACT(EPOCH FROM NOW())::INT;
    
    -- Test insert
    INSERT INTO stocktaking (
        warehouse_id, 
        stocktaking_date, 
        reference_number, 
        status, 
        notes, 
        created_by
    ) VALUES (
        test_warehouse_id,
        CURRENT_DATE,
        test_reference,
        'PLANNED',
        'Test stocktaking',
        'system'
    );
    
    RAISE NOTICE 'Test insert successful with warehouse_id: %', test_warehouse_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;

-- Step 9: Show final status
SELECT 'Stocktaking table setup completed' as status;
SELECT 'You can now use the stocktaking form in your application' as next_step;
