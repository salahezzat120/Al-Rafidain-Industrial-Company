-- =====================================================
-- VERIFY MAIN GROUPS DROPDOWN
-- This script verifies that main groups are properly set up
-- =====================================================

-- Check if main_groups table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'main_groups') 
    THEN '✅ main_groups table exists'
    ELSE '❌ main_groups table does not exist'
  END as table_status;

-- Check main_groups data
SELECT 
  'Main Groups Count' as info,
  COUNT(*) as count 
FROM main_groups;

-- Show sample main groups
SELECT 
  'Sample Main Groups' as info,
  id,
  group_name,
  group_name_ar,
  description
FROM main_groups 
ORDER BY group_name 
LIMIT 5;

-- Check if data is ready for dropdown
SELECT 
  'Dropdown Ready Check' as info,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Ready for dropdown'
    ELSE '❌ No data - run main groups SQL first'
  END as status
FROM main_groups;

-- Show all main groups for dropdown
SELECT 
  'All Main Groups for Dropdown' as info,
  id,
  group_name,
  group_name_ar
FROM main_groups 
ORDER BY group_name;
