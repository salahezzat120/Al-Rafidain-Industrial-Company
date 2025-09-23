/**
 * Simple test to create a product and see what happens
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

async function testSimpleProduct() {
  console.log('🧪 Testing Simple Product Creation...\n');

  try {
    // First, let's see what data we have
    console.log('📊 Checking available data...');
    
    const { data: mainGroups } = await supabase.from('main_groups').select('*').limit(1);
    const { data: units } = await supabase.from('units_of_measurement').select('*').limit(1);
    const { data: subGroups } = await supabase.from('sub_groups').select('*').limit(1);
    
    console.log('Main groups:', mainGroups?.length || 0);
    console.log('Units:', units?.length || 0);
    console.log('Sub groups:', subGroups?.length || 0);

    if (!mainGroups || mainGroups.length === 0) {
      console.log('❌ No main groups found');
      return;
    }

    if (!units || units.length === 0) {
      console.log('❌ No units found');
      return;
    }

    if (!subGroups || subGroups.length === 0) {
      console.log('❌ No sub groups found');
      return;
    }

    // Now try to create a product with minimal data
    console.log('\n🧪 Creating product with minimal data...');
    
    const productData = {
      product_name: 'Test Product ' + Date.now(),
      product_name_ar: 'منتج تجريبي',
      product_code: 'TEST-' + Date.now(),
      main_group_id: mainGroups[0].id,
      sub_group_id: subGroups[0].id,
      unit_of_measurement_id: units[0].id,
      description: 'Test product'
    };

    console.log('📝 Product data:', JSON.stringify(productData, null, 2));

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select('*')
      .single();

    if (error) {
      console.log('❌ Product creation failed:');
      console.log('   Error:', error.message);
      console.log('   Details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Product creation successful!');
      console.log('   Created product:', JSON.stringify(data, null, 2));
      
      // Clean up
      await supabase.from('products').delete().eq('id', data.id);
      console.log('   Test product cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSimpleProduct();
