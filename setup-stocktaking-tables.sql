-- Setup Stocktaking Tables for Supabase
-- Run this script in your Supabase SQL Editor

-- Create stocktaking table
CREATE TABLE IF NOT EXISTS stocktaking (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL,
    stocktaking_date DATE NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED')),
    status_ar VARCHAR(50) DEFAULT 'مخطط',
    total_items INTEGER DEFAULT 0,
    counted_items INTEGER DEFAULT 0,
    discrepancies INTEGER DEFAULT 0,
    notes TEXT,
    notes_ar TEXT,
    created_by VARCHAR(255),
    created_by_ar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stocktaking_items table
CREATE TABLE IF NOT EXISTS stocktaking_items (
    id SERIAL PRIMARY KEY,
    stocktaking_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    system_quantity DECIMAL(10,2) NOT NULL,
    counted_quantity DECIMAL(10,2) NOT NULL,
    difference DECIMAL(10,2) NOT NULL,
    notes TEXT,
    notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE stocktaking 
ADD CONSTRAINT stocktaking_warehouse_id_fkey 
FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);

ALTER TABLE stocktaking_items 
ADD CONSTRAINT stocktaking_items_stocktaking_id_fkey 
FOREIGN KEY (stocktaking_id) REFERENCES stocktaking(id) ON DELETE CASCADE;

ALTER TABLE stocktaking_items 
ADD CONSTRAINT stocktaking_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Enable Row Level Security (RLS)
ALTER TABLE stocktaking ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktaking_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stocktaking table
CREATE POLICY "Enable all operations for authenticated users" ON stocktaking
FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for stocktaking_items table
CREATE POLICY "Enable all operations for authenticated users" ON stocktaking_items
FOR ALL USING (auth.role() = 'authenticated');

-- Check if warehouses exist before inserting sample data
-- First, let's see what warehouses are available
-- SELECT id, warehouse_name FROM warehouses LIMIT 5;

-- Insert sample data only if warehouses exist
-- Note: Replace warehouse_id with an actual warehouse ID from your warehouses table
-- INSERT INTO stocktaking (warehouse_id, stocktaking_date, reference_number, status, notes, created_by)
-- SELECT 
--     w.id,
--     CURRENT_DATE,
--     'ST-SAMPLE-001',
--     'PLANNED',
--     'Sample stocktaking for testing',
--     'system'
-- FROM warehouses w 
-- WHERE w.id = (SELECT MIN(id) FROM warehouses)
-- ON CONFLICT (reference_number) DO NOTHING;

-- Verify tables were created
SELECT 'stocktaking table created successfully' as status;
SELECT 'stocktaking_items table created successfully' as status;
