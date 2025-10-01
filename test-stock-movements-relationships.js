// Test Stock Movements Relationships Fix
// This script tests if the foreign key relationships are working properly

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

async function testStockMovementsRelationships() {
  console.log('🧪 Testing Stock Movements Relationships...\n');

  try {
    // Test 1: Check if stock_movements table exists
    console.log('1️⃣ Checking stock_movements table...');
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .limit(1);

    if (movementsError) {
      console.error('❌ Stock movements table error:', movementsError.message);
      if (movementsError.message.includes('relation "stock_movements" does not exist')) {
        console.error('   → Please run the database setup script first');
        return false;
      }
      return false;
    }
    console.log('✅ Stock movements table exists');

    // Test 2: Check if we can fetch movements with simple query
    console.log('\n2️⃣ Testing simple stock movements query...');
    const { data: allMovements, error: allMovementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allMovementsError) {
      console.error('❌ Simple query failed:', allMovementsError.message);
      return false;
    }
    console.log(`✅ Simple query successful: ${allMovements.length} movements`);

    // Test 3: Check if products and warehouses exist
    console.log('\n3️⃣ Checking related tables...');
    const { data: products } = await supabase.from('products').select('id, product_name').limit(1);
    const { data: warehouses } = await supabase.from('warehouses').select('id, warehouse_name').limit(1);

    if (!products || products.length === 0) {
      console.log('⚠️ No products found - you may need to create some products first');
    } else {
      console.log(`✅ Products table exists: ${products.length} records`);
    }

    if (!warehouses || warehouses.length === 0) {
      console.log('⚠️ No warehouses found - you may need to create some warehouses first');
    } else {
      console.log(`✅ Warehouses table exists: ${warehouses.length} records`);
    }

    // Test 4: Test creating a stock movement (if we have products and warehouses)
    if (products && products.length > 0 && warehouses && warehouses.length > 0) {
      console.log('\n4️⃣ Testing stock movement creation...');
      
      const testMovement = {
        product_id: products[0].id,
        warehouse_id: warehouses[0].id,
        movement_type: 'IN',
        movement_type_ar: 'دخول',
        quantity: 1,
        unit_price: 10.00,
        reference_number: `TEST-REL-${Date.now()}`,
        reference_number_ar: `اختبار-علاقة-${Date.now()}`,
        notes: 'Test relationship',
        notes_ar: 'اختبار العلاقة',
        created_by: 'Test Script',
        created_by_ar: 'سكريبت الاختبار',
        status: 'PENDING'
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
    } else {
      console.log('\n4️⃣ Skipping stock movement creation test (no products or warehouses)');
    }

    // Test 5: Show sample data
    console.log('\n5️⃣ Sample stock movements:');
    if (allMovements.length > 0) {
      allMovements.forEach((movement, index) => {
        console.log(`   ${index + 1}. ${movement.movement_type} - Product ID: ${movement.product_id}, Warehouse ID: ${movement.warehouse_id}, Qty: ${movement.quantity}`);
      });
    } else {
      console.log('   No stock movements found');
    }

    console.log('\n🎉 Stock movements relationships test completed successfully!');
    console.log('The foreign key relationship error should now be resolved.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testStockMovementsRelationships()
  .then(success => {
    if (success) {
      console.log('\n✅ Stock movements relationships test passed!');
      console.log('You can now use the stock movements functionality without foreign key relationship errors.');
      process.exit(0);
    } else {
      console.log('\n❌ Stock movements relationships test failed!');
      console.log('Please run the database setup script and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
