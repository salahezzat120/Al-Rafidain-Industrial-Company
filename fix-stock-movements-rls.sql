-- Fix RLS Policies for Stock Movements
-- This script ensures proper RLS policies are in place for the stock_movements table

-- Step 1: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock movements" ON stock_movements;

-- Step 2: Disable RLS temporarily to ensure policies work
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive RLS policies
CREATE POLICY "Enable read access for authenticated users" 
ON stock_movements FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON stock_movements FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON stock_movements FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON stock_movements FOR DELETE 
TO authenticated 
USING (true);

-- Step 5: Grant all necessary permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Step 6: Grant permissions on related tables
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON warehouses TO authenticated;

-- Step 7: Verify RLS is working
SELECT 'RLS policies created successfully for stock_movements table!' as status;

-- Step 8: Test the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'stock_movements';
