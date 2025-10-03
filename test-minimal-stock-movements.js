// Test Minimal Stock Movements Setup
// This script tests the minimal stock movements setup without complex fields

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

async function testMinimalStockMovements() {
  console.log('🧪 Testing Minimal Stock Movements Setup...\n');

  try {
    // Test 1: Check if stock_movements table exists and has minimal structure
    console.log('1️⃣ Checking stock_movements table structure...');
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .limit(1);

    if (movementsError) {
      console.error('❌ Stock movements table error:', movementsError.message);
      if (movementsError.message.includes('relation "stock_movements" does not exist')) {
        console.error('   → Please run the minimal database setup script first');
        return false;
      }
      return false;
    }
    console.log('✅ Stock movements table exists');

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const { data: tableInfo } = await supabase
      .rpc('get_table_columns', { table_name: 'stock_movements' })
      .catch(() => null);

    if (tableInfo) {
      console.log('📋 Table columns:', tableInfo.map(col => col.column_name).join(', '));
    } else {
      console.log('📋 Table structure check skipped (function not available)');
    }

    // Test 3: Test simple query
    console.log('\n3️⃣ Testing simple query...');
    const { data: allMovements, error: queryError } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queryError) {
      console.error('❌ Simple query failed:', queryError.message);
      return false;
    }
    console.log(`✅ Simple query successful: ${allMovements.length} movements`);

    // Test 4: Check if we have products and warehouses
    console.log('\n4️⃣ Checking related tables...');
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

    // Test 5: Test creating a minimal stock movement
    if (products && products.length > 0 && warehouses && warehouses.length > 0) {
      console.log('\n5️⃣ Testing minimal stock movement creation...');
      
      const testMovement = {
        product_id: products[0].id,
        warehouse_id: warehouses[0].id,
        movement_type: 'IN',
        movement_type_ar: 'دخول',
        quantity: 1,
        unit_price: 10.00,
        reference_number: `TEST-MIN-${Date.now()}`,
        reference_number_ar: `اختبار-حد أدنى-${Date.now()}`,
        notes: 'Test minimal movement',
        notes_ar: 'اختبار حركة الحد الأدنى',
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

      console.log('✅ Minimal stock movement created successfully:', newMovement.id);

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

    // Test 6: Show sample data
    console.log('\n6️⃣ Sample stock movements:');
    if (allMovements.length > 0) {
      allMovements.forEach((movement, index) => {
        console.log(`   ${index + 1}. ${movement.movement_type} - Product ID: ${movement.product_id}, Warehouse ID: ${movement.warehouse_id}, Qty: ${movement.quantity}`);
        console.log(`      Reference: ${movement.reference_number}, Created: ${movement.created_at}`);
      });
    } else {
      console.log('   No stock movements found');
    }

    console.log('\n🎉 Minimal stock movements test completed successfully!');
    console.log('The schema cache errors should now be resolved.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testMinimalStockMovements()
  .then(success => {
    if (success) {
      console.log('\n✅ Minimal stock movements test passed!');
      console.log('You can now use the stock movements functionality without schema cache errors.');
      process.exit(0);
    } else {
      console.log('\n❌ Minimal stock movements test failed!');
      console.log('Please run the minimal database setup script and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
