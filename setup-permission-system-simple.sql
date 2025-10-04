-- Simple setup script for permission system
-- Run this step by step to avoid errors

-- Step 1: Create the user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permissions ON user_permissions USING GIN(permissions);

-- Step 3: Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (
    auth.uid()::text = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Step 5: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO authenticated;

-- Step 6: Insert default permissions for existing users
INSERT INTO user_permissions (user_id, permissions)
SELECT 
  id,
  '[{"pageId": "overview", "pageName": "Overview", "permission": "view"}]'::jsonb
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions WHERE user_permissions.user_id = users.id
);

-- Step 7: Give admin users full access
UPDATE user_permissions 
SET permissions = '[
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
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'admin' LIMIT 1
);

SELECT 'Permission system setup completed successfully!' as status;
