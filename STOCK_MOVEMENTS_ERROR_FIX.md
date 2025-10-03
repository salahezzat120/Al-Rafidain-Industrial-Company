# Stock Movements Error Fix Guide

## 🚨 Problem
You're getting these console errors:
- `Error fetching stock movements: {}`
- `Error: Failed to fetch stock movements`
- `❌ Error creating stock movement: {}`

## 🔍 Root Causes
The empty error objects `{}` indicate one of these issues:
1. **Stock movements table doesn't exist**
2. **RLS (Row Level Security) policies are blocking access**
3. **Missing foreign key relationships**
4. **Permission issues**

## ✅ Solution

### Step 1: Run the Database Fix Script
1. Go to your **Supabase SQL Editor**
2. Copy and paste the contents of **`fix-stock-movements-errors.sql`**
3. **Run the script**
4. This will:
   - Create the stock_movements table if it doesn't exist
   - Add proper foreign key relationships
   - Fix RLS policies
   - Grant necessary permissions
   - Add sample data

### Step 2: Test the Fix
Run the test script to verify everything is working:
```bash
node test-database-connection.js
```

### Step 3: Refresh Your Application
1. **Refresh your browser**
2. Go to **Stock Movements** tab
3. Try adding a new stock movement

## 🧪 What the Fix Does

### Database Changes
- ✅ **Creates stock_movements table** with proper structure
- ✅ **Adds foreign key constraints** to products and warehouses
- ✅ **Creates indexes** for better performance
- ✅ **Fixes RLS policies** to allow authenticated users
- ✅ **Grants permissions** on all related tables
- ✅ **Adds sample data** for testing

### Code Improvements
- ✅ **Enhanced error handling** with detailed error messages
- ✅ **Better logging** to identify specific issues
- ✅ **Specific error messages** for different failure types
- ✅ **Table existence checks** with helpful error messages

## 🔍 Troubleshooting

### If you still get errors:

#### 1. Table Doesn't Exist Error
```
relation "stock_movements" does not exist
```
**Fix:** Run the database setup script

#### 2. RLS Policy Error
```
row-level security policy
```
**Fix:** Run the RLS fix script

#### 3. Foreign Key Error
```
foreign key constraint
```
**Fix:** Ensure products and warehouses exist first

#### 4. Permission Error
```
permission denied
```
**Fix:** Check that you're authenticated in Supabase

### Manual Verification
Run these queries in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'stock_movements';

-- Check RLS policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'stock_movements';

-- Check permissions
SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'stock_movements';
```

## 🎯 Expected Results

After running the fix:
- ✅ **No more empty error objects**
- ✅ **Clear error messages** if something goes wrong
- ✅ **Stock movements table** will be created and accessible
- ✅ **RLS policies** will allow authenticated users
- ✅ **Foreign key relationships** will work properly
- ✅ **Sample data** will be available for testing

## 📞 Still Having Issues?

If you're still getting errors after running the fix:

1. **Check the browser console** for the new detailed error messages
2. **Run the test script** to identify specific issues
3. **Check Supabase logs** for database errors
4. **Verify authentication** in your Supabase dashboard

The fix addresses all common issues with stock movements functionality! 🎉
