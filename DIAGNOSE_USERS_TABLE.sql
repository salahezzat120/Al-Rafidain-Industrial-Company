-- DIAGNOSE USERS TABLE ISSUE
-- Run this to see what's wrong with the users table

-- Step 1: Check if users table exists
SELECT 'CHECKING IF USERS TABLE EXISTS:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- Step 2: Check table structure if it exists
SELECT 'USERS TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check current data count
SELECT 'CURRENT USERS COUNT:' as info;
SELECT COUNT(*) as user_count FROM users;

-- Step 4: Check if table has RLS enabled
SELECT 'RLS STATUS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- Step 5: Check RLS policies
SELECT 'RLS POLICIES:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- Step 6: Try to see any existing data
SELECT 'EXISTING DATA (if any):' as info;
SELECT * FROM users LIMIT 5;

-- Step 7: Test insert permissions
SELECT 'TESTING INSERT PERMISSIONS:' as info;
-- This will show if we can insert data
SELECT 'Ready to test insert - run the next part if above looks good' as status;
