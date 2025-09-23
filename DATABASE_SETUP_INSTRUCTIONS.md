# 🏭 Database Setup Instructions

## ❌ Current Issue
The warehouse management system is failing because the database tables don't exist yet.

## ✅ Solution Steps

### 1. **Set Up Your Supabase Credentials**

You need to add your Supabase credentials to the setup script:

1. **Open** `scripts/setup-database-simple.js`
2. **Replace** these lines with your actual credentials:
   ```javascript
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';
   ```

   **With your actual values:**
   ```javascript
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseServiceKey = 'your-service-role-key-here';
   ```

### 2. **Run the Database Setup Script**

```bash
node scripts/setup-database-simple.js
```

### 3. **What This Script Does**

- ✅ Creates all essential warehouse tables
- ✅ Inserts sample data (warehouses, products, colors, materials, etc.)
- ✅ Sets up proper relationships between tables
- ✅ Makes the warehouse management system functional

### 4. **Expected Output**

You should see:
```
🏭 Setting up Warehouse Database...

⏳ Creating table 1/9...
✅ Table created successfully
⏳ Creating table 2/9...
✅ Table created successfully
...
📊 Inserting sample data...
⏳ Inserting sample data 1/6...
✅ Sample data inserted
...

✅ Warehouse Database Setup Complete!
   - All essential tables created
   - Sample data inserted
   - Ready for warehouse management
```

### 5. **After Setup**

Once the database is set up, the warehouse management system will work properly:

- ✅ **Admin Panel** → **Warehouse Management** → **Products** will work
- ✅ **Add Product** with warehouse selection will work
- ✅ **Warehouses column** will show in the products table
- ✅ **Product creation** with warehouse assignment will work

## 🔧 Alternative: Manual Database Setup

If you prefer to set up the database manually, you can run the SQL commands from `comprehensive-warehouse-schema.sql` directly in your Supabase SQL editor.

## 🎯 Next Steps

After running the setup script:

1. **Refresh your browser**
2. **Go to Admin Panel** → **Warehouse Management** → **Products**
3. **Click "Add Product"** to test the warehouse selection
4. **Verify** that the "Warehouses" column appears in the products table

The warehouse management system will be fully functional! 🚀
