-- Fix driver_order_products table error
-- This script handles the missing table and problematic triggers

-- Option 1: Create the missing driver_order_products table
CREATE TABLE IF NOT EXISTS driver_order_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100),
    product_description TEXT,
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_stock_level DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_location VARCHAR(255),
    warehouse_phone VARCHAR(20),
    warehouse_email VARCHAR(255),
    unit_id INTEGER REFERENCES units_of_measurement(id),
    unit_name VARCHAR(100),
    unit_symbol VARCHAR(10),
    unit_type VARCHAR(50),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    product_status VARCHAR(20) DEFAULT 'ACTIVE',
    warehouse_status VARCHAR(20) DEFAULT 'ACTIVE',
    stock_status VARCHAR(20) DEFAULT 'IN_STOCK',
    total_stock_value DECIMAL(10,2) DEFAULT 0,
    stock_level_status VARCHAR(20) DEFAULT 'NORMAL',
    last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

-- Option 2: Remove problematic triggers (if you don't need driver order functionality)
-- Uncomment the following lines if you want to remove the triggers instead of creating the table

-- DROP TRIGGER IF EXISTS add_warehouse_to_driver_orders_improved ON warehouses;
-- DROP FUNCTION IF EXISTS add_warehouse_to_driver_orders_improved();

-- Option 3: Check what triggers exist and remove them
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- List all triggers on warehouses table
    FOR trigger_record IN 
        SELECT trigger_name, event_manipulation, action_timing
        FROM information_schema.triggers 
        WHERE event_object_table = 'warehouses'
    LOOP
        RAISE NOTICE 'Found trigger: % on % %', 
            trigger_record.trigger_name, 
            trigger_record.event_manipulation, 
            trigger_record.action_timing;
    END LOOP;
    
    -- Remove the problematic trigger if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'add_warehouse_to_driver_orders_improved'
        AND event_object_table = 'warehouses'
    ) THEN
        DROP TRIGGER add_warehouse_to_driver_orders_improved ON warehouses;
        RAISE NOTICE 'Removed problematic trigger: add_warehouse_to_driver_orders_improved';
    END IF;
    
    -- Remove the function if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'add_warehouse_to_driver_orders_improved'
        AND routine_type = 'FUNCTION'
    ) THEN
        DROP FUNCTION add_warehouse_to_driver_orders_improved();
        RAISE NOTICE 'Removed problematic function: add_warehouse_to_driver_orders_improved';
    END IF;
END $$;

-- Verify the fix
SELECT 'Driver order products table created successfully!' as status;

-- Check if triggers still exist
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'warehouses';

-- Show table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'driver_order_products' 
ORDER BY ordinal_position;
