-- Unified Alerts & Notifications System Table
-- This table handles all alert types across all tabs: Active Alerts, Visit Alerts, Late Visit Monitoring, Resolved, and Settings

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS unified_alerts_notifications CASCADE;

-- Create the unified alerts and notifications table
CREATE TABLE public.unified_alerts_notifications (
  -- Primary identification
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alert_id text NOT NULL UNIQUE, -- Custom alert ID like ALERT_001, ALERT_002
  
  -- Alert classification
  alert_type text NOT NULL DEFAULT 'system'::text, -- 'system', 'visit', 'late_visit', 'vehicle', 'delivery', 'warehouse', 'maintenance'
  category text NOT NULL DEFAULT 'general'::text, -- 'general', 'critical', 'warning', 'info', 'success'
  severity text NOT NULL DEFAULT 'medium'::text, -- 'low', 'medium', 'high', 'critical', 'urgent'
  priority text NOT NULL DEFAULT 'medium'::text, -- 'low', 'medium', 'high', 'critical'
  
  -- Alert content
  title text NOT NULL,
  message text NOT NULL,
  description text NULL,
  
  -- Status and resolution
  status text NOT NULL DEFAULT 'active'::text, -- 'active', 'resolved', 'dismissed', 'escalated'
  is_read boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamp with time zone NULL,
  resolved_by text NULL,
  dismissed_at timestamp with time zone NULL,
  dismissed_by text NULL,
  
  -- Related entities
  visit_id text NULL,
  delegate_id text NULL,
  delegate_name text NULL,
  delegate_phone text NULL,
  delegate_email text NULL,
  customer_id text NULL,
  customer_name text NULL,
  customer_address text NULL,
  vehicle_id text NULL,
  vehicle_plate text NULL,
  driver_name text NULL,
  driver_phone text NULL,
  
  -- Location and timing
  location text NULL,
  scheduled_time timestamp with time zone NULL,
  actual_time timestamp with time zone NULL,
  delay_minutes integer NULL,
  grace_period_minutes integer NULL DEFAULT 10,
  escalation_threshold_minutes integer NULL DEFAULT 30,
  
  -- Monitoring and escalation
  escalation_level text NULL DEFAULT 'initial'::text, -- 'initial', 'escalated', 'critical'
  escalation_count integer NOT NULL DEFAULT 0,
  last_escalated_at timestamp with time zone NULL,
  escalation_notes text NULL,
  
  -- Notification settings
  notify_admins boolean NOT NULL DEFAULT true,
  notify_supervisors boolean NOT NULL DEFAULT false,
  send_push_notification boolean NOT NULL DEFAULT true,
  send_email_notification boolean NOT NULL DEFAULT false,
  send_sms_notification boolean NOT NULL DEFAULT false,
  
  -- Notification delivery tracking
  admin_notified boolean NOT NULL DEFAULT false,
  supervisor_notified boolean NOT NULL DEFAULT false,
  push_sent boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  sms_sent boolean NOT NULL DEFAULT false,
  notification_sent_at timestamp with time zone NULL,
  
  -- Alert metadata
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  tags text[] NULL DEFAULT '{}'::text[],
  source_system text NULL, -- 'visit_management', 'vehicle_tracking', 'warehouse', 'delivery_system'
  
  -- User interaction
  created_by text NULL,
  assigned_to text NULL,
  acknowledged_by text NULL,
  acknowledged_at timestamp with time zone NULL,
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NULL,
  
  -- Constraints
  CONSTRAINT unified_alerts_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT unified_alerts_notifications_alert_type_check CHECK (
    alert_type = ANY (ARRAY[
      'system'::text,
      'visit'::text,
      'late_visit'::text,
      'vehicle'::text,
      'delivery'::text,
      'warehouse'::text,
      'maintenance'::text,
      'stock'::text,
      'user'::text
    ])
  ),
  CONSTRAINT unified_alerts_notifications_category_check CHECK (
    category = ANY (ARRAY[
      'general'::text,
      'critical'::text,
      'warning'::text,
      'info'::text,
      'success'::text,
      'urgent'::text
    ])
  ),
  CONSTRAINT unified_alerts_notifications_severity_check CHECK (
    severity = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'critical'::text,
      'urgent'::text
    ])
  ),
  CONSTRAINT unified_alerts_notifications_priority_check CHECK (
    priority = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'critical'::text
    ])
  ),
  CONSTRAINT unified_alerts_notifications_status_check CHECK (
    status = ANY (ARRAY[
      'active'::text,
      'resolved'::text,
      'dismissed'::text,
      'escalated'::text,
      'archived'::text
    ])
  ),
  CONSTRAINT unified_alerts_notifications_escalation_level_check CHECK (
    escalation_level = ANY (ARRAY[
      'initial'::text,
      'escalated'::text,
      'critical'::text
    ])
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unified_alerts_alert_id ON public.unified_alerts_notifications USING btree (alert_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_alert_type ON public.unified_alerts_notifications USING btree (alert_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_category ON public.unified_alerts_notifications USING btree (category) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_severity ON public.unified_alerts_notifications USING btree (severity) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_status ON public.unified_alerts_notifications USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_is_read ON public.unified_alerts_notifications USING btree (is_read) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_is_resolved ON public.unified_alerts_notifications USING btree (is_resolved) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_visit_id ON public.unified_alerts_notifications USING btree (visit_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_delegate_id ON public.unified_alerts_notifications USING btree (delegate_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_created_at ON public.unified_alerts_notifications USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_scheduled_time ON public.unified_alerts_notifications USING btree (scheduled_time) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_escalation_level ON public.unified_alerts_notifications USING btree (escalation_level) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_notify_admins ON public.unified_alerts_notifications USING btree (notify_admins) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_admin_notified ON public.unified_alerts_notifications USING btree (admin_notified) TABLESPACE pg_default;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_unified_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_unified_alerts_updated_at
  BEFORE UPDATE ON unified_alerts_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_unified_alerts_updated_at();

-- Insert sample data for different alert types
INSERT INTO public.unified_alerts_notifications (
  alert_id,
  alert_type,
  category,
  severity,
  priority,
  title,
  message,
  description,
  status,
  is_read,
  is_resolved,
  visit_id,
  delegate_id,
  delegate_name,
  delegate_phone,
  customer_name,
  customer_address,
  location,
  scheduled_time,
  delay_minutes,
  escalation_level,
  notify_admins,
  notify_supervisors,
  send_push_notification,
  send_email_notification,
  admin_notified,
  tags,
  source_system,
  created_by
) VALUES 
-- System alerts
(
  'ALERT_001',
  'system',
  'warning',
  'medium',
  'medium',
  'Test Alert',
  'This is a test alert to verify the system is working',
  'System test alert for verification purposes',
  'active',
  false,
  false,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'System',
  NULL,
  NULL,
  'initial',
  true,
  false,
  true,
  false,
  true,
  ARRAY['test', 'system'],
  'alert_system',
  'admin'
),
-- Vehicle alerts
(
  'ALERT_002',
  'vehicle',
  'critical',
  'critical',
  'critical',
  'Vehicle ABC-123 Low Fuel',
  'Vehicle ABC-123 has only 15% fuel remaining',
  'Critical fuel level alert requiring immediate attention',
  'active',
  false,
  false,
  NULL,
  NULL,
  'John Smith',
  '+1234567890',
  NULL,
  NULL,
  'Highway 101',
  NULL,
  NULL,
  'initial',
  true,
  true,
  true,
  true,
  true,
  ARRAY['vehicle', 'fuel', 'critical'],
  'vehicle_tracking',
  'system'
),
-- Late visit alerts
(
  'ALERT_003',
  'late_visit',
  'warning',
  'high',
  'high',
  'Late Visit Alert - Visit #V123',
  'Agent Ahmed Ibrahim is 15 minutes late for Visit #V123 at Nile Supplies',
  'Visit is running behind schedule with no arrival confirmation',
  'active',
  false,
  false,
  'V123',
  'REP-001',
  'Ahmed Ibrahim',
  '+201022505987',
  'Nile Supplies',
  '123 Business District, Cairo',
  'Nile Supplies Office',
  '2025-01-10 11:00:00+00',
  15,
  'escalated',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'late', 'escalated'],
  'visit_management',
  'late_visit_monitor'
),
-- Delivery alerts
(
  'ALERT_004',
  'delivery',
  'warning',
  'medium',
  'medium',
  'Delivery Delayed',
  'Delivery D001 is running 20 minutes behind schedule',
  'Delivery route optimization available',
  'active',
  false,
  false,
  NULL,
  'DRV-001',
  'Sarah Wilson',
  '+1234567891',
  'Tech Solutions Ltd',
  '456 Industrial Zone',
  'Route 45',
  '2025-01-10 14:00:00+00',
  20,
  'initial',
  true,
  false,
  true,
  false,
  true,
  ARRAY['delivery', 'delayed', 'route'],
  'delivery_system',
  'system'
),
-- Warehouse alerts
(
  'ALERT_005',
  'warehouse',
  'warning',
  'medium',
  'medium',
  'Low Stock Alert - Product A',
  'Product A is running low (5 remaining, minimum: 10)',
  'Inventory restocking required',
  'active',
  false,
  false,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Warehouse A',
  NULL,
  NULL,
  'initial',
  true,
  false,
  true,
  true,
  true,
  ARRAY['warehouse', 'stock', 'inventory'],
  'warehouse_management',
  'system'
);

-- Create a view for easy querying of active alerts
CREATE OR REPLACE VIEW active_alerts_view AS
SELECT 
  id,
  alert_id,
  alert_type,
  category,
  severity,
  priority,
  title,
  message,
  description,
  status,
  is_read,
  visit_id,
  delegate_name,
  customer_name,
  location,
  scheduled_time,
  delay_minutes,
  escalation_level,
  tags,
  created_at,
  updated_at
FROM unified_alerts_notifications
WHERE status = 'active' AND is_resolved = false
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1
    WHEN 'urgent' THEN 2
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 4
    WHEN 'low' THEN 5
  END,
  created_at DESC;

-- Create a view for visit alerts specifically
CREATE OR REPLACE VIEW visit_alerts_view AS
SELECT 
  id,
  alert_id,
  alert_type,
  category,
  severity,
  priority,
  title,
  message,
  description,
  status,
  is_read,
  visit_id,
  delegate_id,
  delegate_name,
  delegate_phone,
  customer_name,
  customer_address,
  location,
  scheduled_time,
  actual_time,
  delay_minutes,
  escalation_level,
  tags,
  created_at,
  updated_at
FROM unified_alerts_notifications
WHERE alert_type IN ('visit', 'late_visit') AND status = 'active' AND is_resolved = false
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1
    WHEN 'urgent' THEN 2
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 4
    WHEN 'low' THEN 5
  END,
  created_at DESC;

-- Create a view for resolved alerts
CREATE OR REPLACE VIEW resolved_alerts_view AS
SELECT 
  id,
  alert_id,
  alert_type,
  category,
  severity,
  priority,
  title,
  message,
  description,
  status,
  is_resolved,
  resolved_at,
  resolved_by,
  visit_id,
  delegate_name,
  customer_name,
  tags,
  created_at,
  updated_at
FROM unified_alerts_notifications
WHERE status = 'resolved' AND is_resolved = true
ORDER BY resolved_at DESC;

-- Create a function to get alert statistics
CREATE OR REPLACE FUNCTION get_alert_statistics()
RETURNS TABLE (
  total_alerts bigint,
  active_alerts bigint,
  resolved_alerts bigint,
  critical_alerts bigint,
  warning_alerts bigint,
  info_alerts bigint,
  today_alerts bigint,
  this_week_alerts bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE status = 'active' AND is_resolved = false) as active_alerts,
    COUNT(*) FILTER (WHERE status = 'resolved' AND is_resolved = true) as resolved_alerts,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE severity = 'high') as warning_alerts,
    COUNT(*) FILTER (WHERE severity = 'medium') as info_alerts,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_alerts,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week_alerts
  FROM unified_alerts_notifications;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark alert as read
CREATE OR REPLACE FUNCTION mark_alert_as_read(alert_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE unified_alerts_notifications 
  SET is_read = true, updated_at = now()
  WHERE id = alert_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to resolve an alert
CREATE OR REPLACE FUNCTION resolve_alert(alert_uuid uuid, resolved_by_user text)
RETURNS boolean AS $$
BEGIN
  UPDATE unified_alerts_notifications 
  SET 
    status = 'resolved',
    is_resolved = true,
    resolved_at = now(),
    resolved_by = resolved_by_user,
    updated_at = now()
  WHERE id = alert_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to escalate an alert
CREATE OR REPLACE FUNCTION escalate_alert(alert_uuid uuid, escalation_notes text)
RETURNS boolean AS $$
BEGIN
  UPDATE unified_alerts_notifications 
  SET 
    escalation_level = CASE 
      WHEN escalation_level = 'initial' THEN 'escalated'
      WHEN escalation_level = 'escalated' THEN 'critical'
      ELSE escalation_level
    END,
    escalation_count = escalation_count + 1,
    last_escalated_at = now(),
    escalation_notes = escalation_notes,
    updated_at = now()
  WHERE id = alert_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'unified_alerts_notifications' 
ORDER BY ordinal_position;

-- Test the table with sample queries
SELECT 'Active Alerts Count:' as description, COUNT(*) as count 
FROM unified_alerts_notifications 
WHERE status = 'active' AND is_resolved = false

UNION ALL

SELECT 'Visit Alerts Count:', COUNT(*) 
FROM unified_alerts_notifications 
WHERE alert_type IN ('visit', 'late_visit') AND status = 'active' AND is_resolved = false

UNION ALL

SELECT 'Resolved Alerts Count:', COUNT(*) 
FROM unified_alerts_notifications 
WHERE status = 'resolved' AND is_resolved = true;

-- Success message
SELECT 'Unified Alerts & Notifications table created successfully with all required fields, indexes, views, and functions!' as status;
