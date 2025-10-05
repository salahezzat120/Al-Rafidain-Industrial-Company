import { supabase } from './supabase'

// Interface for customer order statistics
export interface CustomerOrderStats {
  customer_id: string
  total_orders: number
  total_spent: number
  completed_orders: number
  pending_orders: number
  in_progress_orders: number
  cancelled_orders: number
  last_order_date?: string
  average_order_value: number
  currency: string
}

// Get order statistics for a specific customer
export const getCustomerOrderStats = async (customerId: string): Promise<{ data: CustomerOrderStats | null; error: string | null }> => {
  try {
    console.log('🔍 Getting order statistics for customer:', customerId)

    // First, get the UUID ID for the customer_id TEXT value
    const { data: customerUuid, error: customerUuidError } = await supabase
      .from('customers')
      .select('id')
      .eq('customer_id', customerId)
      .single()
    
    if (customerUuidError) {
      console.error('❌ Error fetching customer UUID:', customerUuidError)
      return { data: null, error: customerUuidError.message }
    }
    
    if (!customerUuid) {
      console.log('⚠️ No customer UUID found for customer_id:', customerId)
      return {
        data: {
          customer_id: customerId,
          total_orders: 0,
          total_spent: 0,
          completed_orders: 0,
          pending_orders: 0,
          in_progress_orders: 0,
          cancelled_orders: 0,
          last_order_date: null,
          average_order_value: 0,
          currency: 'IQD'
        },
        error: null
      }
    }
    
    console.log('📊 Found customer UUID:', customerUuid.id)

    // Get all delivery tasks for this customer using the UUID
    const { data: orders, error: ordersError } = await supabase
      .from('delivery_tasks')
      .select('task_id, status, total_value, currency, created_at, completed_at')
      .eq('customer_id', customerUuid.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders for customer:', ordersError)
      return { data: null, error: ordersError.message }
    }

    if (!orders || orders.length === 0) {
      console.log('📝 No orders found for customer:', customerId)
      return {
        data: {
          customer_id: customerId,
          total_orders: 0,
          total_spent: 0,
          completed_orders: 0,
          pending_orders: 0,
          in_progress_orders: 0,
          cancelled_orders: 0,
          average_order_value: 0,
          currency: 'IQD'
        },
        error: null
      }
    }

    // Calculate order statistics
    const totalOrders = orders.length
    const completedOrders = orders.filter(order => order.status === 'completed').length
    const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'assigned').length
    const inProgressOrders = orders.filter(order => order.status === 'in_progress').length
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length

    // Calculate total spent (only from completed orders)
    const completedOrdersData = orders.filter(order => order.status === 'completed')
    const totalSpent = completedOrdersData.reduce((sum, order) => sum + (order.total_value || 0), 0)
    const averageOrderValue = completedOrdersData.length > 0 ? totalSpent / completedOrdersData.length : 0

    // Get the most recent order date
    const lastOrderDate = orders.length > 0 ? orders[0].created_at : null
    const currency = orders.length > 0 ? orders[0].currency || 'IQD' : 'IQD'

    const orderStats: CustomerOrderStats = {
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

    console.log('✅ Order statistics calculated:', orderStats)
    return { data: orderStats, error: null }

  } catch (error) {
    console.error('❌ Error in getCustomerOrderStats:', error)
    return { data: null, error: 'An unexpected error occurred while calculating order statistics' }
  }
}

// Test if delivery_tasks table is accessible
export const testDeliveryTasksAccess = async (): Promise<{ accessible: boolean; error: string | null }> => {
  try {
    console.log('🔍 Testing delivery_tasks table access...')
    
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ delivery_tasks table not accessible:', error)
      return { accessible: false, error: error.message }
    }
    
    console.log('✅ delivery_tasks table is accessible')
    return { accessible: true, error: null }
  } catch (error) {
    console.error('❌ Error testing delivery_tasks access:', error)
    return { accessible: false, error: 'Unexpected error occurred' }
  }
}

// Get order statistics for multiple customers
export const getMultipleCustomerOrderStats = async (customerIds: string[]): Promise<{ data: CustomerOrderStats[] | null; error: string | null }> => {
  try {
    console.log('🔍 Getting order statistics for multiple customers:', customerIds.length)

    if (customerIds.length === 0) {
      return { data: [], error: null }
    }

    // First test if delivery_tasks table is accessible
    const { accessible, error: accessError } = await testDeliveryTasksAccess()
    if (!accessible) {
      console.error('❌ delivery_tasks table not accessible:', accessError)
      return { data: null, error: `delivery_tasks table not accessible: ${accessError}` }
    }

    // Get all delivery tasks for these customers
    console.log('🔍 Querying delivery_tasks for customer IDs:', customerIds)
    
    // First, get the UUID IDs for the customer_id TEXT values
    const { data: customerUuids, error: customerUuidsError } = await supabase
      .from('customers')
      .select('id, customer_id')
      .in('customer_id', customerIds)
    
    if (customerUuidsError) {
      console.error('❌ Error fetching customer UUIDs:', customerUuidsError)
      return { data: null, error: customerUuidsError.message }
    }
    
    console.log('📊 Found customer UUIDs:', customerUuids)
    
    if (!customerUuids || customerUuids.length === 0) {
      console.log('⚠️ No customer UUIDs found, returning empty stats')
      return { data: [], error: null }
    }
    
    const customerUuidIds = customerUuids.map(customer => customer.id)
    console.log('🔍 Querying delivery_tasks for customer UUID IDs:', customerUuidIds)
    
    const { data: orders, error: ordersError } = await supabase
      .from('delivery_tasks')
      .select('customer_id, task_id, status, total_value, currency, created_at, completed_at')
      .in('customer_id', customerUuidIds)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders for customers:', ordersError)
      console.error('❌ Error details:', {
        code: ordersError.code,
        message: ordersError.message,
        details: ordersError.details,
        hint: ordersError.hint
      })
      return { data: null, error: ordersError.message || 'Failed to fetch orders' }
    }

    console.log('📊 Found orders for customers:', orders?.length || 0)
    if (orders && orders.length > 0) {
      console.log('📋 Sample orders:', orders.slice(0, 3))
    }

    // Create a mapping from UUID to customer_id (TEXT)
    const uuidToCustomerIdMap = new Map<string, string>()
    customerUuids.forEach(customer => {
      uuidToCustomerIdMap.set(customer.id, customer.customer_id)
    })
    
    console.log('📊 UUID to customer_id mapping:', Object.fromEntries(uuidToCustomerIdMap))

    // Group orders by customer UUID, then map back to customer_id (TEXT)
    const ordersByCustomerUuid = orders?.reduce((acc, order) => {
      if (!acc[order.customer_id]) {
        acc[order.customer_id] = []
      }
      acc[order.customer_id].push(order)
      return acc
    }, {} as Record<string, any[]>) || {}

    // Calculate order statistics for each customer
    const orderStats: CustomerOrderStats[] = customerIds.map(customerId => {
      // Find the UUID for this customer_id
      const customerUuid = customerUuids.find(c => c.customer_id === customerId)?.id
      const customerOrders = customerUuid ? ordersByCustomerUuid[customerUuid] || [] : []
      
      console.log(`📊 Calculating stats for customer ${customerId}:`, {
        ordersFound: customerOrders.length,
        orders: customerOrders.slice(0, 2) // Show first 2 orders for debugging
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

    console.log('✅ Multiple customer order statistics calculated:', orderStats.length)
    return { data: orderStats, error: null }

  } catch (error) {
    console.error('❌ Error in getMultipleCustomerOrderStats:', error)
    return { data: null, error: 'An unexpected error occurred while calculating order statistics' }
  }
}

// Get recent orders for a customer
export const getCustomerRecentOrders = async (customerId: string, limit: number = 5): Promise<{ data: any[] | null; error: string | null }> => {
  try {
    console.log('🔍 Getting recent orders for customer:', customerId)

    const { data: orders, error: ordersError } = await supabase
      .from('delivery_tasks')
      .select('task_id, title, status, total_value, currency, created_at, completed_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (ordersError) {
      console.error('❌ Error fetching recent orders:', ordersError)
      return { data: null, error: ordersError.message }
    }

    console.log('✅ Recent orders fetched:', orders?.length || 0)
    return { data: orders || [], error: null }

  } catch (error) {
    console.error('❌ Error in getCustomerRecentOrders:', error)
    return { data: null, error: 'An unexpected error occurred while fetching recent orders' }
  }
}
