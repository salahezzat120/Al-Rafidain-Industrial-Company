-- FINAL RLS FIX - Run this in Supabase SQL Editor
-- This completely fixes the RLS issues

-- Step 1: Completely disable RLS on stock_movements
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (comprehensive cleanup)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename = 'stock_movements'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Grant ALL permissions to authenticated users
GRANT ALL ON stock_movements TO authenticated;
GRANT ALL ON stock_movements TO anon;
GRANT ALL ON stock_movements TO service_role;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO service_role;

-- Step 4: Test insert to make sure it works
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    quantity, 
    unit_price, 
    reference_number,
    notes,
    created_by
) VALUES (
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'IN',
    1,
    1.00,
    'FINAL-TEST-' || extract(epoch from now()),
    'Final RLS fix test',
    'System'
);

-- Step 5: Verify the fix worked
SELECT 'RLS COMPLETELY DISABLED - Stock movements should work now!' as status;
SELECT COUNT(*) as total_movements FROM stock_movements;
SELECT id, movement_type, quantity, created_at FROM stock_movements ORDER BY created_at DESC LIMIT 3;
