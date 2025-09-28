-- Simple Stock Movements Fix
-- This script creates the stock_movements table with minimal required fields

-- Step 1: Check if required tables exist first
DO $$
BEGIN
    -- Check if products table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Products table does not exist. Please create it first.';
    END IF;
    
    -- Check if warehouses table exists  
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Warehouses table does not exist. Please create it first.';
    END IF;
    
    RAISE NOTICE 'Required tables exist. Proceeding with stock_movements creation...';
END $$;

-- Step 2: Drop existing stock_movements table if it exists
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Step 3: Create stock_movements table with minimal structure
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Add foreign key constraints (with error handling)
DO $$
BEGIN
    -- Add foreign key to products table
    BEGIN
        ALTER TABLE stock_movements 
        ADD CONSTRAINT fk_stock_movements_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to products table';
    EXCEPTION WHEN others THEN
        RAISE WARNING 'Could not add foreign key to products table: %', SQLERRM;
    END;
    
    -- Add foreign key to warehouses table
    BEGIN
        ALTER TABLE stock_movements 
        ADD CONSTRAINT fk_stock_movements_warehouse_id 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to warehouses table';
    EXCEPTION WHEN others THEN
        RAISE WARNING 'Could not add foreign key to warehouses table: %', SQLERRM;
    END;
END $$;

-- Step 5: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at);

-- Step 6: Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 7: Create basic RLS policies
CREATE POLICY "Allow authenticated users to manage stock movements" 
ON stock_movements FOR ALL 
TO authenticated;

-- Step 8: Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Step 9: Insert a test record to verify the table works
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    quantity, 
    unit_price, 
    reference_number, 
    notes
) VALUES (
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'IN',
    100,
    1.50,
    'TEST-001',
    'Test stock movement'
);

-- Step 10: Verify the table was created successfully
SELECT 'Stock Movements Table Created Successfully!' as status;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 11: Show sample data
SELECT 'Sample Stock Movement:' as status;
SELECT * FROM stock_movements LIMIT 1;
