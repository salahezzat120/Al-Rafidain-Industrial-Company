# Database Setup Guide

## Quick Fix for "Database tables not found" Error

The error occurs because the required database tables haven't been created yet. Here's how to fix it:

### Option 1: Manual Setup (Recommended)

1. **Go to your Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to the SQL Editor

2. **Run the Database Setup**
   - Copy the contents of `warehouse-essential-tables.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to the Table Editor
   - You should see these tables:
     - `warehouses`
     - `main_groups`
     - `sub_groups`
     - `colors`
     - `materials`
     - `units_of_measurement`
     - `products`
     - `inventory`
     - `stock_movements`

### Option 2: Environment Setup

1. **Create .env.local file** in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

2. **Run the setup script**:
```bash
node setup-database-quick.js
```

### Option 3: Direct SQL Execution

If you prefer to run SQL directly, here are the essential tables:

```sql
-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  responsible_person VARCHAR(255),
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_name_ar VARCHAR(255),
  product_code VARCHAR(100) UNIQUE,
  stock_number VARCHAR(100) UNIQUE,
  stock_number_ar VARCHAR(100),
  main_group_id INTEGER NOT NULL REFERENCES main_groups(id),
  sub_group_id INTEGER REFERENCES sub_groups(id),
  color_id INTEGER REFERENCES colors(id),
  material_id INTEGER REFERENCES materials(id),
  unit_of_measurement_id INTEGER NOT NULL REFERENCES units_of_measurement(id),
  description TEXT,
  description_ar TEXT,
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### After Setup

Once the tables are created, you should be able to:
- Create products without errors
- Add warehouses
- Manage inventory
- Track stock movements

### Troubleshooting

If you still get errors:
1. Check that your Supabase credentials are correct
2. Ensure you have the service role key (not just the anon key)
3. Verify the tables were created in the Table Editor
4. Check the browser console for any additional error messages
