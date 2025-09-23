/**
 * Test warehouse creation to verify it works
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseServiceKey === 'YOUR_SERVICE_KEY') {
  console.log('⚠️  Please set your Supabase credentials in the script or environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWarehouseCreation() {
  console.log('🧪 Testing Warehouse Creation...\n');

  try {
    // First, let's see what the warehouses table structure looks like
    console.log('📊 Checking warehouses table structure...');
    
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*')
      .limit(1);

    if (warehousesError) {
      console.log('❌ Warehouses table error:', warehousesError.message);
      return;
    }

    console.log('✅ Warehouses table exists');
    
    if (warehouses && warehouses.length > 0) {
      console.log('📋 Sample warehouse structure:');
      console.log('   Columns:', Object.keys(warehouses[0]));
      console.log('   Sample data:', JSON.stringify(warehouses[0], null, 2));
    }

    // Test creating a warehouse with minimal data
    console.log('\n🧪 Testing warehouse creation...');
    
    const testWarehouse = {
      warehouse_name: 'Test Warehouse ' + Date.now(),
      location: 'Test Location'
    };

    console.log('📝 Warehouse data:', JSON.stringify(testWarehouse, null, 2));

    const { data, error } = await supabase
      .from('warehouses')
      .insert([testWarehouse])
      .select('*')
      .single();

    if (error) {
      console.log('❌ Warehouse creation failed:');
      console.log('   Error:', error.message);
      console.log('   Details:', JSON.stringify(error, null, 2));
      
      // Check if it's a column issue
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        console.log('\n🔍 This looks like a column structure issue.');
        console.log('   The warehouses table might have different columns than expected.');
        console.log('   Please check your database table structure.');
      }
    } else {
      console.log('✅ Warehouse creation successful!');
      console.log('   Created warehouse:', JSON.stringify(data, null, 2));
      
      // Clean up
      await supabase.from('warehouses').delete().eq('id', data.id);
      console.log('   Test warehouse cleaned up');
    }

    // Test the getWarehouses function
    console.log('\n🧪 Testing getWarehouses function...');
    
    const { data: allWarehouses, error: getError } = await supabase
      .from('warehouses')
      .select('*')
      .order('warehouse_name');

    if (getError) {
      console.log('❌ getWarehouses failed:', getError.message);
    } else {
      console.log('✅ getWarehouses successful');
      console.log(`   Found ${allWarehouses?.length || 0} warehouses`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWarehouseCreation();
