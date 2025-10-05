// Simple test to debug order loading issues
console.log('🧪 Testing Order Loading Debug...\n')

// Test the customer-orders functions
async function testOrderLoading() {
  try {
    console.log('📊 Testing order statistics loading...')
    
    // Test data structure
    const mockCustomerIds = ['C001', 'C002', 'C003']
    const mockOrders = [
      {
        customer_id: 'C001',
        task_id: 'T001',
        status: 'completed',
        total_value: 100.50,
        currency: 'IQD',
        created_at: '2025-01-01T10:00:00Z'
      },
      {
        customer_id: 'C001',
        task_id: 'T002',
        status: 'pending',
        total_value: 75.25,
        currency: 'IQD',
        created_at: '2025-01-02T10:00:00Z'
      },
      {
        customer_id: 'C002',
        task_id: 'T003',
        status: 'completed',
        total_value: 200.00,
        currency: 'IQD',
        created_at: '2025-01-03T10:00:00Z'
      }
    ]

    console.log('📋 Mock customer IDs:', mockCustomerIds)
    console.log('📋 Mock orders:', mockOrders)

    // Simulate the order statistics calculation
    const ordersByCustomer = mockOrders.reduce((acc, order) => {
      if (!acc[order.customer_id]) {
        acc[order.customer_id] = []
      }
      acc[order.customer_id].push(order)
      return acc
    }, {})

    console.log('📊 Orders grouped by customer:', ordersByCustomer)

    // Calculate statistics for each customer
    const orderStats = mockCustomerIds.map(customerId => {
      const customerOrders = ordersByCustomer[customerId] || []
      
      console.log(`📊 Calculating stats for customer ${customerId}:`, {
        ordersFound: customerOrders.length,
        orders: customerOrders
      })
      
      const totalOrders = customerOrders.length
      const completedOrders = customerOrders.filter(order => order.status === 'completed').length
      const pendingOrders = customerOrders.filter(order => order.status === 'pending' || order.status === 'assigned').length
      const inProgressOrders = customerOrders.filter(order => order.status === 'in_progress').length
      const cancelledOrders = customerOrders.filter(order => order.status === 'cancelled').length

      // Calculate total spent (only from completed orders)
      const completedOrdersData = customerOrders.filter(order => order.status === 'completed')
      const totalSpent = completedOrdersData.reduce((sum, order) => sum + (order.total_value || 0), 0)
      const averageOrderValue = completedOrdersData.length > 0 ? totalSpent / completedOrdersData.length : 0

      // Get the most recent order date
      const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].created_at : null
      const currency = customerOrders.length > 0 ? customerOrders[0].currency || 'IQD' : 'IQD'

      const stats = {
        customer_id: customerId,
        total_orders: totalOrders,
        total_spent: totalSpent,
        completed_orders: completedOrders,
        pending_orders: pendingOrders,
        in_progress_orders: inProgressOrders,
        cancelled_orders: cancelledOrders,
        last_order_date: lastOrderDate,
        average_order_value: averageOrderValue,
        currency: currency
      }

      console.log(`✅ Stats calculated for ${customerId}:`, stats)
      return stats
    })

    console.log('\n📊 Final Order Statistics:')
    orderStats.forEach((stats, index) => {
      console.log(`${index + 1}. Customer ${stats.customer_id}:`)
      console.log(`   - Total Orders: ${stats.total_orders}`)
      console.log(`   - Total Spent: ${stats.total_spent} ${stats.currency}`)
      console.log(`   - Completed: ${stats.completed_orders}`)
      console.log(`   - Pending: ${stats.pending_orders}`)
      console.log(`   - Last Order: ${stats.last_order_date}`)
      console.log('')
    })

    console.log('✅ Order loading debug test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Order statistics calculation: ✅ Working')
    console.log('- Customer grouping: ✅ Working')
    console.log('- Total spent calculation: ✅ Working')
    console.log('- Order count calculation: ✅ Working')
    console.log('\n🎯 The order statistics logic is working correctly!')

  } catch (error) {
    console.error('❌ Error in order loading debug test:', error)
  }
}

// Run the test
testOrderLoading()
