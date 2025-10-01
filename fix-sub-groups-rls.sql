-- =====================================================
-- FIX SUB GROUPS RLS ISSUES
-- This script ensures sub_groups table is accessible
-- =====================================================

-- Disable RLS for sub_groups table
ALTER TABLE sub_groups DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT ON sub_groups TO authenticated;
GRANT SELECT ON sub_groups TO anon;

-- Verify the table is accessible
SELECT 'RLS disabled for sub_groups table' as status;

-- Test query to verify access
SELECT COUNT(*) as total_records FROM sub_groups;

-- Show sample data
SELECT id, main_group_id, sub_group_name, sub_group_name_ar 
FROM sub_groups 
ORDER BY sub_group_name 
LIMIT 5;

-- Show sub groups by main group
SELECT 
  'Sub groups by main group' as info,
  main_group_id,
  COUNT(*) as sub_group_count
FROM sub_groups 
GROUP BY main_group_id 
ORDER BY main_group_id;
