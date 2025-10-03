const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_KEY') {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStockReduction() {
  console.log('🔍 Testing stock reduction functionality...');
  
  try {
    // Test 1: Check if we have products with stock
    console.log('\n1. Checking products with stock...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, product_name, product_code, stock')
      .gt('stock', 0)
      .limit(3);

    if (productsError) {
      console.error('❌ Error accessing products:', productsError);
      return;
    }

    if (!products || products.length === 0) {
      console.error('❌ No products with stock found. Please add products with stock first.');
      return;
    }

    console.log('✅ Found products with stock:');
    products.forEach(product => {
      console.log(`  - ${product.product_name} (${product.product_code}): ${product.stock} units`);
    });

    // Test 2: Check if we have customers
    console.log('\n2. Checking customers...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name')
      .limit(1);

    if (customersError) {
      console.error('❌ Error accessing customers:', customersError);
      return;
    }

    if (!customers || customers.length === 0) {
      console.error('❌ No customers found. Please add customers first.');
      return;
    }

    console.log('✅ Found customer:', customers[0].name);

    // Test 3: Create a delivery task with products
    console.log('\n3. Creating delivery task with stock reduction...');
    
    const testProduct = products[0];
    const originalStock = parseFloat(testProduct.stock);
    const quantityToReduce = Math.min(2, Math.floor(originalStock / 2)); // Reduce by 2 or half of stock, whichever is smaller
    
    console.log(`📦 Testing with product: ${testProduct.product_name}`);
    console.log(`📊 Original stock: ${originalStock}, Reducing by: ${quantityToReduce}`);
    
    const taskData = {
      task_id: 'STOCK-TEST-' + Date.now(),
      title: 'Stock Reduction Test Task',
      description: 'Test task to verify stock reduction',
      customer_id: customers[0].id,
      customer_name: customers[0].name,
      customer_address: 'Test Address',
      customer_phone: '1234567890',
      priority: 'medium',
      status: 'pending',
      estimated_duration: '1 hour',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      total_value: quantityToReduce * 100.00,
      currency: 'IQD',
      notes: 'Test task for stock reduction'
    };

    const { data: task, error: taskError } = await supabase
      .from('delivery_tasks')
      .insert([taskData])
      .select()
      .single();

    if (taskError) {
      console.error('❌ Error creating delivery task:', taskError);
      return;
    }

    console.log('✅ Delivery task created:', task.id);

    // Test 4: Create task items (this should trigger stock reduction)
    console.log('\n4. Creating task items to trigger stock reduction...');
    
    const itemData = {
      task_id: task.id,
      product_id: testProduct.id,
      product_name: testProduct.product_name,
      product_code: testProduct.product_code,
      quantity: quantityToReduce,
      unit_price: 100.00,
      total_price: quantityToReduce * 100.00,
      unit_of_measurement: 'pcs',
      warehouse_id: null,
      warehouse_name: 'Test Warehouse'
    };

    const { data: item, error: itemError } = await supabase
      .from('task_items')
      .insert([itemData])
      .select()
      .single();

    if (itemError) {
      console.error('❌ Error creating task item:', itemError);
      await supabase.from('delivery_tasks').delete().eq('id', task.id);
      return;
    }

    console.log('✅ Task item created:', item.id);

    // Test 5: Check if stock was reduced
    console.log('\n5. Checking if stock was reduced...');
    
    const { data: updatedProduct, error: stockError } = await supabase
      .from('products')
      .select('stock, product_name')
      .eq('id', testProduct.id)
      .single();

    if (stockError) {
      console.error('❌ Error checking stock:', stockError);
    } else {
      const newStock = parseFloat(updatedProduct.stock);
      const expectedStock = originalStock - quantityToReduce;
      
      console.log(`📊 Stock check:`);
      console.log(`  Original: ${originalStock}`);
      console.log(`  Expected: ${expectedStock}`);
      console.log(`  Actual: ${newStock}`);
      
      if (Math.abs(newStock - expectedStock) < 0.01) {
        console.log('✅ Stock reduction working correctly!');
      } else {
        console.log('❌ Stock reduction not working - values do not match');
      }
    }

    // Clean up
    console.log('\n6. Cleaning up test data...');
    await supabase.from('task_items').delete().eq('task_id', task.id);
    await supabase.from('delivery_tasks').delete().eq('id', task.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Stock reduction test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStockReduction();

