-- Debug script to check permission system issues

-- 1. Check if user_permissions table exists and has data
SELECT 
  'user_permissions table check' as test,
  COUNT(*) as total_records
FROM user_permissions;

-- 2. Check current user data format
SELECT 
  'users table check' as test,
  id,
  name,
  email,
  role,
  LENGTH(id) as id_length,
  id::text as id_as_text
FROM users 
LIMIT 5;

-- 3. Check if there are any permission records
SELECT 
  'permission records check' as test,
  user_id,
  LENGTH(user_id) as user_id_length,
  jsonb_array_length(permissions) as permission_count
FROM user_permissions
LIMIT 5;

-- 4. Check for any RLS policy issues
SELECT 
  'RLS policies check' as test,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_permissions';

-- 5. Test a simple permission query
SELECT 
  'simple permission test' as test,
  up.user_id,
  up.permissions
FROM user_permissions up
LIMIT 3;

-- 6. Check if there are any permission records for the current user
-- (This will help identify if the issue is with the user ID format)
SELECT 
  'current user permissions check' as test,
  u.id,
  u.name,
  u.email,
  up.permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.role = 'admin'
LIMIT 3;
