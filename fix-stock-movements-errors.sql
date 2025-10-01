-- Fix Stock Movements Errors
-- This script addresses the most common issues with stock movements

-- Step 1: Check if stock_movements table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        -- Create stock_movements table
        CREATE TABLE stock_movements (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            warehouse_id INTEGER NOT NULL,
            movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RECEIPT', 'ISSUE', 'RETURN')),
            movement_type_ar VARCHAR(20) NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) DEFAULT 0,
            total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
            reference_number VARCHAR(100),
            reference_number_ar VARCHAR(100),
            notes TEXT,
            notes_ar TEXT,
            created_by VARCHAR(255) DEFAULT 'System',
            created_by_ar VARCHAR(255) DEFAULT 'النظام',
            approved_by VARCHAR(255),
            status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Stock movements table created successfully';
    ELSE
        RAISE NOTICE 'Stock movements table already exists';
    END IF;
END $$;

-- Step 2: Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key to products if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_movements_product_id_fkey'
    ) THEN
        ALTER TABLE stock_movements 
        ADD CONSTRAINT stock_movements_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key to products added';
    END IF;
    
    -- Add foreign key to warehouses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_movements_warehouse_id_fkey'
    ) THEN
        ALTER TABLE stock_movements 
        ADD CONSTRAINT stock_movements_warehouse_id_fkey 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key to warehouses added';
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements (reference_number);
CREATE INDEX IF NOT EXISTS idx_stock_movements_status ON stock_movements (status);

-- Step 4: Fix RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to read stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock movements" ON stock_movements;

-- Disable RLS temporarily
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive RLS policies
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

-- Step 5: Grant all necessary permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON warehouses TO authenticated;

-- Step 6: Insert sample data if table is empty
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
    created_by_ar, 
    status
) 
SELECT 
    1, -- product_id
    1, -- warehouse_id
    'IN',
    'دخول',
    100,
    25.50,
    'REF-001',
    'مرجع-001',
    'Initial stock receipt',
    'استلام المخزون الأولي',
    'System',
    'النظام',
    'APPROVED'
WHERE NOT EXISTS (SELECT 1 FROM stock_movements LIMIT 1);

-- Step 7: Verify the fix
SELECT 'Stock movements errors fixed successfully!' as status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'stock_movements';

-- Show sample data
SELECT 
    id,
    movement_type,
    movement_type_ar,
    quantity,
    reference_number,
    status,
    created_at
FROM stock_movements 
ORDER BY created_at DESC
LIMIT 5;
