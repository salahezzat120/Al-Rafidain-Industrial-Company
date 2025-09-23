-- Add price columns to products table
-- Run this in your Supabase SQL Editor

-- Add cost_price column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);

-- Add selling_price column  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2);

-- Add comments to describe the columns
COMMENT ON COLUMN products.cost_price IS 'The cost price of the product for inventory valuation';
COMMENT ON COLUMN products.selling_price IS 'The selling price of the product for sales';

-- Update existing products with default prices (optional)
-- You can modify these values as needed
UPDATE products 
SET cost_price = 0.00, selling_price = 0.00 
WHERE cost_price IS NULL OR selling_price IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('cost_price', 'selling_price');
