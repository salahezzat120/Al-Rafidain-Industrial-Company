-- Fix Stock Movements Relationships
-- This script properly sets up the stock_movements table with correct foreign key relationships

-- Step 1: Drop the table if it exists to recreate with proper structure
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Step 2: Create stock_movements table with proper foreign key relationships
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

-- Step 3: Add foreign key constraints with proper names
ALTER TABLE stock_movements 
ADD CONSTRAINT stock_movements_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE stock_movements 
ADD CONSTRAINT stock_movements_warehouse_id_fkey 
FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

-- Step 4: Create indexes for better performance
CREATE INDEX idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements (reference_number);
CREATE INDEX idx_stock_movements_status ON stock_movements (status);

-- Step 5: Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
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

-- Step 7: Grant permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON warehouses TO authenticated;

-- Step 8: Insert sample data
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
) VALUES 
(1, 1, 'IN', 'دخول', 100, 25.50, 'REF-001', 'مرجع-001', 'Initial stock receipt', 'استلام المخزون الأولي', 'System', 'النظام', 'APPROVED'),
(1, 1, 'OUT', 'خروج', 10, 25.50, 'REF-002', 'مرجع-002', 'Stock issue for production', 'صرف مخزون للإنتاج', 'System', 'النظام', 'APPROVED'),
(1, 1, 'TRANSFER', 'نقل', 20, 25.50, 'REF-003', 'مرجع-003', 'Transfer to other warehouse', 'نقل إلى مستودع آخر', 'System', 'النظام', 'PENDING');

-- Step 9: Verify the relationships
SELECT 'Stock movements table created with proper relationships!' as status;

-- Show foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'stock_movements';

-- Show sample data
SELECT 
    sm.id,
    sm.movement_type,
    sm.movement_type_ar,
    sm.quantity,
    sm.reference_number,
    sm.status,
    p.product_name,
    w.warehouse_name
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses w ON sm.warehouse_id = w.id
ORDER BY sm.created_at DESC
LIMIT 5;
