-- Create delivery_tasks table
CREATE TABLE IF NOT EXISTS public.delivery_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id text NOT NULL,
  title text NOT NULL,
  description text,
  customer_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_address text NOT NULL,
  customer_phone text NOT NULL,
  representative_id text NULL,
  representative_name text NULL,
  priority text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'pending'::text,
  estimated_duration text,
  scheduled_for timestamp with time zone,
  completed_at timestamp with time zone NULL,
  total_value numeric(10, 2) DEFAULT 0.00,
  currency text DEFAULT 'IQD'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT delivery_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_tasks_task_id_key UNIQUE (task_id),
  CONSTRAINT delivery_tasks_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT delivery_tasks_representative_id_fkey FOREIGN KEY (representative_id) REFERENCES public.representatives(id),
  CONSTRAINT delivery_tasks_priority_check CHECK (
    priority = ANY (
      ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]
    )
  ),
  CONSTRAINT delivery_tasks_status_check CHECK (
    status = ANY (
      ARRAY[
        'pending'::text,
        'assigned'::text,
        'in_progress'::text,
        'completed'::text,
        'cancelled'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- Create task_items table for storing products in each delivery task
CREATE TABLE IF NOT EXISTS public.task_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  product_id integer,
  product_name text NOT NULL,
  product_code text,
  quantity numeric(10, 2) NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) DEFAULT 0.00,
  total_price numeric(10, 2) DEFAULT 0.00,
  unit_of_measurement text DEFAULT 'pcs'::text,
  warehouse_id integer,
  warehouse_name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_items_pkey PRIMARY KEY (id),
  CONSTRAINT task_items_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.delivery_tasks(id) ON DELETE CASCADE,
  CONSTRAINT task_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT task_items_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_customer_id ON public.delivery_tasks USING btree (customer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_representative_id ON public.delivery_tasks USING btree (representative_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status ON public.delivery_tasks USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_priority ON public.delivery_tasks USING btree (priority) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_scheduled_for ON public.delivery_tasks USING btree (scheduled_for) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_created_at ON public.delivery_tasks USING btree (created_at) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_task_items_task_id ON public.task_items USING btree (task_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_task_items_product_id ON public.task_items USING btree (product_id) TABLESPACE pg_default;

-- Add sample delivery tasks
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
) VALUES 
(
  'TASK-001',
  'Steel Pipes Delivery',
  'Delivery of steel pipes to construction site',
  (SELECT id FROM customers LIMIT 1),
  'Ahmed Hassan',
  'Baghdad Central District, Building 123',
  '+964-750-123-4567',
  (SELECT id FROM representatives WHERE status = 'active' LIMIT 1),
  (SELECT name FROM representatives WHERE status = 'active' LIMIT 1),
  'high',
  'pending',
  '2 hours',
  NOW() + INTERVAL '1 day',
  150000.00,
  'IQD',
  'Handle with care - fragile items'
),
(
  'TASK-002',
  'Aluminum Sheets Delivery',
  'Delivery of aluminum sheets to warehouse',
  (SELECT id FROM customers LIMIT 1),
  'Sarah Johnson',
  'Basra Warehouse Area, Zone A',
  '+964-750-234-5678',
  (SELECT id FROM representatives WHERE status = 'active' LIMIT 1 OFFSET 1),
  (SELECT name FROM representatives WHERE status = 'active' LIMIT 1 OFFSET 1),
  'medium',
  'assigned',
  '1.5 hours',
  NOW() + INTERVAL '2 days',
  75000.00,
  'IQD',
  'Priority delivery for urgent project'
),
(
  'TASK-003',
  'Electrical Components',
  'Delivery of electrical components to factory',
  (SELECT id FROM customers LIMIT 1),
  'Mohammed Ali',
  'Erbil Distribution Center, Block B',
  '+964-750-345-6789',
  NULL,
  NULL,
  'low',
  'pending',
  '1 hour',
  NOW() + INTERVAL '3 days',
  25000.00,
  'IQD',
  'Standard delivery'
);

-- Add sample task items
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
) VALUES 
(
  (SELECT id FROM delivery_tasks WHERE task_id = 'TASK-001'),
  (SELECT id FROM products WHERE product_code = 'SP-006'),
  'Steel Pipes 6 inch',
  'SP-006',
  5,
  30000.00,
  150000.00,
  'pcs',
  'Main Warehouse'
),
(
  (SELECT id FROM delivery_tasks WHERE task_id = 'TASK-002'),
  (SELECT id FROM products WHERE product_code = 'AS-003'),
  'Aluminum Sheets 3mm',
  'AS-003',
  10,
  7500.00,
  75000.00,
  'pcs',
  'Main Warehouse'
),
(
  (SELECT id FROM delivery_tasks WHERE task_id = 'TASK-003'),
  (SELECT id FROM products WHERE product_code = 'CW-025'),
  'Copper Wire 2.5mm',
  'CW-025',
  100,
  250.00,
  25000.00,
  'meters',
  'Main Warehouse'
);

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

-- Show task items
SELECT 
  ti.task_id,
  ti.product_name,
  ti.quantity,
  ti.unit_price,
  ti.total_price,
  dt.title as task_title
FROM task_items ti
JOIN delivery_tasks dt ON ti.task_id = dt.id
ORDER BY ti.created_at DESC;
