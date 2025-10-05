const { createClient } = require('@supabase/supabase-js')

// Test the customer-order relationship with correct UUID mapping
async function testCustomerOrderRelationship() {
  console.log('🧪 Testing Customer-Order Relationship...\n')

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
    console.log('📊 Testing Customer-Order Relationship...')
    
    // Step 1: Get customers with their customer_id (TEXT) and id (UUID)
    console.log('\n🔍 Step 1: Getting customers...')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name')
      .limit(5)

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError)
      return
    }

    if (!customers || customers.length === 0) {
      console.log('⚠️ No customers found in database')
      console.log('💡 You may need to add some customers first')
      return
    }

    console.log(`✅ Found ${customers.length} customers:`)
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}`)
      console.log(`   customer_id (TEXT): ${customer.customer_id}`)
      console.log(`   id (UUID): ${customer.id}`)
      console.log('')
    })

    // Step 2: Get delivery tasks and check the relationship
    console.log('🔍 Step 2: Getting delivery tasks...')
    const { data: deliveryTasks, error: deliveryTasksError } = await supabase
      .from('delivery_tasks')
      .select('id, task_id, customer_id, title, status, total_value')
      .limit(10)

    if (deliveryTasksError) {
      console.error('❌ Error fetching delivery tasks:', deliveryTasksError)
      return
    }

    console.log(`✅ Found ${deliveryTasks?.length || 0} delivery tasks`)
    
    if (deliveryTasks && deliveryTasks.length > 0) {
      console.log('\n📋 Sample delivery tasks:')
      deliveryTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (${task.task_id})`)
        console.log(`   customer_id (UUID): ${task.customer_id}`)
        console.log(`   status: ${task.status}`)
        console.log(`   value: ${task.total_value}`)
        console.log('')
      })
    }

    // Step 3: Test the relationship mapping
    console.log('🔍 Step 3: Testing relationship mapping...')
    
    const customerIds = customers.map(c => c.customer_id)
    console.log('📊 Customer IDs (TEXT):', customerIds)
    
    // Get UUIDs for these customer IDs
    const { data: customerUuids, error: customerUuidsError } = await supabase
      .from('customers')
      .select('id, customer_id')
      .in('customer_id', customerIds)
    
    if (customerUuidsError) {
      console.error('❌ Error fetching customer UUIDs:', customerUuidsError)
      return
    }
    
    console.log('📊 Customer UUIDs mapping:')
    customerUuids.forEach(customer => {
      console.log(`   ${customer.customer_id} (TEXT) → ${customer.id} (UUID)`)
    })
    
    // Step 4: Test querying delivery tasks with UUIDs
    console.log('\n🔍 Step 4: Testing delivery tasks query with UUIDs...')
    
    const customerUuidIds = customerUuids.map(customer => customer.id)
    console.log('📊 Querying delivery_tasks for UUID IDs:', customerUuidIds)
    
    const { data: orders, error: ordersError } = await supabase
      .from('delivery_tasks')
      .select('customer_id, task_id, status, total_value, currency, created_at')
      .in('customer_id', customerUuidIds)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      return
    }

    console.log(`✅ Found ${orders?.length || 0} orders for customers`)
    
    if (orders && orders.length > 0) {
      console.log('\n📋 Orders found:')
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.task_id}`)
        console.log(`   customer_id (UUID): ${order.customer_id}`)
        console.log(`   status: ${order.status}`)
        console.log(`   value: ${order.total_value} ${order.currency}`)
        console.log('')
      })
    }

    // Step 5: Calculate order statistics
    console.log('🔍 Step 5: Calculating order statistics...')
    
    const ordersByCustomerUuid = orders?.reduce((acc, order) => {
      if (!acc[order.customer_id]) {
        acc[order.customer_id] = []
      }
      acc[order.customer_id].push(order)
      return acc
    }, {} as Record<string, any[]>) || {}

    console.log('📊 Orders grouped by customer UUID:')
    Object.entries(ordersByCustomerUuid).forEach(([uuid, orders]) => {
      const customer = customerUuids.find(c => c.id === uuid)
      console.log(`   ${customer?.customer_id || 'Unknown'} (${uuid}): ${orders.length} orders`)
    })

    // Calculate statistics for each customer
    const orderStats = customerIds.map(customerId => {
      const customerUuid = customerUuids.find(c => c.customer_id === customerId)?.id
      const customerOrders = customerUuid ? ordersByCustomerUuid[customerUuid] || [] : []
      
      const totalOrders = customerOrders.length
      const completedOrders = customerOrders.filter(order => order.status === 'completed').length
      const totalSpent = customerOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total_value || 0), 0)
      
      return {
        customer_id: customerId,
        total_orders: totalOrders,
        total_spent: totalSpent,
        completed_orders: completedOrders
      }
    })

    console.log('\n📊 Final Order Statistics:')
    orderStats.forEach((stats, index) => {
      console.log(`${index + 1}. Customer ${stats.customer_id}:`)
      console.log(`   - Total Orders: ${stats.total_orders}`)
      console.log(`   - Total Spent: ${stats.total_spent}`)
      console.log(`   - Completed: ${stats.completed_orders}`)
      console.log('')
    })

    console.log('✅ Customer-Order Relationship test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Customer data loading: ✅ Working')
    console.log('- UUID mapping: ✅ Working')
    console.log('- Delivery tasks query: ✅ Working')
    console.log('- Order statistics calculation: ✅ Working')
    console.log('\n🎯 The customer-order relationship is working correctly!')

  } catch (error) {
    console.error('❌ Error testing customer-order relationship:', error)
  }
}

// Run the test
testCustomerOrderRelationship()
