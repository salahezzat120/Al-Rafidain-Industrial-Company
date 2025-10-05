-- Insert Visit Management Alerts into Unified Alerts Notifications Table
-- This script adds sample alerts from visit management to the unified alerts system

-- First, let's create the update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_unified_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert sample visit management alerts into unified_alerts_notifications table
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
  delegate_email,
  customer_id,
  customer_name,
  customer_address,
  location,
  scheduled_time,
  actual_time,
  delay_minutes,
  escalation_level,
  notify_admins,
  notify_supervisors,
  send_push_notification,
  send_email_notification,
  admin_notified,
  tags,
  source_system,
  created_by,
  metadata
) VALUES 
-- Late Visit Alert - High Priority
(
  'VISIT_LATE_001',
  'late_visit',
  'warning',
  'high',
  'high',
  'Late Visit Alert - Visit #V123',
  'Agent Ahmed Ibrahim is 15 minutes late for Visit #V123 at Nile Supplies',
  'Visit #V123 at Nile Supplies is running behind schedule with no arrival confirmation. Delegate: Ahmed Ibrahim. Scheduled: 11:00 AM. Status: Late.',
  'active',
  false,
  false,
  'V123',
  'REP-001',
  'Ahmed Ibrahim',
  '+201022505987',
  'ahmed.ibrahim@company.com',
  'CUST-001',
  'Nile Supplies',
  '123 Business District, Cairo, Egypt',
  'Nile Supplies Office',
  '2025-01-10 11:00:00+00',
  null,
  15,
  'escalated',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'late', 'escalated', 'high_priority'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-001",
    "visit_type": "delivery",
    "is_late": true,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 60,
    "current_location": "Not updated",
    "internal_message": "Agent is 15 minutes late",
    "message_type": "system_alert",
    "message_priority": "high"
  }'::jsonb
),

-- Time Exceeded Alert - Critical Priority
(
  'VISIT_TIME_002',
  'visit',
  'critical',
  'critical',
  'critical',
  'Time Exceeded - Visit #V124',
  'Delegate Sarah Wilson has exceeded allowed time for Visit #V124 at Tech Solutions Ltd',
  'Visit #V124 at Tech Solutions Ltd has exceeded the allowed duration. Delegate: Sarah Wilson. Scheduled: 2:00 PM. Status: Time Exceeded.',
  'active',
  false,
  false,
  'V124',
  'REP-002',
  'Sarah Wilson',
  '+201155512345',
  'sarah.wilson@company.com',
  'CUST-002',
  'Tech Solutions Ltd',
  '456 Industrial Zone, Alexandria, Egypt',
  'Tech Solutions Office',
  '2025-01-10 14:00:00+00',
  '2025-01-10 14:15:00+00',
  0,
  'critical',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'time_exceeded', 'critical'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-002",
    "visit_type": "inspection",
    "is_late": false,
    "exceeds_time_limit": true,
    "allowed_duration_minutes": 45,
    "current_location": "Tech Solutions Office",
    "internal_message": "Visit duration exceeded",
    "message_type": "system_alert",
    "message_priority": "urgent"
  }'::jsonb
),

-- No Show Alert - High Priority
(
  'VISIT_NOSHOW_003',
  'visit',
  'warning',
  'high',
  'high',
  'No Show - Visit #V125',
  'Delegate David Chen did not show up for Visit #V125 at Manufacturing Corp',
  'Visit #V125 at Manufacturing Corp - No show by delegate. Delegate: David Chen. Scheduled: 9:00 AM. Status: No Show.',
  'active',
  false,
  false,
  'V125',
  'REP-003',
  'David Chen',
  '+201188899900',
  'david.chen@company.com',
  'CUST-003',
  'Manufacturing Corp',
  '789 Industrial Complex, Giza, Egypt',
  'Manufacturing Corp Facility',
  '2025-01-10 09:00:00+00',
  null,
  120,
  'escalated',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'no_show', 'escalated'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-003",
    "visit_type": "maintenance",
    "is_late": true,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 90,
    "current_location": "Not updated",
    "internal_message": "Delegate did not show up",
    "message_type": "system_alert",
    "message_priority": "high"
  }'::jsonb
),

-- Early Completion Alert - Medium Priority
(
  'VISIT_EARLY_004',
  'visit',
  'info',
  'medium',
  'medium',
  'Early Completion - Visit #V126',
  'Delegate Emma Davis completed Visit #V126 early at Retail Store',
  'Visit #V126 at Retail Store completed ahead of schedule. Delegate: Emma Davis. Scheduled: 3:00 PM. Status: Early Completion.',
  'active',
  false,
  false,
  'V126',
  'REP-004',
  'Emma Davis',
  '+201177744433',
  'emma.davis@company.com',
  'CUST-004',
  'Retail Store',
  '321 Commercial Street, Cairo, Egypt',
  'Retail Store Location',
  '2025-01-10 15:00:00+00',
  '2025-01-10 14:30:00+00',
  -30,
  'initial',
  true,
  false,
  true,
  false,
  true,
  ARRAY['visit', 'early_completion', 'positive'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-004",
    "visit_type": "delivery",
    "is_late": false,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 60,
    "current_location": "Retail Store",
    "internal_message": "Visit completed early",
    "message_type": "visit_update",
    "message_priority": "medium"
  }'::jsonb
),

-- Late Visit Alert - Critical Priority (Long Delay)
(
  'VISIT_LATE_005',
  'late_visit',
  'critical',
  'critical',
  'critical',
  'CRITICAL: Late Visit - Visit #V127',
  'Agent Mike Johnson is 45 minutes late for Visit #V127 at Hospital Complex',
  'Visit #V127 at Hospital Complex is severely delayed. Delegate: Mike Johnson. Scheduled: 8:00 AM. Status: Critical Delay.',
  'active',
  false,
  false,
  'V127',
  'REP-005',
  'Mike Johnson',
  '+201199988877',
  'mike.johnson@company.com',
  'CUST-005',
  'Hospital Complex',
  '555 Medical District, Cairo, Egypt',
  'Hospital Complex',
  '2025-01-10 08:00:00+00',
  null,
  45,
  'critical',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'late', 'critical', 'urgent'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-005",
    "visit_type": "delivery",
    "is_late": true,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 120,
    "current_location": "Not updated",
    "internal_message": "Critical delay - 45 minutes late",
    "message_type": "system_alert",
    "message_priority": "urgent"
  }'::jsonb
),

-- Time Exceeded Alert - High Priority
(
  'VISIT_TIME_006',
  'visit',
  'warning',
  'high',
  'high',
  'Time Exceeded - Visit #V128',
  'Delegate Lisa Brown has exceeded allowed time for Visit #V128 at Office Building',
  'Visit #V128 at Office Building has exceeded the allowed duration. Delegate: Lisa Brown. Scheduled: 1:00 PM. Status: Time Exceeded.',
  'active',
  false,
  false,
  'V128',
  'REP-006',
  'Lisa Brown',
  '+201166655544',
  'lisa.brown@company.com',
  'CUST-006',
  'Office Building',
  '999 Business Center, Alexandria, Egypt',
  'Office Building',
  '2025-01-10 13:00:00+00',
  '2025-01-10 13:10:00+00',
  0,
  'escalated',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'time_exceeded', 'escalated'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-006",
    "visit_type": "inspection",
    "is_late": false,
    "exceeds_time_limit": true,
    "allowed_duration_minutes": 90,
    "current_location": "Office Building",
    "internal_message": "Visit duration exceeded",
    "message_type": "system_alert",
    "message_priority": "high"
  }'::jsonb
),

-- Late Visit Alert - Medium Priority
(
  'VISIT_LATE_007',
  'late_visit',
  'warning',
  'medium',
  'medium',
  'Late Visit Alert - Visit #V129',
  'Agent John Smith is 8 minutes late for Visit #V129 at School Campus',
  'Visit #V129 at School Campus is running slightly behind schedule. Delegate: John Smith. Scheduled: 10:30 AM. Status: Minor Delay.',
  'active',
  false,
  false,
  'V129',
  'REP-007',
  'John Smith',
  '+201144433322',
  'john.smith@company.com',
  'CUST-007',
  'School Campus',
  '777 Education District, Giza, Egypt',
  'School Campus',
  '2025-01-10 10:30:00+00',
  null,
  8,
  'initial',
  true,
  false,
  true,
  false,
  true,
  ARRAY['visit', 'late', 'minor_delay'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-007",
    "visit_type": "delivery",
    "is_late": true,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 45,
    "current_location": "Not updated",
    "internal_message": "Minor delay - 8 minutes late",
    "message_type": "system_alert",
    "message_priority": "medium"
  }'::jsonb
),

-- No Show Alert - Critical Priority
(
  'VISIT_NOSHOW_008',
  'visit',
  'critical',
  'critical',
  'critical',
  'CRITICAL: No Show - Visit #V130',
  'Delegate Anna Wilson did not show up for Visit #V130 at Government Office',
  'Visit #V130 at Government Office - Critical no show by delegate. Delegate: Anna Wilson. Scheduled: 7:00 AM. Status: Critical No Show.',
  'active',
  false,
  false,
  'V130',
  'REP-008',
  'Anna Wilson',
  '+201133322211',
  'anna.wilson@company.com',
  'CUST-008',
  'Government Office',
  '111 Administrative District, Cairo, Egypt',
  'Government Office Building',
  '2025-01-10 07:00:00+00',
  null,
  180,
  'critical',
  true,
  true,
  true,
  true,
  true,
  ARRAY['visit', 'no_show', 'critical', 'urgent'],
  'visit_management',
  'visit_management_sync',
  '{
    "original_visit_id": "vm-008",
    "visit_type": "meeting",
    "is_late": true,
    "exceeds_time_limit": false,
    "allowed_duration_minutes": 120,
    "current_location": "Not updated",
    "internal_message": "Critical no show - 3 hours late",
    "message_type": "system_alert",
    "message_priority": "urgent"
  }'::jsonb
);

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unified_alerts_visit_id ON public.unified_alerts_notifications USING btree (visit_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_delegate_id ON public.unified_alerts_notifications USING btree (delegate_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_customer_id ON public.unified_alerts_notifications USING btree (customer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_source_system ON public.unified_alerts_notifications USING btree (source_system) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_unified_alerts_created_by ON public.unified_alerts_notifications USING btree (created_by) TABLESPACE pg_default;

-- Verify the inserted data
SELECT 
  alert_id,
  alert_type,
  category,
  severity,
  priority,
  title,
  visit_id,
  delegate_name,
  customer_name,
  delay_minutes,
  escalation_level,
  created_at
FROM public.unified_alerts_notifications 
WHERE source_system = 'visit_management'
ORDER BY created_at DESC;

-- Show statistics
SELECT 
  'Total Visit Alerts' as description,
  COUNT(*) as count
FROM public.unified_alerts_notifications 
WHERE source_system = 'visit_management'

UNION ALL

SELECT 
  'Late Visit Alerts',
  COUNT(*)
FROM public.unified_alerts_notifications 
WHERE source_system = 'visit_management' AND alert_type = 'late_visit'

UNION ALL

SELECT 
  'Critical Alerts',
  COUNT(*)
FROM public.unified_alerts_notifications 
WHERE source_system = 'visit_management' AND severity = 'critical'

UNION ALL

SELECT 
  'Active Alerts',
  COUNT(*)
FROM public.unified_alerts_notifications 
WHERE source_system = 'visit_management' AND status = 'active';

-- Success message
SELECT 'Visit management alerts successfully inserted into unified alerts notifications table!' as status;
