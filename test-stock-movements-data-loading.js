// Test Stock Movements Data Loading
// This script tests if products and warehouses are loading correctly in stock movements

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDataLoading() {
  console.log('🧪 Testing Stock Movements Data Loading...\n');

  try {
    // Test 1: Check products
    console.log('1️⃣ Testing products loading...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, product_name, product_name_ar')
      .limit(5);

    if (productsError) {
      console.error('❌ Products loading failed:', productsError.message);
      return false;
    }

    console.log(`✅ Products loaded: ${products.length} records`);
    if (products.length > 0) {
      console.log('📦 Sample products:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.product_name} (ID: ${product.id})`);
      });
    } else {
      console.log('⚠️ No products found in database');
    }

    // Test 2: Check warehouses
    console.log('\n2️⃣ Testing warehouses loading...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, warehouse_name, warehouse_name_ar, location')
      .limit(5);

    if (warehousesError) {
      console.error('❌ Warehouses loading failed:', warehousesError.message);
      return false;
    }

    console.log(`✅ Warehouses loaded: ${warehouses.length} records`);
    if (warehouses.length > 0) {
      console.log('🏭 Sample warehouses:');
      warehouses.forEach((warehouse, index) => {
        console.log(`   ${index + 1}. ${warehouse.warehouse_name} - ${warehouse.location} (ID: ${warehouse.id})`);
      });
    } else {
      console.log('⚠️ No warehouses found in database');
    }

    // Test 3: Check stock movements
    console.log('\n3️⃣ Testing stock movements loading...');
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select(`
        id,
        movement_type,
        movement_type_ar,
        quantity,
        reference_number,
        status,
        created_at,
        product:products(id, product_name),
        warehouse:warehouses(id, warehouse_name)
      `)
      .limit(5);

    if (movementsError) {
      console.error('❌ Stock movements loading failed:', movementsError.message);
      return false;
    }

    console.log(`✅ Stock movements loaded: ${movements.length} records`);
    if (movements.length > 0) {
      console.log('📋 Sample movements:');
      movements.forEach((movement, index) => {
        console.log(`   ${index + 1}. ${movement.movement_type} - ${movement.product?.product_name} in ${movement.warehouse?.warehouse_name} (Qty: ${movement.quantity})`);
      });
    } else {
      console.log('⚠️ No stock movements found in database');
    }

    // Summary
    console.log('\n📊 Data Loading Summary:');
    console.log(`   Products: ${products.length} records`);
    console.log(`   Warehouses: ${warehouses.length} records`);
    console.log(`   Stock Movements: ${movements.length} records`);

    if (products.length === 0) {
      console.log('\n⚠️ No products found. You may need to:');
      console.log('   1. Create some products in the warehouse management interface');
      console.log('   2. Check if the products table exists and has data');
    }

    if (warehouses.length === 0) {
      console.log('\n⚠️ No warehouses found. You may need to:');
      console.log('   1. Create some warehouses in the warehouse management interface');
      console.log('   2. Check if the warehouses table exists and has data');
    }

    console.log('\n🎉 Data loading test completed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testDataLoading()
  .then(success => {
    if (success) {
      console.log('\n✅ Stock movements data loading test passed!');
      console.log('The dropdowns should now be populated with data from the database.');
      process.exit(0);
    } else {
      console.log('\n❌ Stock movements data loading test failed!');
      console.log('Check the error messages above for specific issues.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
