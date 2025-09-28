-- Quick RLS Fix for Stock Movements
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON stock_movements;

-- Create simple, permissive policies
CREATE POLICY "stock_movements_select_policy" 
ON stock_movements FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "stock_movements_insert_policy" 
ON stock_movements FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "stock_movements_update_policy" 
ON stock_movements FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "stock_movements_delete_policy" 
ON stock_movements FOR DELETE 
TO authenticated
USING (true);

-- Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Test insert
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    movement_type_ar,
    quantity, 
    unit_price, 
    reference_number,
    notes,
    created_by
) VALUES (
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'IN',
    'دخول',
    1,
    1.00,
    'TEST-' || extract(epoch from now()),
    'Test movement',
    'System'
);

SELECT 'RLS Fixed - Test insert successful!' as result;
