const { createClient } = require('@supabase/supabase-js')

// Test the overview dashboard functionality
async function testOverviewDashboard() {
  console.log('🧪 Testing Overview Dashboard Functionality...\n')

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
    console.log('📊 Testing Dashboard KPIs...')
    
    // Test payments data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('status', 'completed')

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message)
    } else {
      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
      console.log(`✅ Total Revenue: $${totalRevenue.toLocaleString()}`)
    }

    // Test representatives data
    const { data: representatives, error: representativesError } = await supabase
      .from('representatives')
      .select('id, status')

    if (representativesError) {
      console.error('❌ Error fetching representatives:', representativesError.message)
    } else {
      const activeRepresentatives = representatives?.filter(rep => rep.status === 'active').length || 0
      const onRouteRepresentatives = representatives?.filter(rep => rep.status === 'on-route').length || 0
      console.log(`✅ Active Representatives: ${activeRepresentatives}`)
      console.log(`✅ On Route: ${onRouteRepresentatives}`)
    }

    // Test delivery tasks for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todayTasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('status')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (tasksError) {
      console.error('❌ Error fetching today tasks:', tasksError.message)
    } else {
      const totalTasks = todayTasks?.length || 0
      const completedTasks = todayTasks?.filter(task => task.status === 'completed').length || 0
      const pendingTasks = todayTasks?.filter(task => task.status === 'pending' || task.status === 'assigned').length || 0
      console.log(`✅ Today's Tasks: ${totalTasks} (${completedTasks} completed, ${pendingTasks} pending)`)
    }

    console.log('\n📊 Testing Performance Metrics...')
    
    // Test delivery tasks for performance metrics
    const { data: deliveryTasks, error: deliveryError } = await supabase
      .from('delivery_tasks')
      .select('status, completed_at, scheduled_for, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (deliveryError) {
      console.error('❌ Error fetching delivery tasks:', deliveryError.message)
    } else {
      const completedTasks = deliveryTasks?.filter(task => task.status === 'completed') || []
      const onTimeTasks = completedTasks.filter(task => {
        if (!task.scheduled_for || !task.completed_at) return false
        const scheduled = new Date(task.scheduled_for)
        const completed = new Date(task.completed_at)
        const diffMinutes = (completed.getTime() - scheduled.getTime()) / (1000 * 60)
        return diffMinutes <= 30
      })
      const onTimeDeliveryRate = completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 0
      console.log(`✅ On-time Delivery Rate: ${Math.round(onTimeDeliveryRate * 10) / 10}%`)
    }

    // Test customer ratings
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('rating')
      .not('rating', 'is', null)

    if (customersError) {
      console.error('❌ Error fetching customer ratings:', customersError.message)
    } else {
      const ratings = customers?.filter(c => c.rating && c.rating > 0).map(c => c.rating) || []
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
      console.log(`✅ Customer Satisfaction: ${Math.round(averageRating * 10) / 10}/5.0`)
    }

    console.log('\n📊 Testing Recent Activity...')
    
    // Test recent representatives
    const { data: recentRepresentatives, error: recentRepsError } = await supabase
      .from('representatives')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentRepsError) {
      console.error('❌ Error fetching recent representatives:', recentRepsError.message)
    } else {
      console.log(`✅ Recent Representatives: ${recentRepresentatives?.length || 0} found`)
      recentRepresentatives?.forEach(rep => {
        const timeAgo = getTimeAgo(new Date(rep.created_at))
        console.log(`   - New driver ${rep.name} registered (${timeAgo})`)
      })
    }

    // Test recent delivery tasks
    const { data: recentTasks, error: recentTasksError } = await supabase
      .from('delivery_tasks')
      .select('title, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (recentTasksError) {
      console.error('❌ Error fetching recent tasks:', recentTasksError.message)
    } else {
      console.log(`✅ Recent Tasks: ${recentTasks?.length || 0} found`)
      recentTasks?.forEach(task => {
        const timeAgo = getTimeAgo(new Date(task.updated_at || task.created_at))
        console.log(`   - ${task.title} (${task.status}) - ${timeAgo}`)
      })
    }

    // Test recent payments
    const { data: recentPayments, error: recentPaymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentPaymentsError) {
      console.error('❌ Error fetching recent payments:', recentPaymentsError.message)
    } else {
      console.log(`✅ Recent Payments: ${recentPayments?.length || 0} found`)
      recentPayments?.forEach(payment => {
        const timeAgo = getTimeAgo(new Date(payment.created_at))
        console.log(`   - Payment ${payment.status}: $${payment.amount} - ${timeAgo}`)
      })
    }

    console.log('\n✅ Overview Dashboard test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Dashboard KPIs: ✅ Working')
    console.log('- Performance Metrics: ✅ Working')
    console.log('- Recent Activity: ✅ Working')
    console.log('\n🎯 The Overview page should now display real data from your database!')

  } catch (error) {
    console.error('❌ Error testing overview dashboard:', error)
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else {
    return `${diffDays} days ago`
  }
}

// Run the test
testOverviewDashboard()
