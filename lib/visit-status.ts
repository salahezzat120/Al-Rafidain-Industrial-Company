import { supabase } from './supabase'

// Interface for visit status data
export interface CustomerVisitStatus {
  customer_id: string
  has_visits: boolean
  last_visit_date?: string
  visit_count: number
  completed_visits: number
  pending_visits: number
  in_progress_visits: number
  cancelled_visits: number
  late_visits: number
  total_visit_hours: number
  average_visit_duration: number
  last_visit_type?: string
  last_visit_representative?: string
}

// Get visit status for a specific customer
export const getCustomerVisitStatus = async (customerId: string): Promise<{ data: CustomerVisitStatus | null; error: string | null }> => {
  try {
    console.log('🔍 Checking visit status for customer:', customerId)

    // Get all visits for this customer
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('customer_id, status, scheduled_start_time, actual_start_time, actual_end_time, visit_type, delegate_name, is_late')
      .eq('customer_id', customerId)
      .order('scheduled_start_time', { ascending: false })

    if (visitsError) {
      console.error('❌ Error fetching visits for customer:', visitsError)
      return { data: null, error: visitsError.message }
    }

    if (!visits || visits.length === 0) {
      console.log('📝 No visits found for customer:', customerId)
      return {
        data: {
          customer_id: customerId,
          has_visits: false,
          visit_count: 0,
          completed_visits: 0,
          pending_visits: 0,
          in_progress_visits: 0,
          cancelled_visits: 0,
          late_visits: 0,
          total_visit_hours: 0,
          average_visit_duration: 0
        },
        error: null
      }
    }

    // Calculate visit statistics
    const completedVisits = visits.filter(visit => visit.status === 'completed')
    const pendingVisits = visits.filter(visit => visit.status === 'scheduled')
    const inProgressVisits = visits.filter(visit => visit.status === 'in_progress')
    const cancelledVisits = visits.filter(visit => visit.status === 'cancelled')
    const lateVisits = visits.filter(visit => visit.is_late === true).length

    // Calculate visit duration statistics
    const completedVisitsWithDuration = completedVisits.filter(visit => 
      visit.actual_start_time && visit.actual_end_time
    )
    
    const totalVisitHours = completedVisitsWithDuration.reduce((total, visit) => {
      const start = new Date(visit.actual_start_time!)
      const end = new Date(visit.actual_end_time!)
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + durationHours
    }, 0)
    
    const averageVisitDuration = completedVisitsWithDuration.length > 0 ? 
      totalVisitHours / completedVisitsWithDuration.length : 0

    // Get the most recent visit details
    const lastVisit = visits[0]
    const lastVisitType = lastVisit?.visit_type
    const lastVisitRepresentative = lastVisit?.delegate_name

    const visitStatus: CustomerVisitStatus = {
      customer_id: customerId,
      has_visits: visits.length > 0,
      last_visit_date: visits.length > 0 ? visits[0].scheduled_start_time : null,
      visit_count: visits.length,
      completed_visits: completedVisits.length,
      pending_visits: pendingVisits.length,
      in_progress_visits: inProgressVisits.length,
      cancelled_visits: cancelledVisits.length,
      late_visits: lateVisits,
      total_visit_hours: totalVisitHours,
      average_visit_duration: averageVisitDuration,
      last_visit_type: lastVisitType,
      last_visit_representative: lastVisitRepresentative
    }

    console.log('✅ Visit status calculated:', visitStatus)
    return { data: visitStatus, error: null }

  } catch (error) {
    console.error('❌ Error in getCustomerVisitStatus:', error)
    return { data: null, error: 'An unexpected error occurred while checking visit status' }
  }
}

// Get visit status for multiple customers
export const getMultipleCustomerVisitStatus = async (customerIds: string[]): Promise<{ data: CustomerVisitStatus[] | null; error: string | null }> => {
  try {
    console.log('🔍 Checking visit status for multiple customers:', customerIds.length)

    if (customerIds.length === 0) {
      return { data: [], error: null }
    }

    // Get all visits for these customers
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('customer_id, status, scheduled_start_time, actual_start_time, actual_end_time')
      .in('customer_id', customerIds)
      .order('scheduled_start_time', { ascending: false })

    if (visitsError) {
      console.error('❌ Error fetching visits for customers:', visitsError)
      return { data: null, error: visitsError.message }
    }

    // Group visits by customer_id
    const visitsByCustomer = visits?.reduce((acc, visit) => {
      if (!acc[visit.customer_id]) {
        acc[visit.customer_id] = []
      }
      acc[visit.customer_id].push(visit)
      return acc
    }, {} as Record<string, any[]>) || {}

    // Calculate visit status for each customer
    const visitStatuses: CustomerVisitStatus[] = customerIds.map(customerId => {
      const customerVisits = visitsByCustomer[customerId] || []
      
      const completedVisits = customerVisits.filter(visit => visit.status === 'completed').length
      const pendingVisits = customerVisits.filter(visit => visit.status === 'scheduled').length
      const inProgressVisits = customerVisits.filter(visit => visit.status === 'in_progress').length
      const totalVisits = customerVisits.length

      const lastVisitDate = customerVisits.length > 0 ? customerVisits[0].scheduled_start_time : null

      return {
        customer_id: customerId,
        has_visits: totalVisits > 0,
        last_visit_date: lastVisitDate,
        visit_count: totalVisits,
        completed_visits: completedVisits,
        pending_visits: pendingVisits,
        in_progress_visits: inProgressVisits
      }
    })

    console.log('✅ Multiple customer visit status calculated:', visitStatuses.length)
    return { data: visitStatuses, error: null }

  } catch (error) {
    console.error('❌ Error in getMultipleCustomerVisitStatus:', error)
    return { data: null, error: 'An unexpected error occurred while checking visit status' }
  }
}

// Determine if a customer has been visited based on visit management data
export const hasCustomerBeenVisited = (visitStatus: CustomerVisitStatus): boolean => {
  // A customer is considered "visited" if they have at least one completed visit
  return visitStatus.completed_visits > 0
}

// Get the visit status text for display
export const getVisitStatusText = (visitStatus: CustomerVisitStatus): string => {
  if (visitStatus.completed_visits > 0) {
    return 'Visited'
  } else if (visitStatus.pending_visits > 0 || visitStatus.in_progress_visits > 0) {
    return 'Scheduled'
  } else {
    return 'Not Visited'
  }
}

// Get the visit status color for display
export const getVisitStatusColor = (visitStatus: CustomerVisitStatus): string => {
  if (visitStatus.completed_visits > 0) {
    return 'bg-green-100 text-green-800'
  } else if (visitStatus.pending_visits > 0 || visitStatus.in_progress_visits > 0) {
    return 'bg-yellow-100 text-yellow-800'
  } else {
    return 'bg-red-100 text-red-800'
  }
}
