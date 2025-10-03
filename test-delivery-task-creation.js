const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeliveryTaskCreation() {
  console.log('🔍 Testing delivery task creation...');
  
  try {
    // Test 1: Check if we have customers
    console.log('\n1. Checking customers...');
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

    // Test 2: Check if we have representatives
    console.log('\n2. Checking representatives...');
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('id, name, status')
      .limit(1);

    if (repsError) {
      console.error('❌ Error accessing representatives:', repsError);
      return;
    }

    if (!representatives || representatives.length === 0) {
      console.log('⚠️  No representatives found. Will create task without representative.');
    } else {
      console.log('✅ Found representative:', representatives[0].name);
    }

    // Test 3: Create a simple delivery task
    console.log('\n3. Creating delivery task...');
    
    const taskData = {
      task_id: 'TEST-' + Date.now(),
      title: 'Test Delivery Task',
      description: 'Test task created by script',
      customer_id: customers[0].id,
      customer_name: customers[0].name,
      customer_address: 'Test Address',
      customer_phone: '1234567890',
      representative_id: representatives && representatives.length > 0 ? representatives[0].id : null,
      representative_name: representatives && representatives.length > 0 ? representatives[0].name : null,
      priority: 'medium',
      status: 'pending',
      estimated_duration: '1 hour',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      total_value: 100.00,
      currency: 'IQD',
      notes: 'Test task created by script'
    };

    const { data: task, error: taskError } = await supabase
      .from('delivery_tasks')
      .insert([taskData])
      .select()
      .single();

    if (taskError) {
      console.error('❌ Error creating delivery task:', taskError);
      console.error('❌ Full error details:', JSON.stringify(taskError, null, 2));
      return;
    }

    console.log('✅ Delivery task created successfully:', task.id);

    // Test 4: Create task items
    console.log('\n4. Creating task items...');
    
    const itemData = {
      task_id: task.id,
      product_id: null, // No product ID for test
      product_name: 'Test Product',
      product_code: 'TEST-001',
      quantity: 1,
      unit_price: 100.00,
      total_price: 100.00,
      unit_of_measurement: 'pcs',
      warehouse_id: null, // No warehouse ID for test
      warehouse_name: 'Test Warehouse'
    };

    const { data: item, error: itemError } = await supabase
      .from('task_items')
      .insert([itemData])
      .select()
      .single();

    if (itemError) {
      console.error('❌ Error creating task item:', itemError);
      console.error('❌ Full error details:', JSON.stringify(itemError, null, 2));
      
      // Clean up the task
      await supabase.from('delivery_tasks').delete().eq('id', task.id);
      return;
    }

    console.log('✅ Task item created successfully:', item.id);

    // Test 5: Fetch the complete task
    console.log('\n5. Fetching complete task...');
    
    const { data: completeTask, error: fetchError } = await supabase
      .from('delivery_tasks')
      .select(`
        *,
        items:task_items(*)
      `)
      .eq('id', task.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching complete task:', fetchError);
    } else {
      console.log('✅ Complete task fetched successfully');
      console.log('📋 Task details:', {
        id: completeTask.id,
        title: completeTask.title,
        customer_name: completeTask.customer_name,
        items_count: completeTask.items?.length || 0
      });
    }

    // Clean up
    console.log('\n6. Cleaning up test data...');
    await supabase.from('task_items').delete().eq('task_id', task.id);
    await supabase.from('delivery_tasks').delete().eq('id', task.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Delivery task creation is working.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDeliveryTaskCreation();


