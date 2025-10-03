// Test Database Connection and Table Existence
// This script tests if the database connection and tables are working properly

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

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection and Tables...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1️⃣ Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError.message);
      return false;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Check if products table exists and has data
    console.log('\n2️⃣ Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, product_name')
      .limit(1);

    if (productsError) {
      console.error('❌ Products table error:', productsError.message);
      if (productsError.message.includes('relation "products" does not exist')) {
        console.error('   → Products table does not exist');
      }
      return false;
    }
    console.log(`✅ Products table exists with ${products.length} records`);

    // Test 3: Check if warehouses table exists and has data
    console.log('\n3️⃣ Testing warehouses table...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, warehouse_name')
      .limit(1);

    if (warehousesError) {
      console.error('❌ Warehouses table error:', warehousesError.message);
      if (warehousesError.message.includes('relation "warehouses" does not exist')) {
        console.error('   → Warehouses table does not exist');
      }
      return false;
    }
    console.log(`✅ Warehouses table exists with ${warehouses.length} records`);

    // Test 4: Check if stock_movements table exists
    console.log('\n4️⃣ Testing stock_movements table...');
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('id, movement_type, quantity')
      .limit(1);

    if (movementsError) {
      console.error('❌ Stock movements table error:', movementsError.message);
      if (movementsError.message.includes('relation "stock_movements" does not exist')) {
        console.error('   → Stock movements table does not exist');
        console.error('   → Please run the database setup script first');
        return false;
      }
      if (movementsError.message.includes('row-level security')) {
        console.error('   → RLS policy is blocking access');
        console.error('   → Please run the RLS fix script');
        return false;
      }
      return false;
    }
    console.log(`✅ Stock movements table exists with ${movements.length} records`);

    // Test 5: Test a simple insert to stock_movements (if we have products and warehouses)
    if (products.length > 0 && warehouses.length > 0) {
      console.log('\n5️⃣ Testing stock movement creation...');
      
      const testMovement = {
        product_id: products[0].id,
        warehouse_id: warehouses[0].id,
        movement_type: 'IN',
        movement_type_ar: 'دخول',
        quantity: 1,
        unit_price: 10.00,
        reference_number: `TEST-${Date.now()}`,
        reference_number_ar: `اختبار-${Date.now()}`,
        notes: 'Test movement',
        notes_ar: 'حركة اختبار',
        created_by: 'Test Script',
        created_by_ar: 'سكريبت الاختبار',
        status: 'PENDING'
      };

      const { data: newMovement, error: insertError } = await supabase
        .from('stock_movements')
        .insert([testMovement])
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Stock movement creation failed:', insertError.message);
        console.error('   → This indicates RLS or permission issues');
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
    } else {
      console.log('\n5️⃣ Skipping stock movement creation test (no products or warehouses)');
    }

    console.log('\n🎉 All database tests passed!');
    console.log('The stock movements functionality should work correctly now.');
    return true;

  } catch (error) {
    console.error('❌ Database test failed with error:', error.message);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Database connection test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Database connection test failed!');
      console.log('Please check the error messages above and run the appropriate fix scripts.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
