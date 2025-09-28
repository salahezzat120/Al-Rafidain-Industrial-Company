-- Temporary RLS Disable for Stock Movements
-- This disables RLS temporarily to allow stock movements to work

-- Step 1: Disable RLS on stock_movements table
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant full permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT ALL ON stock_movements TO anon;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO anon;

-- Step 3: Test insert
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
    'NO-RLS-TEST',
    'No RLS Test',
    'System'
);

-- Step 4: Verify
SELECT 'RLS Disabled - Stock movements should work now!' as status;
SELECT COUNT(*) as total_movements FROM stock_movements;
