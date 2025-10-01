-- Complete Products Table Setup for Supabase
-- This script will create the products table with all required fields
-- and handle both scenarios: with and without reference tables

-- First, let's check if reference tables exist and create a flexible products table

-- Drop existing products table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS products CASCADE;

-- Create the products table with all required fields
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
    
    -- Categories - Using flexible approach
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

-- Create comprehensive indexes for better performance
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
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

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

-- Create a function to validate product data
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure product_name is not empty
    IF NEW.product_name IS NULL OR TRIM(NEW.product_name) = '' THEN
        RAISE EXCEPTION 'Product name cannot be empty';
    END IF;
    
    -- Ensure main_group is not empty
    IF NEW.main_group IS NULL OR TRIM(NEW.main_group) = '' THEN
        RAISE EXCEPTION 'Main group cannot be empty';
    END IF;
    
    -- Ensure unit_of_measurement is not empty
    IF NEW.unit_of_measurement IS NULL OR TRIM(NEW.unit_of_measurement) = '' THEN
        RAISE EXCEPTION 'Unit of measurement cannot be empty';
    END IF;
    
    -- Ensure stock is not negative
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot be negative';
    END IF;
    
    -- Ensure prices are not negative
    IF NEW.cost_price < 0 THEN
        RAISE EXCEPTION 'Cost price cannot be negative';
    END IF;
    
    IF NEW.selling_price < 0 THEN
        RAISE EXCEPTION 'Selling price cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
DROP TRIGGER IF EXISTS trigger_validate_product_data ON products;
CREATE TRIGGER trigger_validate_product_data
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_product_data();

-- Insert sample data for testing
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
    'High-Quality Plastic Container', 
    'HPC001', 
    '1234567890123', 
    100, 
    'Plastic Products',
    'Containers',
    'Blue',
    'HDPE',
    'pcs', 
    'Durable plastic container for industrial use', 
    12.50, 
    18.75, 
    2.5, 
    '15x25x35 cm',
    '2025-12-31',
    'SN001234567',
    'Main Warehouse, Secondary Warehouse'
),
(
    'Clear Plastic Bottle', 
    'CPB001', 
    '1234567890124', 
    200, 
    'Plastic Products',
    'Bottles',
    'Clear',
    'PET',
    'pcs', 
    'Clear plastic bottle for beverages', 
    3.50, 
    5.25, 
    0.8, 
    '10x20x30 cm',
    '2026-06-30',
    'SN001234568',
    'Main Warehouse'
),
(
    'Industrial Plastic Pipe', 
    'IPP001', 
    '1234567890125', 
    50, 
    'Plastic Products',
    'Pipes',
    'Gray',
    'PVC',
    'meters', 
    'Heavy-duty plastic pipe for industrial applications', 
    25.00, 
    35.00, 
    5.2, 
    '100x10 cm',
    NULL,
    'SN001234569',
    'Industrial Warehouse'
);

-- Create a view for easy product listing with formatted data
CREATE OR REPLACE VIEW products_view AS
SELECT 
    id,
    product_name,
    product_name_ar,
    product_code,
    barcode,
    stock_number,
    stock_number_ar,
    stock,
    main_group,
    sub_group,
    color,
    material,
    unit_of_measurement,
    description,
    description_ar,
    cost_price,
    selling_price,
    weight,
    dimensions,
    expiry_date,
    serial_number,
    warehouse,
    is_active,
    created_at,
    updated_at,
    -- Calculate profit margin
    CASE 
        WHEN cost_price > 0 THEN ROUND(((selling_price - cost_price) / cost_price) * 100, 2)
        ELSE 0
    END AS profit_margin_percent,
    -- Format prices
    CONCAT('$', cost_price::TEXT) AS cost_price_formatted,
    CONCAT('$', selling_price::TEXT) AS selling_price_formatted
FROM products
WHERE is_active = true
ORDER BY created_at DESC;

-- Grant necessary permissions
-- Note: Adjust these permissions based on your Supabase setup
-- GRANT ALL ON products TO authenticated;
-- GRANT ALL ON products TO service_role;
-- GRANT SELECT ON products_view TO authenticated;

-- Create RLS (Row Level Security) policies if needed
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (adjust based on your requirements)
-- CREATE POLICY "Users can view all products" ON products
--     FOR SELECT USING (true);

-- CREATE POLICY "Users can insert products" ON products
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Users can update products" ON products
--     FOR UPDATE USING (true);

-- CREATE POLICY "Users can delete products" ON products
--     FOR DELETE USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Products table created successfully with all required fields!';
    RAISE NOTICE 'Fields included: product_name, product_code, stock, barcode, main_group, sub_group, color, material, unit_of_measurement, description, cost_price, selling_price, weight, dimensions, expiry_date, serial_number, warehouse';
    RAISE NOTICE 'Sample data has been inserted for testing.';
    RAISE NOTICE 'You can now use this table with your Add New Product functionality.';
END $$;
