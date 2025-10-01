-- Remove barcode column from products table
-- This script will drop the barcode column from the products table

-- First, check if the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'barcode';

-- Drop the barcode column
ALTER TABLE products DROP COLUMN IF EXISTS barcode;

-- Verify the column has been removed
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
