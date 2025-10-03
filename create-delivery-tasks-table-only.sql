-- Create delivery_tasks table (without sample data to avoid foreign key issues)
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

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('delivery_tasks', 'task_items')
ORDER BY table_name, ordinal_position;

