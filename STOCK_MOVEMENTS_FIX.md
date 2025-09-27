# Stock Movements Fix

## Problem
The stock movements feature is failing with the error:
```
Error creating stock movement: {}
Error: Failed to create stock movement
```

## Root Cause
The `stock_movements` table either doesn't exist or has an incorrect structure that doesn't match the data being inserted.

## Solution Files Created

### 1. `fix-stock-movements-complete.sql`
- Creates the `stock_movements` table with the correct structure
- Includes all required columns: `product_id`, `warehouse_id`, `movement_type`, `quantity`, `unit_price`, etc.
- Sets up proper foreign key relationships
- Creates indexes for performance
- Sets up RLS policies
- Inserts sample data for testing

### 2. `fix-stock-movement-function.js`
- Improved version of the `createStockMovement` function
- Better error handling and validation
- More detailed logging for debugging
- Handles edge cases and missing data

## How to Fix

### Step 1: Create the Stock Movements Table
Run this in your Supabase SQL Editor:
```sql
-- Execute this file
\i fix-stock-movements-complete.sql
```

### Step 2: Update the Warehouse Function (Optional)
If you want improved error handling, replace the `createStockMovement` function in `lib/warehouse.ts` with the improved version from `fix-stock-movement-function.js`.

### Step 3: Test the Fix
1. Go to your warehouse management interface
2. Try creating a stock movement
3. Check the browser console for any remaining errors

## Expected Result

After running the fix:
- ✅ Stock movements table will be created with proper structure
- ✅ Stock movements can be created successfully
- ✅ No more "Failed to create stock movement" errors
- ✅ Inventory will be updated automatically after stock movements

## Verification

Run this query to verify the table was created correctly:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stock_movements' 
ORDER BY ordinal_position;
```

You should see columns like:
- `id` (integer, primary key)
- `product_id` (integer, foreign key)
- `warehouse_id` (integer, foreign key)
- `movement_type` (varchar)
- `quantity` (integer)
- `unit_price` (decimal)
- `reference_number` (varchar)
- `notes` (text)
- `created_by` (varchar)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Troubleshooting

If you still get errors after running the fix:

1. **Check if the table exists:**
   ```sql
   SELECT COUNT(*) FROM stock_movements;
   ```

2. **Check for foreign key issues:**
   ```sql
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM warehouses;
   ```

3. **Check the browser console** for more detailed error messages

4. **Verify RLS policies** are set up correctly:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'stock_movements';
   ```
