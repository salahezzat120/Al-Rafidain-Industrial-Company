-- Fix Stock Movements Table
-- This script creates the stock_movements table if it doesn't exist

-- Step 1: Create stock_movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at);

-- Step 3: Enable RLS (Row Level Security)
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Allow authenticated users to read stock movements" 
ON stock_movements FOR SELECT 
TO authenticated;

CREATE POLICY "Allow authenticated users to insert stock movements" 
ON stock_movements FOR INSERT 
TO authenticated;

CREATE POLICY "Allow authenticated users to update stock movements" 
ON stock_movements FOR UPDATE 
TO authenticated;

CREATE POLICY "Allow authenticated users to delete stock movements" 
ON stock_movements FOR DELETE 
TO authenticated;

-- Step 5: Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Step 6: Verify the table structure
SELECT 'Stock Movements Table Structure:' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 7: Check if there are any existing stock movements
SELECT 'Existing Stock Movements:' as status;

SELECT COUNT(*) as total_movements FROM stock_movements;
