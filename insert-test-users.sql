-- Insert test users with different permission levels for testing

-- Insert test users (if they don't already exist)
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES 
  -- Test Admin User
  ('admin-test-001', 'Test Admin', 'admin.test@company.com', 'password123', 'admin', NOW(), NOW()),
  
  -- Test Supervisor User
  ('supervisor-test-001', 'Test Supervisor', 'supervisor.test@company.com', 'password123', 'supervisor', NOW(), NOW()),
  
  -- Test Representative User
  ('rep-test-001', 'Test Representative', 'rep.test@company.com', 'password123', 'representative', NOW(), NOW()),
  
  -- Limited Access User (for testing restricted permissions)
  ('limited-test-001', 'Limited User', 'limited.test@company.com', 'password123', 'supervisor', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Set up permissions for Test Admin (full access to everything)
INSERT INTO user_permissions (user_id, permissions)
VALUES (
  'admin-test-001',
  '[
    {"pageId": "overview", "pageName": "Overview", "permission": "admin"},
    {"pageId": "users", "pageName": "User Management", "permission": "admin"},
    {"pageId": "employees", "pageName": "Employee Management", "permission": "admin"},
    {"pageId": "representatives", "pageName": "Representative Management", "permission": "admin"},
    {"pageId": "customers", "pageName": "Customer Management", "permission": "admin"},
    {"pageId": "warehouse", "pageName": "Warehouse Management", "permission": "admin"},
    {"pageId": "payments", "pageName": "Payment Tracking", "permission": "admin"},
    {"pageId": "attendance", "pageName": "Attendance", "permission": "admin"},
    {"pageId": "chat-support", "pageName": "Chat Support", "permission": "admin"},
    {"pageId": "live-map", "pageName": "Live Map", "permission": "admin"},
    {"pageId": "vehicles", "pageName": "Vehicle Fleet", "permission": "admin"},
    {"pageId": "deliveries", "pageName": "Delivery Tasks", "permission": "admin"},
    {"pageId": "analytics", "pageName": "Analytics", "permission": "admin"},
    {"pageId": "alerts", "pageName": "Alerts & Notifications", "permission": "admin"},
    {"pageId": "visits", "pageName": "Visit Management", "permission": "admin"},
    {"pageId": "messaging", "pageName": "Internal Messaging", "permission": "admin"},
    {"pageId": "after-sales", "pageName": "After Sales Support", "permission": "admin"},
    {"pageId": "settings", "pageName": "System Settings", "permission": "admin"}
  ]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Set up permissions for Test Supervisor (limited management access)
INSERT INTO user_permissions (user_id, permissions)
VALUES (
  'supervisor-test-001',
  '[
    {"pageId": "overview", "pageName": "Overview", "permission": "view"},
    {"pageId": "employees", "pageName": "Employee Management", "permission": "edit"},
    {"pageId": "representatives", "pageName": "Representative Management", "permission": "edit"},
    {"pageId": "customers", "pageName": "Customer Management", "permission": "view"},
    {"pageId": "warehouse", "pageName": "Warehouse Management", "permission": "view"},
    {"pageId": "deliveries", "pageName": "Delivery Tasks", "permission": "edit"},
    {"pageId": "vehicles", "pageName": "Vehicle Fleet", "permission": "view"},
    {"pageId": "analytics", "pageName": "Analytics", "permission": "view"},
    {"pageId": "attendance", "pageName": "Attendance", "permission": "edit"}
  ]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Set up permissions for Test Representative (delivery-focused access)
INSERT INTO user_permissions (user_id, permissions)
VALUES (
  'rep-test-001',
  '[
    {"pageId": "overview", "pageName": "Overview", "permission": "view"},
    {"pageId": "deliveries", "pageName": "Delivery Tasks", "permission": "edit"},
    {"pageId": "customers", "pageName": "Customer Management", "permission": "view"},
    {"pageId": "live-map", "pageName": "Live Map", "permission": "view"},
    {"pageId": "messaging", "pageName": "Internal Messaging", "permission": "view"}
  ]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Set up permissions for Limited User (very restricted access)
INSERT INTO user_permissions (user_id, permissions)
VALUES (
  'limited-test-001',
  '[
    {"pageId": "overview", "pageName": "Overview", "permission": "view"},
    {"pageId": "analytics", "pageName": "Analytics", "permission": "view"}
  ]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Show the created test users and their permissions
SELECT 
  u.name,
  u.email,
  u.role,
  jsonb_array_length(up.permissions) as permission_count,
  up.permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.email LIKE '%test@company.com'
ORDER BY u.role, u.name;

-- Success message
SELECT 'Test users created successfully!' as status;
