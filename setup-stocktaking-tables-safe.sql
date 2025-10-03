-- Setup Stocktaking Tables for Supabase - Safe Version
-- This script checks for existing warehouses before creating foreign key constraints

-- First, check if warehouses table exists and has data
DO $$
BEGIN
    -- Check if warehouses table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        RAISE EXCEPTION 'Warehouses table does not exist. Please create warehouses first.';
    END IF;
    
    -- Check if warehouses table has data
    IF NOT EXISTS (SELECT 1 FROM warehouses LIMIT 1) THEN
        RAISE EXCEPTION 'No warehouses found. Please add warehouses first.';
    END IF;
    
    RAISE NOTICE 'Warehouses table exists and has data. Proceeding with stocktaking table creation.';
END $$;

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

-- Add foreign key constraints only if warehouses exist
DO $$
BEGIN
    -- Add warehouse foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocktaking_warehouse_id_fkey'
    ) THEN
        ALTER TABLE stocktaking 
        ADD CONSTRAINT stocktaking_warehouse_id_fkey 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);
        RAISE NOTICE 'Added foreign key constraint for warehouse_id';
    END IF;
END $$;

-- Add other foreign key constraints
ALTER TABLE stocktaking_items 
ADD CONSTRAINT stocktaking_items_stocktaking_id_fkey 
FOREIGN KEY (stocktaking_id) REFERENCES stocktaking(id) ON DELETE CASCADE;

ALTER TABLE stocktaking_items 
ADD CONSTRAINT stocktaking_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Enable Row Level Security (RLS)
ALTER TABLE stocktaking ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktaking_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON stocktaking
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON stocktaking_items
FOR ALL USING (auth.role() = 'authenticated');

-- Show available warehouses
SELECT 'Available warehouses:' as info;
SELECT id, warehouse_name, warehouse_name_ar FROM warehouses ORDER BY id;

-- Verify tables were created
SELECT 'stocktaking table created successfully' as status;
SELECT 'stocktaking_items table created successfully' as status;
