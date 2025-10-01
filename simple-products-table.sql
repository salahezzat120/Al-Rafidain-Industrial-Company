-- Simple Products Table for Supabase (No Foreign Keys)
-- This version stores category information as strings instead of foreign keys
-- Use this if you don't have the reference tables (main_groups, sub_groups, etc.)

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
    
    -- Categories (stored as strings for simplicity)
    main_group VARCHAR(100) NOT NULL,
    sub_group VARCHAR(100),
    color VARCHAR(50),
    material VARCHAR(50),
    unit_of_measurement VARCHAR(20) NOT NULL,
    
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
CREATE INDEX IF NOT EXISTS idx_products_main_group ON products(main_group);
CREATE INDEX IF NOT EXISTS idx_products_sub_group ON products(sub_group);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_of_measurement);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_warehouse ON products(warehouse);

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

-- Insert some sample data for testing
INSERT INTO products (
    product_name, 
    product_code, 
    barcode, 
    stock, 
    main_group, 
    sub_group,
    color,
    material,
    unit_of_measurement, 
    description, 
    cost_price, 
    selling_price, 
    weight, 
    dimensions, 
    expiry_date,
    serial_number,
    warehouse
) VALUES 
(
    'Sample Plastic Product 1', 
    'SPP001', 
    '1234567890123', 
    100, 
    'Plastic Products',
    'Containers',
    'Blue',
    'HDPE',
    'pcs', 
    'High-quality plastic container', 
    10.50, 
    15.75, 
    2.5, 
    '10x20x30 cm',
    '2025-12-31',
    'SN001234567',
    'Main Warehouse, Secondary Warehouse'
),
(
    'Sample Plastic Product 2', 
    'SPP002', 
    '1234567890124', 
    50, 
    'Plastic Products',
    'Bottles',
    'Clear',
    'PET',
    'pcs', 
    'Clear plastic bottle', 
    5.00, 
    8.50, 
    0.5, 
    '8x15x25 cm',
    '2026-06-30',
    'SN001234568',
    'Main Warehouse'
);

-- Grant necessary permissions (adjust as needed for your Supabase setup)
-- GRANT ALL ON products TO authenticated;
-- GRANT ALL ON products TO service_role;
