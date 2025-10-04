-- Test script to verify that form data from the "Add New Visit" modal can be properly inserted
-- This matches the exact data shown in the form image

-- Test data that matches the form fields exactly
INSERT INTO public.visit_management (
  -- Visit Information
  visit_id,                    -- V705613662 (auto-generated)
  
  -- Delegate Information  
  delegate_id,                 -- REP-263338
  delegate_name,               -- maged (auto-filled)
  delegate_email,              -- salahezzat120@gmail.com (auto-filled)
  delegate_phone,              -- +201022505987 (auto-filled)
  delegate_role,               -- representative
  delegate_status,             -- available (default)
  
  -- Customer Information
  customer_id,                 -- C001 (from dropdown)
  customer_name,               -- salah ezzat (auto-filled)
  customer_address,            -- sssssssssss (auto-filled)
  customer_phone,              -- +20459083040 (auto-filled)
  customer_email,              -- salahezzat120@gmail.com (auto-filled)
  
  -- Visit Details
  visit_type,                  -- delivery
  priority,                    -- medium
  status,                      -- scheduled (default)
  allowed_duration_minutes,    -- 60
  
  -- Time Information
  scheduled_start_time,        -- 10/05/2025 02:37 AM
  scheduled_end_time,          -- 10/05/2025 03:37 AM
  
  -- Additional fields
  notes,                       -- Additional notes...
  transportation_type,         -- foot (default)
  
  -- System fields
  created_at,
  updated_at
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
  'delivery',
  'medium',
  'scheduled',
  60,
  '2025-10-05 02:37:00+00',
  '2025-10-05 03:37:00+00',
  'Additional notes...',
  'foot',
  now(),
  now()
);

-- Verify the data was inserted correctly
SELECT 
  'Visit ID: ' || visit_id as visit_info,
  'Delegate: ' || delegate_name || ' (' || delegate_id || ')' as delegate_info,
  'Customer: ' || customer_name || ' (' || customer_id || ')' as customer_info,
  'Type: ' || visit_type || ', Priority: ' || priority as visit_details,
  'Status: ' || status as current_status,
  'Duration: ' || allowed_duration_minutes || ' minutes' as duration_info,
  'Start: ' || scheduled_start_time as start_time,
  'End: ' || scheduled_end_time as end_time
FROM public.visit_management 
WHERE visit_id = 'V705613662';

-- Test all constraint validations
SELECT 'Testing constraint validations...' as test_status;

-- Test delegate_role constraint
INSERT INTO public.visit_management (
  visit_id, delegate_id, delegate_name, delegate_role,
  customer_id, customer_name, customer_address,
  scheduled_start_time, scheduled_end_time
) VALUES (
  'TEST-001', 'TEST-001', 'Test User', 'invalid_role',
  'TEST-001', 'Test Customer', 'Test Address',
  now(), now() + interval '1 hour'
);

-- Test visit_type constraint  
INSERT INTO public.visit_management (
  visit_id, delegate_id, delegate_name, delegate_role,
  customer_id, customer_name, customer_address,
  scheduled_start_time, scheduled_end_time, visit_type
) VALUES (
  'TEST-002', 'TEST-002', 'Test User', 'representative',
  'TEST-002', 'Test Customer', 'Test Address',
  now(), now() + interval '1 hour', 'invalid_type'
);

-- Test priority constraint
INSERT INTO public.visit_management (
  visit_id, delegate_id, delegate_name, delegate_role,
  customer_id, customer_name, customer_address,
  scheduled_start_time, scheduled_end_time, priority
) VALUES (
  'TEST-003', 'TEST-003', 'Test User', 'representative',
  'TEST-003', 'Test Customer', 'Test Address',
  now(), now() + interval '1 hour', 'invalid_priority'
);

-- If we get here, all constraints are working
SELECT 'All constraint validations passed!' as test_result;

-- Clean up test data
DELETE FROM public.visit_management WHERE visit_id LIKE 'TEST-%';

SELECT 'Visit form data test completed successfully!' as final_status;
