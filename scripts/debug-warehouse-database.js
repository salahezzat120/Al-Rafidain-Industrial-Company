/**
 * Debug script to check warehouse database tables and data
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseServiceKey === 'YOUR_SERVICE_KEY') {
  console.log('⚠️  Please set your Supabase credentials in the script or environment variables');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDatabase() {
  console.log('🔍 Debugging Warehouse Database...\n');

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

  try {
    // Check if tables exist and have data
    for (const table of tables) {
      console.log(`📊 Checking table: ${table}`);
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(5);
        
        if (error) {
          console.log(`❌ Error: ${error.message}`);
        } else {
          console.log(`✅ Table exists with ${count} records`);
          if (data && data.length > 0) {
            console.log(`   Sample data: ${JSON.stringify(data[0], null, 2)}`);
          }
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
      }
      
      console.log('');
    }

    // Test the specific query that's failing
    console.log('🧪 Testing getProductsWithWarehouseInfo query...');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          main_group:main_groups(*),
          sub_group:sub_groups(*),
          color:colors(*),
          material:materials(*),
          unit_of_measurement:units_of_measurement(*),
          inventory:inventory(
            *,
            warehouse:warehouses(*)
          )
        `)
        .eq('is_active', true)
        .order('product_name')
        .limit(1);

      if (error) {
        console.log(`❌ Query failed: ${error.message}`);
        console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log(`✅ Query successful`);
        console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      console.log(`❌ Query exception: ${err.message}`);
    }

    // Test simple product creation
    console.log('\n🧪 Testing simple product creation...');
    
    try {
      const testProduct = {
        product_name: 'Test Product',
        product_name_ar: 'منتج تجريبي',
        product_code: 'TEST-' + Date.now(),
        main_group_id: 1,
        unit_of_measurement_id: 1,
        description: 'Test product for debugging',
        cost_price: 1.00,
        selling_price: 2.00,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select('*')
        .single();

      if (error) {
        console.log(`❌ Product creation failed: ${error.message}`);
        console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log(`✅ Product creation successful`);
        console.log(`   Created product: ${JSON.stringify(data, null, 2)}`);
        
        // Clean up test product
        await supabase.from('products').delete().eq('id', data.id);
        console.log(`   Test product cleaned up`);
      }
    } catch (err) {
      console.log(`❌ Product creation exception: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugDatabase();
