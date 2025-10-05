-- Complete Visit Management Table Setup
-- This script creates the visit_management table with all required fields and constraints

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS visit_management CASCADE;

-- Create the visit_management table with all fields
CREATE TABLE public.visit_management (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id text NOT NULL,
  delegate_id text NOT NULL,
  delegate_name text NOT NULL,
  delegate_email text NULL,
  delegate_phone text NULL,
  delegate_role text NOT NULL,
  delegate_status text NOT NULL DEFAULT 'available'::text,
  customer_id text NOT NULL,
  customer_name text NOT NULL,
  customer_address text NOT NULL,
  customer_phone text NULL,
  customer_email text NULL,
  scheduled_start_time timestamp with time zone NOT NULL,
  scheduled_end_time timestamp with time zone NOT NULL,
  actual_start_time timestamp with time zone NULL,
  actual_end_time timestamp with time zone NULL,
  visit_type text NOT NULL DEFAULT 'delivery'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'scheduled'::text,
  allowed_duration_minutes integer NOT NULL DEFAULT 60,
  is_late boolean NULL DEFAULT false,
  exceeds_time_limit boolean NULL DEFAULT false,
  notes text NULL,
  alert_type text NULL,
  alert_severity text NULL,
  alert_message text NULL,
  is_alert_read boolean NULL DEFAULT false,
  admin_notified boolean NULL DEFAULT false,
  internal_message text NULL,
  message_type text NULL,
  message_priority text NULL DEFAULT 'medium'::text,
  is_message_read boolean NULL DEFAULT false,
  chat_message text NULL,
  chat_sender_id text NULL,
  chat_sender_name text NULL,
  chat_sender_role text NULL,
  chat_message_type text NULL,
  current_location text NULL,
  coverage_areas text[] NULL DEFAULT '{}'::text[],
  transportation_type text NULL DEFAULT 'foot'::text,
  license_number text NULL,
  emergency_contact text NULL,
  vehicle text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  read_at timestamp with time zone NULL,
  CONSTRAINT visit_management_pkey PRIMARY KEY (id),
  CONSTRAINT visit_management_visit_id_key UNIQUE (visit_id),
  CONSTRAINT visit_management_chat_message_type_check CHECK (
    (chat_message_type = ANY (ARRAY['user'::text, 'bot'::text]))
  ),
  CONSTRAINT visit_management_delegate_role_check CHECK (
    (delegate_role = ANY (ARRAY[
      'driver'::text,
      'representative'::text,
      'supervisor'::text,
      'technician'::text,
      'sales_rep'::text
    ]))
  ),
  CONSTRAINT visit_management_delegate_status_check CHECK (
    (delegate_status = ANY (ARRAY[
      'available'::text,
      'busy'::text,
      'offline'::text,
      'on_visit'::text,
      'active'::text,
      'inactive'::text,
      'on-route'::text
    ]))
  ),
  CONSTRAINT visit_management_message_priority_check CHECK (
    (message_priority = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'urgent'::text
    ]))
  ),
  CONSTRAINT visit_management_message_type_check CHECK (
    (message_type = ANY (ARRAY[
      'text'::text,
      'system_alert'::text,
      'visit_update'::text,
      'urgent'::text
    ]))
  ),
  CONSTRAINT visit_management_priority_check CHECK (
    (priority = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'urgent'::text
    ]))
  ),
  CONSTRAINT visit_management_status_check CHECK (
    (status = ANY (ARRAY[
      'scheduled'::text,
      'in_progress'::text,
      'completed'::text,
      'cancelled'::text,
      'late'::text
    ]))
  ),
  CONSTRAINT visit_management_transportation_type_check CHECK (
    (transportation_type = ANY (ARRAY['foot'::text, 'vehicle'::text]))
  ),
  CONSTRAINT visit_management_alert_severity_check CHECK (
    (alert_severity = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'critical'::text
    ]))
  ),
  CONSTRAINT visit_management_visit_type_check CHECK (
    (visit_type = ANY (ARRAY[
      'delivery'::text,
      'pickup'::text,
      'inspection'::text,
      'maintenance'::text,
      'meeting'::text
    ]))
  ),
  CONSTRAINT visit_management_alert_type_check CHECK (
    (alert_type = ANY (ARRAY[
      'late_arrival'::text,
      'time_exceeded'::text,
      'no_show'::text,
      'early_completion'::text
    ]))
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visit_management_visit_id ON public.visit_management USING btree (visit_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_delegate_id ON public.visit_management USING btree (delegate_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_customer_id ON public.visit_management USING btree (customer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_status ON public.visit_management USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_visit_type ON public.visit_management USING btree (visit_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_priority ON public.visit_management USING btree (priority) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_scheduled_start_time ON public.visit_management USING btree (scheduled_start_time) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_created_at ON public.visit_management USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_alert_type ON public.visit_management USING btree (alert_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_is_alert_read ON public.visit_management USING btree (is_alert_read) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_is_late ON public.visit_management USING btree (is_late) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_is_message_read ON public.visit_management USING btree (is_message_read) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_visit_management_chat_sender_id ON public.visit_management USING btree (chat_sender_id) TABLESPACE pg_default;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_visit_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_visit_management_updated_at
  BEFORE UPDATE ON visit_management
  FOR EACH ROW
  EXECUTE FUNCTION update_visit_management_updated_at();

-- Insert sample data to test the table
INSERT INTO public.visit_management (
  visit_id,
  delegate_id,
  delegate_name,
  delegate_email,
  delegate_phone,
  delegate_role,
  delegate_status,
  customer_id,
  customer_name,
  customer_address,
  customer_phone,
  customer_email,
  scheduled_start_time,
  scheduled_end_time,
  visit_type,
  priority,
  status,
  allowed_duration_minutes,
  notes
) VALUES (
  'V705613662',
  'REP-263338',
  'maged',
  'salahezzat120@gmail.com',
  '+201022505987',
  'representative',
  'available',
  'C001',
  'salah ezzat',
  'sssssssssss',
  '+20459083040',
  'salahezzat120@gmail.com',
  '2025-10-05 02:37:00+00',
  '2025-10-05 03:37:00+00',
  'delivery',
  'medium',
  'scheduled',
  60,
  'Sample visit for testing'
);

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'visit_management' 
ORDER BY ordinal_position;

-- Test query to verify data can be inserted and retrieved
SELECT 
  visit_id,
  delegate_name,
  customer_name,
  visit_type,
  priority,
  status,
  scheduled_start_time,
  scheduled_end_time
FROM public.visit_management
WHERE visit_id = 'V705613662';

-- Success message
SELECT 'Visit Management table created successfully with all required fields and constraints!' as status;
