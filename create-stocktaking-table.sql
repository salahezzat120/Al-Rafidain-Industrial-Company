-- Create stocktaking table if it doesn't exist
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

-- Create stocktaking_items table if it doesn't exist
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

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add warehouse_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocktaking_warehouse_id_fkey'
    ) THEN
        ALTER TABLE stocktaking 
        ADD CONSTRAINT stocktaking_warehouse_id_fkey 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);
    END IF;

    -- Add stocktaking_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocktaking_items_stocktaking_id_fkey'
    ) THEN
        ALTER TABLE stocktaking_items 
        ADD CONSTRAINT stocktaking_items_stocktaking_id_fkey 
        FOREIGN KEY (stocktaking_id) REFERENCES stocktaking(id) ON DELETE CASCADE;
    END IF;

    -- Add product_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocktaking_items_product_id_fkey'
    ) THEN
        ALTER TABLE stocktaking_items 
        ADD CONSTRAINT stocktaking_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id);
    END IF;
END $$;
