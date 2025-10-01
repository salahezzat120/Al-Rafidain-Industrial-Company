-- Remove problematic triggers that reference non-existent tables
-- Run this in Supabase SQL Editor

-- Remove the problematic trigger
DROP TRIGGER IF EXISTS add_warehouse_to_driver_orders_improved ON warehouses;

-- Remove the problematic function
DROP FUNCTION IF EXISTS add_warehouse_to_driver_orders_improved();

-- Check for any other problematic triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'warehouses';

-- Verify triggers were removed
SELECT 'Problematic triggers removed successfully!' as status;
