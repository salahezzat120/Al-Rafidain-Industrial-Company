// Test Complete Stock Movements Setup
// This script tests the complete setup with products, warehouses, and stock movements

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

async function testCompleteStockMovementsSetup() {
  console.log('🧪 Testing Complete Stock Movements Setup...\n');

  try {
    // Test 1: Check if products exist
    console.log('1️⃣ Checking products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, product_name, product_code')
      .limit(5);

    if (productsError) {
      console.error('❌ Products error:', productsError.message);
      return false;
    }

    if (products.length === 0) {
      console.log('⚠️ No products found - you may need to run the complete setup script');
      return false;
    }

    console.log(`✅ Products found: ${products.length} records`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.product_name} (${product.product_code}) - ID: ${product.id}`);
    });

    // Test 2: Check if warehouses exist
    console.log('\n2️⃣ Checking warehouses...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, warehouse_name, location')
      .limit(5);

    if (warehousesError) {
      console.error('❌ Warehouses error:', warehousesError.message);
      return false;
    }

    if (warehouses.length === 0) {
      console.log('⚠️ No warehouses found - you may need to run the complete setup script');
      return false;
    }

    console.log(`✅ Warehouses found: ${warehouses.length} records`);
    warehouses.forEach((warehouse, index) => {
      console.log(`   ${index + 1}. ${warehouse.warehouse_name} (${warehouse.location}) - ID: ${warehouse.id}`);
    });

    // Test 3: Check if stock_movements table exists
    console.log('\n3️⃣ Checking stock movements table...');
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .limit(1);

    if (movementsError) {
      console.error('❌ Stock movements table error:', movementsError.message);
      if (movementsError.message.includes('relation "stock_movements" does not exist')) {
        console.error('   → Please run the complete database setup script first');
        return false;
      }
      return false;
    }
    console.log('✅ Stock movements table exists');

    // Test 4: Test stock movements query
    console.log('\n4️⃣ Testing stock movements query...');
    const { data: allMovements, error: queryError } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queryError) {
      console.error('❌ Stock movements query failed:', queryError.message);
      return false;
    }
    console.log(`✅ Stock movements query successful: ${allMovements.length} movements`);

    // Test 5: Test creating a stock movement
    console.log('\n5️⃣ Testing stock movement creation...');
    
    const testMovement = {
      product_id: products[0].id,
      warehouse_id: warehouses[0].id,
      movement_type: 'IN',
      movement_type_ar: 'دخول',
      quantity: 1,
      unit_price: 10.00,
      reference_number: `TEST-COMPLETE-${Date.now()}`,
      reference_number_ar: `اختبار-كامل-${Date.now()}`,
      notes: 'Test complete setup',
      notes_ar: 'اختبار الإعداد الكامل',
      created_by: 'Test Script',
      created_by_ar: 'سكريبت الاختبار'
    };

    const { data: newMovement, error: createError } = await supabase
      .from('stock_movements')
      .insert([testMovement])
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Stock movement creation failed:', createError.message);
      return false;
    }

    console.log('✅ Stock movement created successfully:', newMovement.id);

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('stock_movements')
      .delete()
      .eq('id', newMovement.id);

    if (deleteError) {
      console.warn('⚠️ Failed to clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    // Test 6: Show sample data
    console.log('\n6️⃣ Sample stock movements:');
    if (allMovements.length > 0) {
      allMovements.forEach((movement, index) => {
        const product = products.find(p => p.id === movement.product_id);
        const warehouse = warehouses.find(w => w.id === movement.warehouse_id);
        console.log(`   ${index + 1}. ${movement.movement_type} - ${product?.product_name || 'Unknown Product'} in ${warehouse?.warehouse_name || 'Unknown Warehouse'}`);
        console.log(`      Quantity: ${movement.quantity}, Reference: ${movement.reference_number}`);
      });
    } else {
      console.log('   No stock movements found');
    }

    console.log('\n🎉 Complete stock movements setup test completed successfully!');
    console.log('All foreign key relationships are working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testCompleteStockMovementsSetup()
  .then(success => {
    if (success) {
      console.log('\n✅ Complete stock movements setup test passed!');
      console.log('You can now use the stock movements functionality without foreign key errors.');
      process.exit(0);
    } else {
      console.log('\n❌ Complete stock movements setup test failed!');
      console.log('Please run the complete database setup script and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
