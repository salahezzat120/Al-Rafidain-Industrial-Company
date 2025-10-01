-- =====================================================
-- FIX MAIN GROUPS RLS ISSUES
-- This script ensures main_groups table is accessible
-- =====================================================

-- Disable RLS for main_groups table
ALTER TABLE main_groups DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT ON main_groups TO authenticated;
GRANT SELECT ON main_groups TO anon;

-- Verify the table is accessible
SELECT 'RLS disabled for main_groups table' as status;

-- Test query to verify access
SELECT COUNT(*) as total_records FROM main_groups;

-- Show sample data
SELECT id, group_name, group_name_ar 
FROM main_groups 
ORDER BY group_name 
LIMIT 5;
