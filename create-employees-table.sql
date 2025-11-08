-- Create employees table with all required fields
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  hire_date date NOT NULL,
  salary numeric(10, 2) NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'active'::text,
  avatar_url text NULL,
  address text NULL,
  emergency_contact_name text NULL,
  emergency_contact_phone text NULL,
  can_manage_customers boolean NULL DEFAULT false,
  can_manage_drivers boolean NULL DEFAULT false,
  can_manage_vehicles boolean NULL DEFAULT false,
  can_view_analytics boolean NULL DEFAULT false,
  can_manage_employees boolean NULL DEFAULT false,
  can_manage_orders boolean NULL DEFAULT false,
  can_manage_visits boolean NULL DEFAULT false,
  can_manage_after_sales boolean NULL DEFAULT false,
  total_work_days integer NULL DEFAULT 0,
  total_absent_days integer NULL DEFAULT 0,
  total_late_days integer NULL DEFAULT 0,
  last_attendance_date date NULL,
  performance_rating numeric(3, 2) NULL DEFAULT 0.00,
  monthly_goals_completed integer NULL DEFAULT 0,
  monthly_goals_total integer NULL DEFAULT 0,
  last_performance_review date NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_email_key UNIQUE (email),
  CONSTRAINT employees_employee_id_key UNIQUE (employee_id),
  CONSTRAINT employees_performance_rating_check CHECK (
    (
      (performance_rating >= (0)::numeric)
      AND (performance_rating <= (5)::numeric)
    )
  ),
  CONSTRAINT employees_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'active'::text,
          'inactive'::text,
          'suspended'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees USING btree (employee_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees USING btree (email) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees USING btree (department) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees USING btree (position) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_employees_created_at ON public.employees USING btree (created_at) TABLESPACE pg_default;

-- Create or replace the trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at column
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_employees_updated_at();

-- Grant permissions
GRANT ALL ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;

-- Enable Row Level Security (RLS) if needed
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read employees
CREATE POLICY "Allow authenticated users to read employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert employees
CREATE POLICY "Allow authenticated users to insert employees"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update employees
CREATE POLICY "Allow authenticated users to update employees"
  ON public.employees
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete employees
CREATE POLICY "Allow authenticated users to delete employees"
  ON public.employees
  FOR DELETE
  TO authenticated
  USING (true);



