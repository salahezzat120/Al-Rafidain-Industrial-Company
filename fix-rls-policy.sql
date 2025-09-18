-- Fix RLS policy for representatives table
-- Run this script in your Supabase SQL editor

-- First, let's check the current policies
SELECT * FROM pg_policies WHERE tablename = 'representatives';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON representatives;

-- Create a new policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON representatives 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Alternative: If you want to disable RLS temporarily for testing
-- ALTER TABLE representatives DISABLE ROW LEVEL SECURITY;

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'representatives';