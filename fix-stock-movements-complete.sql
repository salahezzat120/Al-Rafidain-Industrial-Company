-- Complete Fix for Stock Movements
-- This script creates the stock_movements table with all required columns

-- Step 1: Drop the table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Step 2: Create stock_movements table with complete structure
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RECEIPT', 'ISSUE', 'RETURN')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements (reference_number);

-- Step 4: Enable RLS (Row Level Security)
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
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

-- Step 6: Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;

-- Step 7: Insert some sample stock movements for testing
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, unit_price, reference_number, notes, created_by) VALUES
(
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'IN',
    100,
    1.50,
    'INIT-001',
    'Initial stock entry',
    'System'
),
(
    (SELECT id FROM products LIMIT 1),
    (SELECT id FROM warehouses LIMIT 1),
    'OUT',
    10,
    1.50,
    'OUT-001',
    'Stock issue',
    'System'
);

-- Step 8: Verify the table structure
SELECT 'Stock Movements Table Created Successfully' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 9: Test the table with a sample query
SELECT 'Sample Stock Movements:' as status;

SELECT 
    sm.id,
    sm.movement_type,
    sm.quantity,
    sm.unit_price,
    sm.total_value,
    sm.reference_number,
    p.product_name,
    w.warehouse_name
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses w ON sm.warehouse_id = w.id
ORDER BY sm.created_at DESC;
