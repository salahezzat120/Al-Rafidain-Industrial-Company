-- Fix Row Level Security Policies for Stocktaking Tables
-- Run this script in your Supabase SQL Editor

-- First, let's check the current RLS policies
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
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stocktaking;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stocktaking_items;

-- Create more permissive RLS policies for stocktaking table
CREATE POLICY "Allow all operations for authenticated users on stocktaking" 
ON stocktaking FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create more permissive RLS policies for stocktaking_items table
CREATE POLICY "Allow all operations for authenticated users on stocktaking_items" 
ON stocktaking_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Alternative: Temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE stocktaking DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE stocktaking_items DISABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('stocktaking', 'stocktaking_items');

-- Test insert (optional - remove after testing)
-- INSERT INTO stocktaking (warehouse_id, stocktaking_date, reference_number, status, notes, created_by)
-- VALUES (1, CURRENT_DATE, 'ST-TEST-001', 'PLANNED', 'Test stocktaking', 'system');

SELECT 'RLS policies updated successfully' as status;
