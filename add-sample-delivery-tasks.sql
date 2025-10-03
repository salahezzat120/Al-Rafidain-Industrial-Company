-- Add sample delivery tasks (only run this if you have customers and representatives)
-- This script will only work if you have data in your customers and representatives tables

-- Check if we have the required data
DO $$
DECLARE
    customer_count INTEGER;
    representative_count INTEGER;
BEGIN
    -- Check if we have customers
    SELECT COUNT(*) INTO customer_count FROM customers;
    -- Check if we have representatives
    SELECT COUNT(*) INTO representative_count FROM representatives;
    
    IF customer_count = 0 THEN
        RAISE NOTICE 'No customers found. Please add customers first.';
        RETURN;
    END IF;
    
    IF representative_count = 0 THEN
        RAISE NOTICE 'No representatives found. Please add representatives first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % customers and % representatives. Adding sample delivery tasks...', customer_count, representative_count;
END $$;

-- Add sample delivery tasks only if we have the required data
INSERT INTO delivery_tasks (
  task_id,
  title,
  description,
  customer_id,
  customer_name,
  customer_address,
  customer_phone,
  representative_id,
  representative_name,
  priority,
  status,
  estimated_duration,
  scheduled_for,
  total_value,
  currency,
  notes
) 
SELECT 
  'TASK-001',
  'Steel Pipes Delivery',
  'Delivery of steel pipes to construction site',
  c.id,
  c.name,
  c.address,
  c.phone,
  r.id,
  r.name,
  'high',
  'pending',
  '2 hours',
  NOW() + INTERVAL '1 day',
  150000.00,
  'IQD',
  'Handle with care - fragile items'
FROM customers c, representatives r
WHERE c.status = 'active' AND r.status = 'active'
LIMIT 1;

INSERT INTO delivery_tasks (
  task_id,
  title,
  description,
  customer_id,
  customer_name,
  customer_address,
  customer_phone,
  representative_id,
  representative_name,
  priority,
  status,
  estimated_duration,
  scheduled_for,
  total_value,
  currency,
  notes
) 
SELECT 
  'TASK-002',
  'Aluminum Sheets Delivery',
  'Delivery of aluminum sheets to warehouse',
  c.id,
  c.name,
  c.address,
  c.phone,
  r.id,
  r.name,
  'medium',
  'assigned',
  '1.5 hours',
  NOW() + INTERVAL '2 days',
  75000.00,
  'IQD',
  'Priority delivery for urgent project'
FROM customers c, representatives r
WHERE c.status = 'active' AND r.status = 'active'
LIMIT 1 OFFSET 1;

INSERT INTO delivery_tasks (
  task_id,
  title,
  description,
  customer_id,
  customer_name,
  customer_address,
  customer_phone,
  representative_id,
  representative_name,
  priority,
  status,
  estimated_duration,
  scheduled_for,
  total_value,
  currency,
  notes
) 
SELECT 
  'TASK-003',
  'Electrical Components',
  'Delivery of electrical components to factory',
  c.id,
  c.name,
  c.address,
  c.phone,
  NULL,
  NULL,
  'low',
  'pending',
  '1 hour',
  NOW() + INTERVAL '3 days',
  25000.00,
  'IQD',
  'Standard delivery'
FROM customers c
WHERE c.status = 'active'
LIMIT 1;

-- Add sample task items (only if we have products)
INSERT INTO task_items (
  task_id,
  product_id,
  product_name,
  product_code,
  quantity,
  unit_price,
  total_price,
  unit_of_measurement,
  warehouse_name
) 
SELECT 
  dt.id,
  p.id,
  p.product_name,
  p.product_code,
  5,
  30000.00,
  150000.00,
  p.unit,
  'Main Warehouse'
FROM delivery_tasks dt, products p
WHERE dt.task_id = 'TASK-001' AND p.is_active = true
LIMIT 1;

INSERT INTO task_items (
  task_id,
  product_id,
  product_name,
  product_code,
  quantity,
  unit_price,
  total_price,
  unit_of_measurement,
  warehouse_name
) 
SELECT 
  dt.id,
  p.id,
  p.product_name,
  p.product_code,
  10,
  7500.00,
  75000.00,
  p.unit,
  'Main Warehouse'
FROM delivery_tasks dt, products p
WHERE dt.task_id = 'TASK-002' AND p.is_active = true
LIMIT 1;

INSERT INTO task_items (
  task_id,
  product_id,
  product_name,
  product_code,
  quantity,
  unit_price,
  total_price,
  unit_of_measurement,
  warehouse_name
) 
SELECT 
  dt.id,
  p.id,
  p.product_name,
  p.product_code,
  100,
  250.00,
  25000.00,
  p.unit,
  'Main Warehouse'
FROM delivery_tasks dt, products p
WHERE dt.task_id = 'TASK-003' AND p.is_active = true
LIMIT 1;

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
FROM delivery_tasks;

-- Show sample of inserted tasks
SELECT 
  task_id,
  title,
  customer_name,
  representative_name,
  priority,
  status,
  scheduled_for,
  total_value
FROM delivery_tasks 
ORDER BY created_at DESC
LIMIT 5;


