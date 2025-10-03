-- Fix Stock Movements - Minimal Setup
-- This script creates a minimal stock_movements table with only essential fields

-- Step 1: Drop the table if it exists to recreate with minimal structure
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Step 2: Create stock_movements table with minimal structure
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    movement_type_ar VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    reference_number VARCHAR(100),
    reference_number_ar VARCHAR(100),
    notes TEXT,
    notes_ar TEXT,
    created_by VARCHAR(255) DEFAULT 'System',
    created_by_ar VARCHAR(255) DEFAULT 'النظام',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add foreign key constraints
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

-- Step 8: Insert sample data only if products and warehouses exist
DO $$
DECLARE
    product_count INTEGER;
    warehouse_count INTEGER;
    first_product_id INTEGER;
    first_warehouse_id INTEGER;
BEGIN
    -- Check if products exist
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO warehouse_count FROM warehouses;
    
    IF product_count > 0 AND warehouse_count > 0 THEN
        -- Get the first product and warehouse IDs
        SELECT id INTO first_product_id FROM products ORDER BY id LIMIT 1;
        SELECT id INTO first_warehouse_id FROM warehouses ORDER BY id LIMIT 1;
        
        -- Insert sample data using existing IDs
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
            created_by_ar
        ) VALUES 
        (first_product_id, first_warehouse_id, 'IN', 'دخول', 100, 25.50, 'REF-001', 'مرجع-001', 'Initial stock receipt', 'استلام المخزون الأولي', 'System', 'النظام'),
        (first_product_id, first_warehouse_id, 'OUT', 'خروج', 10, 25.50, 'REF-002', 'مرجع-002', 'Stock issue for production', 'صرف مخزون للإنتاج', 'System', 'النظام'),
        (first_product_id, first_warehouse_id, 'TRANSFER', 'نقل', 20, 25.50, 'REF-003', 'مرجع-003', 'Transfer to other warehouse', 'نقل إلى مستودع آخر', 'System', 'النظام');
        
        RAISE NOTICE 'Sample stock movements inserted successfully using existing products and warehouses';
    ELSE
        RAISE NOTICE 'No products or warehouses found - skipping sample data insertion';
        RAISE NOTICE 'Please create some products and warehouses first, then run this script again';
    END IF;
END $$;

-- Step 9: Verify the table structure
SELECT 'Stock movements table created with minimal structure!' as status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    id,
    movement_type,
    movement_type_ar,
    quantity,
    reference_number,
    created_at
FROM stock_movements 
ORDER BY created_at DESC
LIMIT 5;
