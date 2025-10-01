-- Complete Products Table for Supabase
-- This table includes all the fields requested for the Add New Product functionality

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    
    -- Basic Product Information
    product_name VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255),
    product_code VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    stock_number VARCHAR(100),
    stock_number_ar VARCHAR(100),
    
    -- Stock Information
    stock DECIMAL(10,2) DEFAULT 0,
    
    -- Categories (using foreign keys for better data integrity)
    main_group_id INTEGER NOT NULL,
    sub_group_id INTEGER,
    color_id INTEGER,
    material_id INTEGER,
    unit_of_measurement_id INTEGER NOT NULL,
    
    -- Product Details
    description TEXT,
    description_ar TEXT,
    specifications JSONB,
    
    -- Pricing
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    
    -- Physical Properties
    weight DECIMAL(8,2), -- in kg
    dimensions VARCHAR(100), -- e.g., "10x20x30 cm"
    
    -- Product Lifecycle
    expiry_date DATE,
    serial_number VARCHAR(100),
    
    -- Warehouse Assignment (comma-separated warehouse names)
    warehouse VARCHAR(500),
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_stock_number ON products(stock_number);
CREATE INDEX IF NOT EXISTS idx_products_main_group ON products(main_group_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_group ON products(sub_group_id);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color_id);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material_id);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_of_measurement_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_warehouse ON products(warehouse);

-- Add foreign key constraints if the reference tables exist
-- Note: These will only be added if the referenced tables exist

-- Add foreign key for main_group_id if main_groups table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'main_groups') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_main_group 
        FOREIGN KEY (main_group_id) REFERENCES main_groups(id);
    END IF;
END $$;

-- Add foreign key for sub_group_id if sub_groups table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_groups') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_sub_group 
        FOREIGN KEY (sub_group_id) REFERENCES sub_groups(id);
    END IF;
END $$;

-- Add foreign key for color_id if colors table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colors') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_color 
        FOREIGN KEY (color_id) REFERENCES colors(id);
    END IF;
END $$;

-- Add foreign key for material_id if materials table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_material 
        FOREIGN KEY (material_id) REFERENCES materials(id);
    END IF;
END $$;

-- Add foreign key for unit_of_measurement_id if units_of_measurement table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units_of_measurement') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_unit 
        FOREIGN KEY (unit_of_measurement_id) REFERENCES units_of_measurement(id);
    END IF;
END $$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Insert some sample data for testing (optional)
-- You can uncomment this section if you want sample data

/*
INSERT INTO products (
    product_name, 
    product_code, 
    barcode, 
    stock, 
    main_group_id, 
    unit_of_measurement_id, 
    description, 
    cost_price, 
    selling_price, 
    weight, 
    dimensions, 
    warehouse
) VALUES 
(
    'Sample Product 1', 
    'SP001', 
    '1234567890123', 
    100, 
    1, 
    1, 
    'This is a sample product', 
    10.50, 
    15.75, 
    2.5, 
    '10x20x30 cm', 
    'Main Warehouse'
),
(
    'Sample Product 2', 
    'SP002', 
    '1234567890124', 
    50, 
    1, 
    1, 
    'Another sample product', 
    25.00, 
    35.00, 
    1.8, 
    '15x25x35 cm', 
    'Secondary Warehouse'
);
*/

-- Grant necessary permissions (adjust as needed for your Supabase setup)
-- GRANT ALL ON products TO authenticated;
-- GRANT ALL ON products TO service_role;
