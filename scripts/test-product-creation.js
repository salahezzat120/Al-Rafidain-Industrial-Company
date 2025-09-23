/**
 * Test product creation to identify the exact issue
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

async function testProductCreation() {
  console.log('🧪 Testing Product Creation...\n');

  try {
    // First, check if we have the required reference data
    console.log('📊 Checking reference data...');
    
    const { data: mainGroups, error: mainGroupsError } = await supabase
      .from('main_groups')
      .select('*')
      .limit(1);
    
    if (mainGroupsError) {
      console.log(`❌ Main groups error: ${mainGroupsError.message}`);
      return;
    }
    
    if (!mainGroups || mainGroups.length === 0) {
      console.log('❌ No main groups found. Creating sample data...');
      
      // Insert sample main group
      const { data: newMainGroup, error: insertError } = await supabase
        .from('main_groups')
        .insert([{
          group_name: 'Test Group',
          group_name_ar: 'مجموعة تجريبية',
          description: 'Test group for debugging'
        }])
        .select('*')
        .single();
      
      if (insertError) {
        console.log(`❌ Failed to create main group: ${insertError.message}`);
        return;
      }
      
      console.log(`✅ Created main group: ${newMainGroup.id}`);
    } else {
      console.log(`✅ Main groups found: ${mainGroups.length} records`);
    }

    // Check units of measurement
    const { data: units, error: unitsError } = await supabase
      .from('units_of_measurement')
      .select('*')
      .limit(1);
    
    if (unitsError) {
      console.log(`❌ Units error: ${unitsError.message}`);
      return;
    }
    
    if (!units || units.length === 0) {
      console.log('❌ No units found. Creating sample data...');
      
      // Insert sample unit
      const { data: newUnit, error: insertError } = await supabase
        .from('units_of_measurement')
        .insert([{
          unit_name: 'Piece',
          unit_name_ar: 'قطعة',
          unit_symbol: 'pcs',
          unit_type: 'COUNT'
        }])
        .select('*')
        .single();
      
      if (insertError) {
        console.log(`❌ Failed to create unit: ${insertError.message}`);
        return;
      }
      
      console.log(`✅ Created unit: ${newUnit.id}`);
    } else {
      console.log(`✅ Units found: ${units.length} records`);
    }

    // Now try to create a product
    console.log('\n🧪 Testing product creation...');
    
    const testProduct = {
      product_name: 'Test Product ' + Date.now(),
      product_name_ar: 'منتج تجريبي',
      product_code: 'TEST-' + Date.now(),
      main_group_id: mainGroups?.[0]?.id || 1,
      unit_of_measurement_id: units?.[0]?.id || 1,
      description: 'Test product for debugging',
      cost_price: 1.00,
      selling_price: 2.00,
      is_active: true
    };

    console.log('📝 Product data:', JSON.stringify(testProduct, null, 2));

    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select('*')
      .single();

    if (error) {
      console.log(`❌ Product creation failed:`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Details: ${JSON.stringify(error, null, 2)}`);
      
      // Check if it's a foreign key constraint issue
      if (error.message.includes('foreign key') || error.message.includes('constraint')) {
        console.log('\n🔍 This looks like a foreign key constraint issue.');
        console.log('   Make sure the main_group_id and unit_of_measurement_id exist in their respective tables.');
      }
    } else {
      console.log(`✅ Product creation successful!`);
      console.log(`   Created product: ${JSON.stringify(data, null, 2)}`);
      
      // Clean up
      await supabase.from('products').delete().eq('id', data.id);
      console.log(`   Test product cleaned up`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductCreation();
