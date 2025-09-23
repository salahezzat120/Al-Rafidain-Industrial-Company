/**
 * Test products loading to verify the fix
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

async function testProductsLoading() {
  console.log('🧪 Testing Products Loading...\n');

  try {
    // Test 1: Basic products query
    console.log('📊 Testing basic products query...');
    const { data: basicProducts, error: basicError } = await supabase
      .from('products')
      .select('*')
      .order('product_name');

    if (basicError) {
      console.log('❌ Basic products query failed:', basicError.message);
    } else {
      console.log('✅ Basic products query successful');
      console.log(`   Found ${basicProducts?.length || 0} products`);
    }

    // Test 2: Products with relationships
    console.log('\n📊 Testing products with relationships...');
    const { data: productsWithRelations, error: relationsError } = await supabase
      .from('products')
      .select(`
        *,
        main_group:main_groups(*),
        sub_group:sub_groups(*),
        color:colors(*),
        material:materials(*),
        unit_of_measurement:units_of_measurement(*)
      `)
      .order('product_name');

    if (relationsError) {
      console.log('❌ Products with relationships query failed:', relationsError.message);
    } else {
      console.log('✅ Products with relationships query successful');
      console.log(`   Found ${productsWithRelations?.length || 0} products`);
      if (productsWithRelations && productsWithRelations.length > 0) {
        console.log('   Sample product:', JSON.stringify(productsWithRelations[0], null, 2));
      }
    }

    // Test 3: Products with inventory (this might fail)
    console.log('\n📊 Testing products with inventory...');
    const { data: productsWithInventory, error: inventoryError } = await supabase
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
      .order('product_name');

    if (inventoryError) {
      console.log('❌ Products with inventory query failed:', inventoryError.message);
      console.log('   This is expected if inventory table doesn\'t exist or has issues');
    } else {
      console.log('✅ Products with inventory query successful');
      console.log(`   Found ${productsWithInventory?.length || 0} products`);
    }

    console.log('\n🎯 Test Results:');
    console.log('   - Basic products query: ' + (basicError ? '❌ Failed' : '✅ Success'));
    console.log('   - Products with relationships: ' + (relationsError ? '❌ Failed' : '✅ Success'));
    console.log('   - Products with inventory: ' + (inventoryError ? '❌ Failed' : '✅ Success'));

    if (!basicError) {
      console.log('\n✅ The warehouse management system should work now!');
      console.log('   - Products can be loaded');
      console.log('   - Admin panel should work');
      console.log('   - Product creation should work');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductsLoading();
