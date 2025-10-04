-- Test script to verify supervisor permissions are working

-- 1. Check current users and their roles
SELECT 
  'Current Users' as test_type,
  name,
  email,
  role,
  created_at
FROM users
ORDER BY role, name;

-- 2. Check if any supervisor permissions exist
SELECT 
  'Supervisor Permissions Check' as test_type,
  COUNT(*) as permission_count
FROM user_permissions up
JOIN users u ON up.user_id = u.id
WHERE u.role = 'supervisor';

-- 3. Show all users with their roles
SELECT 
  'User Role Summary' as test_type,
  role,
  COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY role;

-- 4. Test permission levels for supervisors
SELECT 
  'Supervisor Permission Test' as test_type,
  u.name as supervisor_name,
  u.email,
  CASE 
    WHEN up.permissions IS NULL THEN 'No permissions set'
    WHEN up.permissions::text LIKE '%"pageId": "overview"%' THEN 'Has overview access'
    ELSE 'Has some permissions'
  END as permission_status
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.role = 'supervisor';

-- Success message
SELECT 'Supervisor permission test completed!' as status;
