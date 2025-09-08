-- Fix RLS policies for employees table
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for employees" ON employees;

-- Create a more permissive policy for development
CREATE POLICY "Allow all operations" ON employees FOR ALL USING (true);

-- Alternative: If you want to keep RLS but allow anonymous access
-- CREATE POLICY "Allow anonymous access" ON employees FOR ALL USING (true);
