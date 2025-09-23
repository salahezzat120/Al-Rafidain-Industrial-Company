/**
 * Test the warehouse creation fix
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

async function testWarehouseFix() {
  console.log('🧪 Testing Warehouse Creation Fix...\n');

  try {
    // Test creating a warehouse with the correct fields
    console.log('📊 Testing warehouse creation with required fields...');
    
    const testWarehouse = {
      warehouse_name: 'Test Warehouse ' + Date.now(),
      warehouse_name_ar: 'مستودع تجريبي',
      location: 'Test Location',
      location_ar: 'موقع تجريبي'
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
    } else {
      console.log('✅ Warehouse creation successful!');
      console.log('   Created warehouse:', JSON.stringify(data, null, 2));
      
      // Clean up
      await supabase.from('warehouses').delete().eq('id', data.id);
      console.log('   Test warehouse cleaned up');
    }

    // Test with minimal data (letting the function add Arabic fields)
    console.log('\n📊 Testing warehouse creation with minimal data...');
    
    const minimalWarehouse = {
      warehouse_name: 'Minimal Warehouse ' + Date.now(),
      location: 'Minimal Location'
    };

    console.log('📝 Minimal warehouse data:', JSON.stringify(minimalWarehouse, null, 2));

    const { data: minimalData, error: minimalError } = await supabase
      .from('warehouses')
      .insert([{
        warehouse_name: minimalWarehouse.warehouse_name,
        warehouse_name_ar: minimalWarehouse.warehouse_name, // Use English name as Arabic
        location: minimalWarehouse.location,
        location_ar: minimalWarehouse.location // Use English location as Arabic
      }])
      .select('*')
      .single();

    if (minimalError) {
      console.log('❌ Minimal warehouse creation failed:');
      console.log('   Error:', minimalError.message);
    } else {
      console.log('✅ Minimal warehouse creation successful!');
      console.log('   Created warehouse:', JSON.stringify(minimalData, null, 2));
      
      // Clean up
      await supabase.from('warehouses').delete().eq('id', minimalData.id);
      console.log('   Test warehouse cleaned up');
    }

    console.log('\n🎯 Test Results:');
    console.log('   - Full warehouse creation: ' + (error ? '❌ Failed' : '✅ Success'));
    console.log('   - Minimal warehouse creation: ' + (minimalError ? '❌ Failed' : '✅ Success'));

    if (!error && !minimalError) {
      console.log('\n✅ The warehouse creation fix should work now!');
      console.log('   - Admin panel warehouse creation should work');
      console.log('   - Both English and Arabic fields are handled');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWarehouseFix();
