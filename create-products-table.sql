-- Create products table with all fields
-- This table stores product information without foreign key dependencies

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    
    -- Basic Product Information
    product_name VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255),
    product_code VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    stock_number VARCHAR(100),
    stock_number_ar VARCHAR(100),
    
    -- Categories (stored as strings, no foreign keys)
    main_group VARCHAR(100) NOT NULL,
    sub_group VARCHAR(100),
    color VARCHAR(50),
    material VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    
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
    
    -- Warehouse Assignment
    warehouses TEXT, -- comma-separated warehouse names
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_main_group ON products(main_group);
CREATE INDEX IF NOT EXISTS idx_products_sub_group ON products(sub_group);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO products (
    product_name,
    product_name_ar,
    product_code,
    main_group,
    sub_group,
    color,
    material,
    unit,
    description,
    cost_price,
    selling_price,
    weight,
    dimensions,
    warehouses,
    is_active
) VALUES 
(
    'Plastic Chair',
    'كرسي بلاستيك',
    'PC-001',
    'Furniture',
    'Chairs',
    'Black',
    'Plastic',
    'pcs',
    'High-quality plastic chair for office use',
    25.00,
    45.00,
    2.5,
    '40x40x80 cm',
    'Main Warehouse,Storage Room',
    true
),
(
    'Plastic Table',
    'طاولة بلاستيك',
    'PT-001',
    'Furniture',
    'Tables',
    'White',
    'Plastic',
    'pcs',
    'Durable plastic table for various uses',
    50.00,
    85.00,
    8.0,
    '120x60x75 cm',
    'Main Warehouse',
    true
),
(
    'Plastic Container',
    'حاوية بلاستيك',
    'PC-002',
    'Storage',
    'Containers',
    'Blue',
    'Plastic',
    'pcs',
    'Large plastic storage container',
    15.00,
    28.00,
    1.2,
    '50x30x20 cm',
    'Storage Room,Warehouse B',
    true
);

-- Create a view for easy querying with formatted data
CREATE OR REPLACE VIEW products_view AS
SELECT 
    id,
    product_name,
    product_name_ar,
    product_code,
    barcode,
    stock_number,
    stock_number_ar,
    main_group,
    sub_group,
    color,
    material,
    unit,
    description,
    description_ar,
    cost_price,
    selling_price,
    weight,
    dimensions,
    expiry_date,
    serial_number,
    warehouses,
    is_active,
    created_at,
    updated_at,
    -- Calculated fields
    CASE 
        WHEN cost_price > 0 AND selling_price > 0 
        THEN ROUND(((selling_price - cost_price) / cost_price) * 100, 2)
        ELSE 0 
    END AS profit_margin_percent,
    -- Split warehouses into array for easier querying
    CASE 
        WHEN warehouses IS NOT NULL AND warehouses != '' 
        THEN string_to_array(warehouses, ',')
        ELSE ARRAY[]::text[]
    END AS warehouse_list
FROM products;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON products TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO your_app_user;

-- Add comments to the table and columns for documentation
COMMENT ON TABLE products IS 'Products table storing all product information without foreign key dependencies';
COMMENT ON COLUMN products.product_name IS 'Product name in English';
COMMENT ON COLUMN products.product_name_ar IS 'Product name in Arabic';
COMMENT ON COLUMN products.product_code IS 'Unique product code/identifier';
COMMENT ON COLUMN products.main_group IS 'Main product category (stored as string)';
COMMENT ON COLUMN products.sub_group IS 'Sub product category (stored as string)';
COMMENT ON COLUMN products.color IS 'Product color (stored as string)';
COMMENT ON COLUMN products.material IS 'Product material (stored as string)';
COMMENT ON COLUMN products.unit IS 'Unit of measurement (e.g., pcs, kg, m)';
COMMENT ON COLUMN products.warehouses IS 'Comma-separated list of warehouse names where product is stored';
COMMENT ON COLUMN products.specifications IS 'JSON object containing additional product specifications';
COMMENT ON COLUMN products.weight IS 'Product weight in kilograms';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions (e.g., 10x20x30 cm)';
COMMENT ON COLUMN products.expiry_date IS 'Product expiry date (if applicable)';
COMMENT ON COLUMN products.serial_number IS 'Product serial number';
COMMENT ON COLUMN products.is_active IS 'Whether the product is active/available';