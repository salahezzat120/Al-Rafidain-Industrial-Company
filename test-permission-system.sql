-- Test script to verify the permission system is working correctly

-- 1. Check if the user_permissions table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_permissions'
ORDER BY ordinal_position;

-- 2. Check if permissions were created for existing users
SELECT 
  u.name,
  u.email,
  u.role,
  up.permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
ORDER BY u.created_at;

-- 3. Check if admin users have full permissions
SELECT 
  u.name,
  u.role,
  jsonb_array_length(up.permissions) as permission_count
FROM users u
JOIN user_permissions up ON u.id = up.user_id
WHERE u.role = 'admin';

-- 4. Test the permission checking function (if it exists)
-- This will show which users have access to the 'users' page
SELECT 
  u.name,
  u.role,
  CASE 
    WHEN up.permissions IS NULL THEN 'No permissions set'
    WHEN up.permissions::text LIKE '%"pageId": "users"%' THEN 'Has access to User Management'
    ELSE 'No access to User Management'
  END as user_management_access
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id;

-- 5. Show all permission entries
SELECT 
  user_id,
  jsonb_pretty(permissions) as formatted_permissions
FROM user_permissions;
