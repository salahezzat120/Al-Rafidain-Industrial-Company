-- Add stock_number field to products table
-- This script adds a stock_number field similar to inventory tracking

-- Add stock_number column to products table
ALTER TABLE products 
ADD COLUMN stock_number VARCHAR(100);

-- Add Arabic version for bilingual support
ALTER TABLE products 
ADD COLUMN stock_number_ar VARCHAR(100);

-- Add index for better performance on stock number searches
CREATE INDEX idx_products_stock_number ON products(stock_number);

-- Add unique constraint to ensure stock numbers are unique
ALTER TABLE products 
ADD CONSTRAINT unique_stock_number UNIQUE (stock_number);

-- Update existing products with generated stock numbers if they don't have them
-- This will generate stock numbers in format: STK-{product_id}-{timestamp}
UPDATE products 
SET stock_number = 'STK-' || id || '-' || EXTRACT(EPOCH FROM created_at)::INTEGER
WHERE stock_number IS NULL;

-- Verify the changes
SELECT 
    id,
    product_name,
    product_code,
    stock_number,
    stock_number_ar,
    created_at
FROM products 
ORDER BY id
LIMIT 10;
