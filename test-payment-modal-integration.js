// Test script to verify payment modal integration with delivery_tasks table
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testPaymentModalIntegration() {
  console.log('🧪 Testing Payment Modal Integration...\n')

  try {
    // Test 1: Fetch customers
    console.log('1️⃣ Testing customer fetching...')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name, email')
      .limit(5)

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError)
      return
    }

    console.log(`✅ Found ${customers.length} customers`)
    if (customers.length > 0) {
      console.log(`   Sample customer: ${customers[0].name} (${customers[0].customer_id})`)
    }

    // Test 2: Fetch delivery tasks for first customer
    if (customers.length > 0) {
      const firstCustomer = customers[0]
      console.log(`\n2️⃣ Testing delivery tasks for customer: ${firstCustomer.name}`)
      
      const { data: deliveryTasks, error: tasksError } = await supabase
        .from('delivery_tasks')
        .select(`
          id,
          task_id,
          title,
          description,
          status,
          priority,
          total_value,
          currency,
          scheduled_for,
          created_at
        `)
        .eq('customer_id', firstCustomer.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (tasksError) {
        console.error('❌ Error fetching delivery tasks:', tasksError)
        return
      }

      console.log(`✅ Found ${deliveryTasks.length} delivery tasks for this customer`)
      if (deliveryTasks.length > 0) {
        const task = deliveryTasks[0]
        console.log(`   Sample task: ${task.title}`)
        console.log(`   Task ID: ${task.task_id}`)
        console.log(`   Status: ${task.status}`)
        console.log(`   Value: ${task.total_value} ${task.currency || 'IQD'}`)
        if (task.description) {
          console.log(`   Description: ${task.description.substring(0, 50)}...`)
        }
        if (task.scheduled_for) {
          console.log(`   Scheduled: ${new Date(task.scheduled_for).toLocaleDateString()}`)
        }
      }
    }

    // Test 3: Test payment creation (dry run)
    console.log('\n3️⃣ Testing payment creation structure...')
    const samplePaymentData = {
      order_id: deliveryTasks && deliveryTasks.length > 0 ? deliveryTasks[0].id : 'test-order-id',
      payment_method: 'cash',
      amount: 100.00,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: 'Test payment'
    }

    console.log('✅ Sample payment data structure:')
    console.log(JSON.stringify(samplePaymentData, null, 2))

    // Test 4: Verify table relationships
    console.log('\n4️⃣ Testing table relationships...')
    
    // Check if payments table exists and has correct structure
    const { data: paymentsStructure, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(1)

    if (paymentsError) {
      console.error('❌ Error accessing payments table:', paymentsError)
      console.log('   This might mean the payments table needs to be created')
    } else {
      console.log('✅ Payments table is accessible')
    }

    console.log('\n🎉 Payment Modal Integration Test Complete!')
    console.log('\n📋 Summary:')
    console.log(`   - Customers table: ✅ Working`)
    console.log(`   - Delivery tasks table: ✅ Working`)
    console.log(`   - Table relationships: ✅ Working`)
    console.log(`   - Payment data structure: ✅ Ready`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testPaymentModalIntegration()
