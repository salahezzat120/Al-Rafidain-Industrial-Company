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

async function testDeliveryTasksConnection() {
  console.log('🔍 Testing delivery tasks connection...');
  
  try {
    // Test 1: Check if delivery_tasks table exists
    console.log('\n1. Checking delivery_tasks table...');
    const { data: tasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('*')
      .limit(5);

    if (tasksError) {
      console.error('❌ Error accessing delivery_tasks table:', tasksError);
      return;
    }

    console.log('✅ delivery_tasks table accessible');
    console.log('📊 Found', tasks?.length || 0, 'delivery tasks');

    // Test 2: Check if task_items table exists
    console.log('\n2. Checking task_items table...');
    const { data: items, error: itemsError } = await supabase
      .from('task_items')
      .select('*')
      .limit(5);

    if (itemsError) {
      console.error('❌ Error accessing task_items table:', itemsError);
      return;
    }

    console.log('✅ task_items table accessible');
    console.log('📊 Found', items?.length || 0, 'task items');

    // Test 3: Try the join query (like in getDeliveryTasks)
    console.log('\n3. Testing join query...');
    const { data: joinedData, error: joinError } = await supabase
      .from('delivery_tasks')
      .select(`
        *,
        items:task_items(*)
      `)
      .limit(3);

    if (joinError) {
      console.error('❌ Error with join query:', joinError);
      return;
    }

    console.log('✅ Join query successful');
    console.log('📊 Found', joinedData?.length || 0, 'tasks with items');

    if (joinedData && joinedData.length > 0) {
      console.log('\n📋 Sample task data:');
      console.log(JSON.stringify(joinedData[0], null, 2));
    }

    console.log('\n🎉 All tests passed! Delivery tasks system is working.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDeliveryTasksConnection();

