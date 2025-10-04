-- Complete setup script for the permission system
-- This script creates all necessary tables and permissions
-- Updated to match existing users table structure (id as TEXT)

-- 1. Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permissions ON user_permissions USING GIN(permissions);

-- 3. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER trigger_update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- 5. Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;

-- 7. Create RLS policies
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

-- 8. Insert default permissions for existing users
-- Give all existing users view access to overview page
INSERT INTO user_permissions (user_id, permissions)
SELECT 
  id,
  '[{"pageId": "overview", "pageName": "Overview", "permission": "view"}]'::jsonb
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions WHERE user_permissions.user_id = users.id
);

-- 9. Add table comments
COMMENT ON TABLE user_permissions IS 'Stores user page access permissions for the admin panel';
COMMENT ON COLUMN user_permissions.permissions IS 'JSON array of page permissions with pageId, pageName, and permission level';

-- 10. Create a function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id_param TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT permissions 
    FROM user_permissions 
    WHERE user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create a function to check if user has permission for a page
CREATE OR REPLACE FUNCTION user_has_page_permission(
  user_id_param TEXT, 
  page_id TEXT, 
  required_level TEXT DEFAULT 'view'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  page_permission JSONB;
  user_level TEXT;
  required_level_index INTEGER;
  user_level_index INTEGER;
BEGIN
  -- Get user permissions
  SELECT permissions INTO user_permissions 
  FROM user_permissions 
  WHERE user_id = user_id_param;
  
  -- If no permissions found, return false
  IF user_permissions IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Find the specific page permission
  SELECT jsonb_array_elements(user_permissions) INTO page_permission
  WHERE jsonb_array_elements(user_permissions)->>'pageId' = page_id;
  
  -- If page permission not found, return false
  IF page_permission IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user's permission level for this page
  user_level := page_permission->>'permission';
  
  -- Define permission levels hierarchy
  required_level_index := CASE required_level
    WHEN 'none' THEN 0
    WHEN 'view' THEN 1
    WHEN 'edit' THEN 2
    WHEN 'admin' THEN 3
    ELSE 0
  END;
  
  user_level_index := CASE user_level
    WHEN 'none' THEN 0
    WHEN 'view' THEN 1
    WHEN 'edit' THEN 2
    WHEN 'admin' THEN 3
    ELSE 0
  END;
  
  -- Return true if user level is >= required level
  RETURN user_level_index >= required_level_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_page_permission(TEXT, TEXT, TEXT) TO authenticated;

-- 13. Create a view for easy permission checking
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.role,
  up.permissions,
  up.created_at as permissions_created_at,
  up.updated_at as permissions_updated_at
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id;

-- Grant access to the view
GRANT SELECT ON user_permissions_view TO authenticated;

-- 14. Add some sample permissions for testing (optional)
-- This gives the admin user full access to all pages
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

-- Success message
SELECT 'Permission system setup completed successfully!' as status;
