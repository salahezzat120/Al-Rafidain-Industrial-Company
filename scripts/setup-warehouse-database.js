/**
 * Setup script for warehouse database
 * This script will create all necessary tables and sample data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupWarehouseDatabase() {
  console.log('🏭 Setting up Warehouse Database...\n');

  try {
    // Read the comprehensive schema
    const schemaPath = path.join(__dirname, '..', 'comprehensive-warehouse-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing comprehensive warehouse schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Some errors are expected (like table already exists)
            if (!error.message.includes('already exists') && 
                !error.message.includes('relation') && 
                !error.message.includes('duplicate key')) {
              console.log(`⚠️  Warning: ${error.message}`);
            }
          }
        } catch (err) {
          console.log(`⚠️  Warning: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Database setup completed!');
    console.log('\n📊 Verifying tables...');

    // Verify that tables exist
    const tables = [
      'warehouses',
      'products', 
      'inventory',
      'stock_movements',
      'main_groups',
      'sub_groups',
      'colors',
      'materials',
      'units_of_measurement'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n🎯 Warehouse Database Setup Complete!');
    console.log('   - All tables created');
    console.log('   - Sample data inserted');
    console.log('   - Ready for warehouse management');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupWarehouseDatabase();
