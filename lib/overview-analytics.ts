import { supabase } from './supabase'

// Fetch performance metrics from database
export async function getPerformanceMetrics(): Promise<{ data: any | null; error: string | null }> {
  try {
    console.log('📊 Fetching performance metrics...')

    // Get delivery tasks for on-time delivery rate
    const { data: deliveryTasks, error: deliveryError } = await supabase
      .from('delivery_tasks')
      .select('status, completed_at, scheduled_for, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (deliveryError) {
      console.error('❌ Error fetching delivery tasks:', deliveryError)
      return { data: null, error: `Failed to fetch delivery tasks: ${deliveryError.message}` }
    }

    // Get customer ratings for satisfaction
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('rating')
      .not('rating', 'is', null)

    if (customersError) {
      console.error('❌ Error fetching customer ratings:', customersError)
      return { data: null, error: `Failed to fetch customer ratings: ${customersError.message}` }
    }

    // Get representatives for driver efficiency
    const { data: representatives, error: representativesError } = await supabase
      .from('representatives')
      .select('id, status')

    if (representativesError) {
      console.error('❌ Error fetching representatives:', representativesError)
      return { data: null, error: `Failed to fetch representatives: ${representativesError.message}` }
    }

    // Calculate on-time delivery rate
    const completedTasks = deliveryTasks?.filter(task => task.status === 'completed') || []
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.scheduled_for || !task.completed_at) return false
      const scheduled = new Date(task.scheduled_for)
      const completed = new Date(task.completed_at)
      const diffMinutes = (completed.getTime() - scheduled.getTime()) / (1000 * 60)
      return diffMinutes <= 30 // Consider on-time if within 30 minutes
    })
    const onTimeDeliveryRate = completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 0

    // Calculate customer satisfaction
    const ratings = customers?.filter(c => c.rating && c.rating > 0).map(c => c.rating) || []
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
    const customerSatisfaction = (averageRating / 5) * 100

    // Calculate fleet utilization (active representatives / total representatives)
    const activeRepresentatives = representatives?.filter(rep => rep.status === 'active').length || 0
    const totalRepresentatives = representatives?.length || 0
    const fleetUtilization = totalRepresentatives > 0 ? (activeRepresentatives / totalRepresentatives) * 100 : 0

    // Calculate driver efficiency (completed tasks / total tasks per representative)
    const totalTasks = deliveryTasks?.length || 0
    const completedTasksCount = completedTasks.length
    const driverEfficiency = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0

    const metrics = {
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10,
      customerSatisfaction: Math.round(averageRating * 10) / 10,
      fleetUtilization: Math.round(fleetUtilization * 10) / 10,
      driverEfficiency: Math.round(driverEfficiency * 10) / 10
    }

    console.log('✅ Performance metrics fetched successfully')
    return { data: metrics, error: null }

  } catch (error) {
    console.error('❌ Error in getPerformanceMetrics:', error)
    return { data: null, error: 'An unexpected error occurred while fetching performance metrics' }
  }
}

// Fetch recent activity from database
export async function getRecentActivity(): Promise<{ data: any | null; error: string | null }> {
  try {
    console.log('📊 Fetching recent activity...')

    const activities = []

    // Get recent representatives
    const { data: recentRepresentatives, error: representativesError } = await supabase
      .from('representatives')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!representativesError && recentRepresentatives) {
      recentRepresentatives.forEach(rep => {
        const timeAgo = getTimeAgo(new Date(rep.created_at))
        activities.push({
          id: `rep-${rep.name}`,
          type: 'representative',
          title: `New driver ${rep.name} registered`,
          timeAgo,
          color: 'green',
          icon: 'user'
        })
      })
    }

    // Get recent delivery tasks
    const { data: recentTasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('title, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (!tasksError && recentTasks) {
      recentTasks.forEach(task => {
        const timeAgo = getTimeAgo(new Date(task.updated_at || task.created_at))
        let activityTitle = ''
        let color = 'blue'
        
        if (task.status === 'completed') {
          activityTitle = `Delivery completed: ${task.title}`
          color = 'green'
        } else if (task.status === 'in_progress') {
          activityTitle = `Delivery in progress: ${task.title}`
          color = 'blue'
        } else if (task.status === 'assigned') {
          activityTitle = `Delivery assigned: ${task.title}`
          color = 'yellow'
        } else {
          activityTitle = `New delivery: ${task.title}`
          color = 'purple'
        }

        activities.push({
          id: `task-${task.title}`,
          type: 'delivery',
          title: activityTitle,
          timeAgo,
          color,
          icon: 'package'
        })
      })
    }

    // Get recent payments
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!paymentsError && recentPayments) {
      recentPayments.forEach(payment => {
        const timeAgo = getTimeAgo(new Date(payment.created_at))
        activities.push({
          id: `payment-${payment.amount}`,
          type: 'payment',
          title: `Payment ${payment.status}: $${payment.amount}`,
          timeAgo,
          color: payment.status === 'completed' ? 'green' : 'yellow',
          icon: 'dollar'
        })
      })
    }

    // Sort activities by time (most recent first)
    activities.sort((a, b) => {
      const timeA = new Date(a.timeAgo).getTime()
      const timeB = new Date(b.timeAgo).getTime()
      return timeB - timeA
    })

    // Return only the 4 most recent activities
    const recentActivities = activities.slice(0, 4)

    console.log('✅ Recent activity fetched successfully')
    return { data: recentActivities, error: null }

  } catch (error) {
    console.error('❌ Error in getRecentActivity:', error)
    return { data: null, error: 'An unexpected error occurred while fetching recent activity' }
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
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

// Fetch dashboard KPIs
export async function getDashboardKPIs(): Promise<{ data: any | null; error: string | null }> {
  try {
    console.log('📊 Fetching dashboard KPIs...')

    // Get total revenue from payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('status', 'completed')

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return { data: null, error: `Failed to fetch payments: ${paymentsError.message}` }
    }

    // Get representatives data
    const { data: representatives, error: representativesError } = await supabase
      .from('representatives')
      .select('id, status')

    if (representativesError) {
      console.error('❌ Error fetching representatives:', representativesError)
      return { data: null, error: `Failed to fetch representatives: ${representativesError.message}` }
    }

    // Get delivery tasks for today
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
      console.error('❌ Error fetching today tasks:', tasksError)
      return { data: null, error: `Failed to fetch today tasks: ${tasksError.message}` }
    }

    // Calculate KPIs
    const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
    const activeRepresentatives = representatives?.filter(rep => rep.status === 'active').length || 0
    const onRouteRepresentatives = representatives?.filter(rep => rep.status === 'on-route').length || 0
    const totalTasks = todayTasks?.length || 0
    const completedTasks = todayTasks?.filter(task => task.status === 'completed').length || 0
    const pendingTasks = todayTasks?.filter(task => task.status === 'pending' || task.status === 'assigned').length || 0

    const kpis = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeRepresentatives,
      onRouteRepresentatives,
      availableRepresentatives: activeRepresentatives - onRouteRepresentatives,
      totalTasks,
      completedTasks,
      pendingTasks
    }

    console.log('✅ Dashboard KPIs fetched successfully')
    return { data: kpis, error: null }

  } catch (error) {
    console.error('❌ Error in getDashboardKPIs:', error)
    return { data: null, error: 'An unexpected error occurred while fetching dashboard KPIs' }
  }
}
