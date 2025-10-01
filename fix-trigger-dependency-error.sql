-- Fix trigger dependency error
-- This script removes the trigger and function in the correct order

-- First, drop the trigger
DROP TRIGGER IF EXISTS trigger_add_warehouse_to_driver_orders_improved ON warehouses;

-- Then drop the function
DROP FUNCTION IF EXISTS add_warehouse_to_driver_orders_improved();

-- Alternative: Use CASCADE to drop everything at once
-- DROP FUNCTION IF EXISTS add_warehouse_to_driver_orders_improved() CASCADE;

-- Verify the trigger and function were removed
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'warehouses';

-- Check if the function still exists
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'add_warehouse_to_driver_orders_improved';

-- Show success message
SELECT 'Trigger and function removed successfully!' as status;
