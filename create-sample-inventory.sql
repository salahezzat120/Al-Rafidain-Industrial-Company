-- Create sample inventory records for existing products
-- This will make the warehouse information appear in the products table

-- First, let's see what products and warehouses we have
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'Inventory', COUNT(*) FROM inventory;

-- Create inventory records for all products in all warehouses
INSERT INTO inventory (product_id, warehouse_id, available_quantity, minimum_stock_level, reorder_point)
SELECT 
  p.id as product_id,
  w.id as warehouse_id,
  CASE 
    WHEN p.id = 1 THEN 100  -- First product gets 100 units
    WHEN p.id = 2 THEN 50   -- Second product gets 50 units
    ELSE 25                 -- Other products get 25 units
  END as available_quantity,
  10 as minimum_stock_level,
  20 as reorder_point
FROM products p
CROSS JOIN warehouses w
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

-- Verify the inventory was created
SELECT 
  p.product_name,
  w.warehouse_name,
  i.available_quantity,
  i.minimum_stock_level
FROM products p
JOIN inventory i ON p.id = i.product_id
JOIN warehouses w ON i.warehouse_id = w.id
ORDER BY p.product_name, w.warehouse_name;

-- Test the products with inventory query
SELECT 
  p.product_name,
  p.product_code,
  COUNT(i.id) as inventory_count,
  STRING_AGG(w.warehouse_name || ' (' || i.available_quantity || ')', ', ') as warehouses
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN warehouses w ON i.warehouse_id = w.id
GROUP BY p.id, p.product_name, p.product_code
ORDER BY p.product_name;
