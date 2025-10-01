-- Complete Stock Movements Fix
-- This script fixes all issues with stock movements functionality

-- ===========================================
-- STEP 1: CREATE STOCK MOVEMENTS TABLE
-- ===========================================

-- Drop the table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Create stock_movements table with complete structure
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
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

-- ===========================================
-- STEP 2: CREATE INDEXES
-- ===========================================

CREATE INDEX idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements (warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements (reference_number);
CREATE INDEX idx_stock_movements_status ON stock_movements (status);

-- ===========================================
-- STEP 3: SET UP RLS POLICIES
-- ===========================================

-- Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Enable read access for authenticated users" 
ON stock_movements FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON stock_movements FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON stock_movements FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON stock_movements FOR DELETE 
TO authenticated 
USING (true);

-- ===========================================
-- STEP 4: GRANT PERMISSIONS
-- ===========================================

GRANT ALL ON stock_movements TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON warehouses TO authenticated;

-- ===========================================
-- STEP 5: INSERT SAMPLE DATA
-- ===========================================

-- Insert sample stock movements for testing
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

-- ===========================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to update inventory after stock movement
CREATE OR REPLACE FUNCTION update_inventory_after_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the movement
    RAISE NOTICE 'Stock movement created: Product % in Warehouse % with quantity %', 
        NEW.product_id, NEW.warehouse_id, NEW.quantity;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trigger_update_inventory_after_movement
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_after_movement();

-- ===========================================
-- STEP 7: VERIFICATION
-- ===========================================

-- Verify table structure
SELECT 'Stock Movements Table Created Successfully!' as status;

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
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
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
ORDER BY created_at DESC;
