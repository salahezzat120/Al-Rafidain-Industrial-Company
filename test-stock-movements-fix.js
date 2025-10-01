// Test Stock Movements Fix
// This script tests the stock movements functionality after the fix

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

async function testStockMovements() {
  console.log('🧪 Testing Stock Movements Functionality...\n');

  try {
    // Test 1: Check if stock_movements table exists
    console.log('1️⃣ Checking if stock_movements table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('stock_movements')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      return false;
    }
    console.log('✅ Stock movements table exists');

    // Test 2: Check if we can read stock movements
    console.log('\n2️⃣ Testing read access...');
    const { data: movements, error: readError } = await supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `)
      .limit(5);

    if (readError) {
      console.error('❌ Read test failed:', readError.message);
      return false;
    }
    console.log(`✅ Successfully read ${movements.length} stock movements`);

    // Test 3: Check if we can create a stock movement
    console.log('\n3️⃣ Testing create access...');
    
    // First, get a product and warehouse
    const { data: products } = await supabase.from('products').select('id').limit(1);
    const { data: warehouses } = await supabase.from('warehouses').select('id').limit(1);

    if (!products || products.length === 0) {
      console.log('⚠️ No products found - skipping create test');
      return true;
    }

    if (!warehouses || warehouses.length === 0) {
      console.log('⚠️ No warehouses found - skipping create test');
      return true;
    }

    const testMovement = {
      product_id: products[0].id,
      warehouse_id: warehouses[0].id,
      movement_type: 'IN',
      movement_type_ar: 'دخول',
      quantity: 10,
      unit_price: 25.50,
      reference_number: `TEST-${Date.now()}`,
      reference_number_ar: `اختبار-${Date.now()}`,
      notes: 'Test movement',
      notes_ar: 'حركة اختبار',
      created_by: 'Test Script',
      created_by_ar: 'سكريبت الاختبار',
      status: 'PENDING'
    };

    const { data: newMovement, error: createError } = await supabase
      .from('stock_movements')
      .insert([testMovement])
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `)
      .single();

    if (createError) {
      console.error('❌ Create test failed:', createError.message);
      return false;
    }
    console.log('✅ Successfully created stock movement:', newMovement.id);

    // Test 4: Clean up test data
    console.log('\n4️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('stock_movements')
      .delete()
      .eq('id', newMovement.id);

    if (deleteError) {
      console.warn('⚠️ Failed to clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 All tests passed! Stock movements functionality is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testStockMovements()
  .then(success => {
    if (success) {
      console.log('\n✅ Stock movements fix verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Stock movements fix verification failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
