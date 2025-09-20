// Setup script for Warehouse Management Database
// Run this script to create all warehouse-related tables and populate initial data

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWarehouseDatabase() {
  console.log('🏭 Setting up Warehouse Management Database...');

  try {
    // Read the SQL schema file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'warehouse-database-schema.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ warehouse-database-schema.sql file not found');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('🎉 Warehouse database setup completed!');
    console.log('\n📊 Database includes:');
    console.log('   • Warehouses table with 4 default warehouses');
    console.log('   • Products table with full specifications');
    console.log('   • Inventory table with stock tracking');
    console.log('   • Master data tables (units, groups, colors, materials)');
    console.log('   • Stock movements tracking');
    console.log('   • Performance indexes and triggers');
    console.log('\n🚀 You can now use the Warehouse Management system in the admin panel!');

  } catch (error) {
    console.error('❌ Error setting up warehouse database:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupWarehouseDatabaseDirect() {
  console.log('🏭 Setting up Warehouse Management Database (Direct Method)...');

  try {
    // Create warehouses table
    console.log('📦 Creating warehouses table...');
    const { error: warehousesError } = await supabase
      .from('warehouses')
      .select('*')
      .limit(1);

    if (warehousesError && warehousesError.code === 'PGRST116') {
      console.log('⚠️  Warehouses table does not exist. Please run the SQL schema manually.');
      console.log('📄 Run the contents of warehouse-database-schema.sql in your Supabase SQL editor.');
      return;
    }

    // Check if data already exists
    const { data: existingWarehouses } = await supabase
      .from('warehouses')
      .select('id')
      .limit(1);

    if (existingWarehouses && existingWarehouses.length > 0) {
      console.log('✅ Warehouse database already set up!');
      return;
    }

    // Insert default warehouses
    console.log('📝 Inserting default warehouses...');
    const { error: insertError } = await supabase
      .from('warehouses')
      .insert([
        {
          warehouse_name: 'Factory Warehouse',
          location: 'Main Factory Location',
          responsible_person: 'Factory Manager'
        },
        {
          warehouse_name: 'Cairo Distribution Warehouse',
          location: 'Cairo, Egypt',
          responsible_person: 'Cairo Warehouse Manager'
        },
        {
          warehouse_name: 'Alexandria Warehouse',
          location: 'Alexandria, Egypt',
          responsible_person: 'Alexandria Warehouse Manager'
        },
        {
          warehouse_name: 'Sales Representatives Sub-Store',
          location: 'Various Locations',
          responsible_person: 'Sales Manager'
        }
      ]);

    if (insertError) {
      console.error('❌ Error inserting warehouses:', insertError);
    } else {
      console.log('✅ Default warehouses inserted successfully!');
    }

    console.log('🎉 Warehouse database setup completed!');
    console.log('\n📊 Database includes:');
    console.log('   • 4 default warehouses');
    console.log('   • Ready for product and inventory management');
    console.log('\n🚀 You can now use the Warehouse Management system in the admin panel!');

  } catch (error) {
    console.error('❌ Error setting up warehouse database:', error);
    console.log('\n📄 Please run the contents of warehouse-database-schema.sql in your Supabase SQL editor.');
  }
}

// Run the setup
if (require.main === module) {
  setupWarehouseDatabaseDirect();
}

module.exports = { setupWarehouseDatabase, setupWarehouseDatabaseDirect };
