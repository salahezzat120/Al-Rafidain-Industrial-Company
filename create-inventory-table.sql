-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock_level DECIMAL(10,2) DEFAULT 0,
  maximum_stock_level DECIMAL(10,2),
  reorder_point DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

-- Insert sample inventory data for existing products
INSERT INTO inventory (product_id, warehouse_id, available_quantity, minimum_stock_level, reorder_point) VALUES
(1, 1, 100, 10, 20),
(1, 2, 50, 5, 10),
(2, 1, 75, 8, 15),
(2, 2, 25, 3, 8)
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

-- Verify inventory was created
SELECT 
  p.product_name,
  w.warehouse_name,
  i.available_quantity
FROM products p
JOIN inventory i ON p.id = i.product_id
JOIN warehouses w ON i.warehouse_id = w.id
ORDER BY p.product_name, w.warehouse_name;