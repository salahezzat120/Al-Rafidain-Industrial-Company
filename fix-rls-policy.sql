-- Fix RLS policies for customers table
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON customers;

-- Create a more permissive policy for development
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);

-- Alternative: If you want to keep RLS but allow anonymous access
-- CREATE POLICY "Allow anonymous access" ON customers FOR ALL USING (true);
