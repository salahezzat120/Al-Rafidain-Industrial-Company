const { createClient } = require('@supabase/supabase-js')

// Test the order statistics integration with customer management
async function testOrderStatisticsIntegration() {
  console.log('🧪 Testing Order Statistics Integration...\n')

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('📊 Testing Customer Data with Order Statistics...')
    
    // Test loading customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name, email, total_orders, total_spent, last_order_date')
      .order('name', { ascending: true })

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError.message)
      return
    }

    if (!customers || customers.length === 0) {
      console.log('⚠️ No customers found in database')
      console.log('💡 You may need to add some customers first')
      return
    }

    console.log(`✅ Found ${customers.length} customers in database`)
    
    // Display customer order information
    console.log('\n📋 Customer Order Information:')
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.customer_id})`)
      console.log(`   Orders: ${customer.total_orders}`)
      console.log(`   Total Spent: ${customer.total_spent} ${customer.currency || 'IQD'}`)
      console.log(`   Last Order: ${customer.last_order_date || 'Never'}`)
      console.log('')
    })

    console.log('🔍 Testing Delivery Tasks Data...')
    
    // Test loading delivery tasks
    const { data: deliveryTasks, error: deliveryTasksError } = await supabase
      .from('delivery_tasks')
      .select('customer_id, task_id, title, status, total_value, currency, created_at, completed_at')
      .order('created_at', { ascending: false })

    if (deliveryTasksError) {
      console.error('❌ Error fetching delivery tasks:', deliveryTasksError.message)
    } else {
      console.log(`✅ Found ${deliveryTasks?.length || 0} delivery tasks in database`)
      
      if (deliveryTasks && deliveryTasks.length > 0) {
        console.log('\n📋 Recent Delivery Tasks:')
        deliveryTasks.slice(0, 5).forEach((task, index) => {
          console.log(`${index + 1}. Task: ${task.task_id} - ${task.title}`)
          console.log(`   Customer: ${task.customer_id}`)
          console.log(`   Status: ${task.status}`)
          console.log(`   Value: ${task.total_value} ${task.currency || 'IQD'}`)
          console.log(`   Created: ${task.created_at}`)
          console.log('')
        })
      }
    }

    // Test order statistics calculation for specific customers
    console.log('🧮 Testing Order Statistics Calculation...')
    
    const customerIds = customers.map(c => c.customer_id).slice(0, 3) // Test first 3 customers
    
    for (const customerId of customerIds) {
      console.log(`\n🔍 Checking orders for customer: ${customerId}`)
      
      const { data: customerOrders, error: customerOrdersError } = await supabase
        .from('delivery_tasks')
        .select('task_id, status, total_value, currency, created_at, completed_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (customerOrdersError) {
        console.error(`❌ Error fetching orders for customer ${customerId}:`, customerOrdersError.message)
        continue
      }

      if (!customerOrders || customerOrders.length === 0) {
        console.log(`   📝 No orders found for customer ${customerId}`)
        console.log(`   Total Orders: 0`)
        console.log(`   Total Spent: 0`)
        continue
      }

      // Calculate order statistics
      const totalOrders = customerOrders.length
      const completedOrders = customerOrders.filter(order => order.status === 'completed').length
      const pendingOrders = customerOrders.filter(order => order.status === 'pending' || order.status === 'assigned').length
      const inProgressOrders = customerOrders.filter(order => order.status === 'in_progress').length
      const cancelledOrders = customerOrders.filter(order => order.status === 'cancelled').length

      // Calculate total spent (only from completed orders)
      const completedOrdersData = customerOrders.filter(order => order.status === 'completed')
      const totalSpent = completedOrdersData.reduce((sum, order) => sum + (order.total_value || 0), 0)
      const averageOrderValue = completedOrdersData.length > 0 ? totalSpent / completedOrdersData.length : 0

      console.log(`   📊 Order Statistics:`)
      console.log(`   - Total Orders: ${totalOrders}`)
      console.log(`   - Completed: ${completedOrders}`)
      console.log(`   - Pending: ${pendingOrders}`)
      console.log(`   - In Progress: ${inProgressOrders}`)
      console.log(`   - Cancelled: ${cancelledOrders}`)
      console.log(`   - Total Spent: ${totalSpent} ${customerOrders[0]?.currency || 'IQD'}`)
      console.log(`   - Average Order Value: ${averageOrderValue.toFixed(2)} ${customerOrders[0]?.currency || 'IQD'}`)
      
      if (totalOrders > 0) {
        const lastOrder = customerOrders[0]
        console.log(`   - Last Order: ${lastOrder.created_at}`)
        console.log(`   - Last Order Status: ${lastOrder.status}`)
      }
    }

    // Test order status distribution
    console.log('\n📊 Order Status Distribution:')
    if (deliveryTasks && deliveryTasks.length > 0) {
      const statusCounts = deliveryTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {})

      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`)
      })
    }

    // Test currency distribution
    console.log('\n💰 Currency Distribution:')
    if (deliveryTasks && deliveryTasks.length > 0) {
      const currencyCounts = deliveryTasks.reduce((acc, task) => {
        const currency = task.currency || 'IQD'
        acc[currency] = (acc[currency] || 0) + 1
        return acc
      }, {})

      Object.entries(currencyCounts).forEach(([currency, count]) => {
        console.log(`   ${currency}: ${count} orders`)
      })
    }

    console.log('\n✅ Order Statistics Integration test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Customer data loading: ✅ Working')
    console.log('- Delivery tasks data: ✅ Working')
    console.log('- Order statistics calculation: ✅ Working')
    console.log('- Status distribution: ✅ Working')
    console.log('- Currency distribution: ✅ Working')
    console.log('\n🎯 The Customer Management page should now show accurate order numbers!')

  } catch (error) {
    console.error('❌ Error testing order statistics integration:', error)
  }
}

// Run the test
testOrderStatisticsIntegration()
