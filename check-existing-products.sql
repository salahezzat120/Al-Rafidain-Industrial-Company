-- Check if there are existing products in the products table
-- This will help us see what data is already available

-- Check total count of products
SELECT COUNT(*) as total_products FROM products;

-- Check active products with stock
SELECT COUNT(*) as active_products_with_stock 
FROM products 
WHERE is_active = true AND stock > 0;

-- Show sample of existing products
SELECT 
  id,
  product_name,
  product_code,
  stock,
  main_group,
  sub_group,
  color,
  material,
  unit,
  cost_price,
  selling_price,
  warehouses,
  is_active,
  created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Check products that would appear in delivery task form
SELECT 
  id,
  product_name,
  product_code,
  stock,
  main_group,
  unit,
  selling_price,
  warehouses
FROM products 
WHERE is_active = true 
  AND stock > 0
ORDER BY product_name;
