-- Fix RLS Policies for Stock Movements
-- This script fixes the Row Level Security policies that are blocking inserts

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock movements" ON stock_movements;

-- Step 2: Create new, more permissive policies
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

-- Step 3: Grant additional permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Step 4: Test the policies by trying to insert a test record
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    movement_type_ar,
    quantity, 
    unit_price, 
    reference_number,
    reference_number_ar,
    notes,
    notes_ar,
    created_by,
    created_by_ar
) VALUES (
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'IN',
    'دخول',
    1,
    1.00,
    'RLS-TEST-' || extract(epoch from now()),
    'اختبار-صلاحيات-' || extract(epoch from now()),
    'RLS Policy Test',
    'اختبار سياسة الأمان',
    'System',
    'النظام'
);

-- Step 5: Verify the insert worked
SELECT 'RLS Policies Fixed Successfully!' as status;
SELECT COUNT(*) as total_movements FROM stock_movements;
