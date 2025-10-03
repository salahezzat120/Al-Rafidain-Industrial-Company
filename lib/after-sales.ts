import { supabase } from './supabase'
import { safeSupabaseQuery, handleSupabaseError } from './supabase-utils'
import type { 
  CustomerInquiry, 
  Complaint, 
  MaintenanceRequest, 
  Warranty, 
  WarrantyClaim, 
  FollowUpService,
  AfterSalesMetrics,
  SupportAgent
} from '@/types/after-sales'

// Customer Inquiry Functions
export const createCustomerInquiry = async (inquiry: Omit<CustomerInquiry, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('customer_inquiries')
      .insert([inquiry])
      .select()
      .single()

    if (error) {
      if (error.message?.includes('relation "customer_inquiries" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Customer inquiries table does not exist. Throwing error for fallback handling.')
        throw new Error('TABLE_NOT_EXISTS')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating customer inquiry:', error)
    throw error
  }
}

export const updateCustomerInquiry = async (id: string, updates: Partial<CustomerInquiry>) => {
  try {
    const { data, error } = await supabase
      .from('customer_inquiries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating customer inquiry:', error)
    throw error
  }
}

export const getCustomerInquiries = async (filters?: {
  status?: string
  priority?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}) => {
  try {
    let query = supabase
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error } = await query
    if (error) {
      // Check if table doesn't exist
      if (error.message?.includes('relation "customer_inquiries" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Customer inquiries table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    // Check if it's a table not found error
    if (error instanceof Error && error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('Customer inquiries table does not exist. Using mock data.')
      return []
    }
    console.error('Error fetching customer inquiries:', error)
    return []
  }
}

// Complaint Functions
export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'escalation_level'>) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .insert([{ ...complaint, escalation_level: 0 }])
      .select()
      .single()

    if (error) {
      if (error.message?.includes('relation "complaints" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Complaints table does not exist. Throwing error for fallback handling.')
        throw new Error('TABLE_NOT_EXISTS')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating complaint:', error)
    throw error
  }
}

export const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating complaint:', error)
    throw error
  }
}

export const escalateComplaint = async (id: string) => {
  try {
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('escalation_level')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        escalation_level: (complaint.escalation_level || 0) + 1,
        status: 'escalated',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error escalating complaint:', error)
    throw error
  }
}

export const getComplaints = async (filters?: {
  status?: string
  severity?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}) => {
  try {
    let query = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error } = await query
    if (error) {
      if (error.message?.includes('relation "complaints" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Complaints table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    // Check if it's a table not found error
    if (error instanceof Error && error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('Complaints table does not exist. Using mock data.')
      return []
    }
    console.error('Error fetching complaints:', error)
    return []
  }
}

// Maintenance Request Functions
export const createMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([request])
      .select()
      .single()

    if (error) {
      if (error.message?.includes('relation "maintenance_requests" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Maintenance requests table does not exist. Throwing error for fallback handling.')
        throw new Error('TABLE_NOT_EXISTS')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    throw error
  }
}

export const updateMaintenanceRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating maintenance request:', error)
    throw error
  }
}

export const scheduleMaintenance = async (id: string, scheduledDate: string, technicianId: string) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ 
        scheduled_date: scheduledDate,
        assigned_technician: technicianId,
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error scheduling maintenance:', error)
    throw error
  }
}

export const getMaintenanceRequests = async (filters?: {
  status?: string
  priority?: string
  assigned_technician?: string
  date_from?: string
  date_to?: string
}) => {
  try {
    let query = supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.assigned_technician) {
      query = query.eq('assigned_technician', filters.assigned_technician)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error } = await query
    if (error) {
      if (error.message?.includes('relation "maintenance_requests" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Maintenance requests table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    return []
  }
}

// Warranty Functions
export const createWarranty = async (warranty: Omit<Warranty, 'id' | 'created_at' | 'updated_at' | 'claims_count'>) => {
  try {
    const { data, error } = await supabase
      .from('warranties')
      .insert([{ ...warranty, claims_count: 0 }])
      .select()
      .single()

    if (error) {
      if (error.message?.includes('relation "warranties" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Warranties table does not exist. Throwing error for fallback handling.')
        throw new Error('TABLE_NOT_EXISTS')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating warranty:', error)
    throw error
  }
}

export const getWarranties = async (filters?: {
  customer_id?: string
  status?: string
  warranty_type?: string
}) => {
  try {
    let query = supabase
      .from('warranties')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.warranty_type) {
      query = query.eq('warranty_type', filters.warranty_type)
    }

    const { data, error } = await query
    if (error) {
      if (error.message?.includes('relation "warranties" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Warranties table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching warranties:', error)
    return []
  }
}

export const createWarrantyClaim = async (claim: Omit<WarrantyClaim, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .insert([claim])
      .select()
      .single()

    if (error) throw error

    // Update warranty claims count
    const { data: warrantyData } = await supabase
      .from('warranties')
      .select('claims_count')
      .eq('id', claim.warranty_id)
      .single()

    if (warrantyData) {
      await supabase
        .from('warranties')
        .update({ 
          claims_count: (warrantyData.claims_count || 0) + 1,
          last_claim_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.warranty_id)
    }

    return data
  } catch (error) {
    console.error('Error creating warranty claim:', error)
    throw error
  }
}

export const updateWarrantyClaim = async (id: string, updates: Partial<WarrantyClaim>) => {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating warranty claim:', error)
    throw error
  }
}

export const getWarrantyClaims = async (filters?: {
  warranty_id?: string
  status?: string
  claim_type?: string
}) => {
  try {
    let query = supabase
      .from('warranty_claims')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.warranty_id) {
      query = query.eq('warranty_id', filters.warranty_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.claim_type) {
      query = query.eq('claim_type', filters.claim_type)
    }

    const { data, error } = await query
    if (error) {
      if (error.message?.includes('relation "warranty_claims" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Warranty claims table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching warranty claims:', error)
    return []
  }
}

// Follow-up Service Functions
export const createFollowUpService = async (service: Omit<FollowUpService, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('follow_up_services')
      .insert([service])
      .select()
      .single()

    if (error) {
      if (error.message?.includes('relation "follow_up_services" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Follow-up services table does not exist. Throwing error for fallback handling.')
        throw new Error('TABLE_NOT_EXISTS')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating follow-up service:', error)
    throw error
  }
}

// Create rating for a case
export async function createRating(caseId: string, caseType: string, rating: number) {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Determine the table name based on case type
    let tableName = ''
    switch (caseType) {
      case 'inquiry':
        tableName = 'customer_inquiries'
        break
      case 'complaint':
        tableName = 'complaints'
        break
      case 'maintenance':
        tableName = 'maintenance_requests'
        break
      case 'warranty':
        tableName = 'warranties'
        break
      case 'followup':
        tableName = 'follow_up_services'
        break
      default:
        throw new Error('Invalid case type')
    }

    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from(tableName)
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      throw new Error('TABLE_NOT_EXISTS')
    }

    // Update the case with the new rating
    const { data, error } = await supabase
      .from(tableName)
      .update({ 
        customer_satisfaction_rating: rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select()

    if (error) {
      console.error(`Error updating rating for ${caseType}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating rating:', error)
    throw error
  }
}

export const updateFollowUpService = async (id: string, updates: Partial<FollowUpService>) => {
  try {
    const { data, error } = await supabase
      .from('follow_up_services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating follow-up service:', error)
    throw error
  }
}

export const getFollowUpServices = async (filters?: {
  status?: string
  service_type?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}) => {
  try {
    let query = supabase
      .from('follow_up_services')
      .select('*')
      .order('scheduled_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.date_from) {
      query = query.gte('scheduled_date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('scheduled_date', filters.date_to)
    }

    const { data, error } = await query
    if (error) {
      if (error.message?.includes('relation "follow_up_services" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Follow-up services table does not exist. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching follow-up services:', error)
    return []
  }
}

// Metrics Functions
export const getAfterSalesMetrics = async (dateFrom?: string, dateTo?: string): Promise<AfterSalesMetrics> => {
  try {
    const now = new Date()
    const fromDate = dateFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const toDate = dateTo || now.toISOString()

    // Get inquiries metrics
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('customer_inquiries')
      .select('status, created_at, resolved_at, customer_satisfaction_rating')
      .gte('created_at', fromDate)
      .lte('created_at', toDate)

    if (inquiriesError) {
      if (inquiriesError.message?.includes('relation "customer_inquiries" does not exist') || 
          inquiriesError.message?.includes('Could not find the table')) {
        console.log('Customer inquiries table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw inquiriesError
    }

    // Get complaints metrics
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('status, escalation_level, created_at, resolved_at')
      .gte('created_at', fromDate)
      .lte('created_at', toDate)

    if (complaintsError) {
      if (complaintsError.message?.includes('relation "complaints" does not exist') || 
          complaintsError.message?.includes('Could not find the table')) {
        console.log('Complaints table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw complaintsError
    }

    // Get maintenance requests metrics
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('status, actual_cost, created_at, completed_date')
      .gte('created_at', fromDate)
      .lte('created_at', toDate)

    if (maintenanceError) {
      if (maintenanceError.message?.includes('relation "maintenance_requests" does not exist') || 
          maintenanceError.message?.includes('Could not find the table')) {
        console.log('Maintenance requests table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw maintenanceError
    }

    // Get warranty metrics
    const { data: warranties, error: warrantiesError } = await supabase
      .from('warranties')
      .select('status')

    if (warrantiesError) {
      if (warrantiesError.message?.includes('relation "warranties" does not exist') || 
          warrantiesError.message?.includes('Could not find the table')) {
        console.log('Warranties table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw warrantiesError
    }

    const { data: warrantyClaims, error: warrantyClaimsError } = await supabase
      .from('warranty_claims')
      .select('status')
      .gte('created_at', fromDate)
      .lte('created_at', toDate)

    if (warrantyClaimsError) {
      if (warrantyClaimsError.message?.includes('relation "warranty_claims" does not exist') || 
          warrantyClaimsError.message?.includes('Could not find the table')) {
        console.log('Warranty claims table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw warrantyClaimsError
    }

    // Get follow-up services metrics
    const { data: followUps, error: followUpsError } = await supabase
      .from('follow_up_services')
      .select('status, scheduled_date, completed_date')
      .gte('scheduled_date', fromDate)
      .lte('scheduled_date', toDate)

    if (followUpsError) {
      if (followUpsError.message?.includes('relation "follow_up_services" does not exist') || 
          followUpsError.message?.includes('Could not find the table')) {
        console.log('Follow-up services table does not exist. Using default metrics.')
        return getDefaultMetrics()
      }
      throw followUpsError
    }

    // Calculate metrics
    const totalInquiries = inquiries?.length || 0
    const resolvedInquiries = inquiries?.filter(i => i.status === 'resolved' || i.status === 'closed').length || 0
    const avgResolutionTime = inquiries?.filter(i => i.resolved_at).reduce((acc, i) => {
      const created = new Date(i.created_at)
      const resolved = new Date(i.resolved_at!)
      return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60) // hours
    }, 0) / (resolvedInquiries || 1)

    // Calculate customer satisfaction from all case types
    const allRatings: number[] = []
    
    // Collect ratings from inquiries
    inquiries?.forEach(inquiry => {
      if (inquiry.customer_satisfaction_rating && inquiry.customer_satisfaction_rating > 0) {
        allRatings.push(inquiry.customer_satisfaction_rating)
      }
    })

    // Get ratings from other case types
    const [complaintsWithRatings, maintenanceWithRatings, warrantiesWithRatings, followUpsWithRatings] = await Promise.all([
      supabase.from('complaints').select('customer_satisfaction_rating').gte('created_at', fromDate).lte('created_at', toDate),
      supabase.from('maintenance_requests').select('customer_satisfaction_rating').gte('created_at', fromDate).lte('created_at', toDate),
      supabase.from('warranties').select('customer_satisfaction_rating'),
      supabase.from('follow_up_services').select('customer_satisfaction_rating').gte('scheduled_date', fromDate).lte('scheduled_date', toDate)
    ])

    // Collect ratings from complaints
    complaintsWithRatings.data?.forEach(complaint => {
      if (complaint.customer_satisfaction_rating && complaint.customer_satisfaction_rating > 0) {
        allRatings.push(complaint.customer_satisfaction_rating)
      }
    })

    // Collect ratings from maintenance requests
    maintenanceWithRatings.data?.forEach(maintenance => {
      if (maintenance.customer_satisfaction_rating && maintenance.customer_satisfaction_rating > 0) {
        allRatings.push(maintenance.customer_satisfaction_rating)
      }
    })

    // Collect ratings from warranties
    warrantiesWithRatings.data?.forEach(warranty => {
      if (warranty.customer_satisfaction_rating && warranty.customer_satisfaction_rating > 0) {
        allRatings.push(warranty.customer_satisfaction_rating)
      }
    })

    // Collect ratings from follow-up services
    followUpsWithRatings.data?.forEach(followUp => {
      if (followUp.customer_satisfaction_rating && followUp.customer_satisfaction_rating > 0) {
        allRatings.push(followUp.customer_satisfaction_rating)
      }
    })

    // Calculate average satisfaction from all ratings
    const avgSatisfaction = allRatings.length > 0 
      ? allRatings.reduce((acc, rating) => acc + rating, 0) / allRatings.length
      : 0

    const totalComplaints = complaints?.length || 0
    const resolvedComplaints = complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0
    const escalatedComplaints = complaints?.filter(c => c.escalation_level > 0).length || 0

    const totalMaintenanceRequests = maintenance?.length || 0
    const completedMaintenanceRequests = maintenance?.filter(m => m.status === 'completed').length || 0
    const avgMaintenanceCost = maintenance?.filter(m => m.actual_cost)
      .reduce((acc, m) => acc + (m.actual_cost || 0), 0) / 
      (maintenance?.filter(m => m.actual_cost).length || 1)

    const activeWarranties = warranties?.filter(w => w.status === 'active').length || 0
    const warrantyClaimsCount = warrantyClaims?.length || 0
    const approvedClaims = warrantyClaims?.filter(c => c.status === 'approved').length || 0

    const scheduledFollowUps = followUps?.length || 0
    const completedFollowUps = followUps?.filter(f => f.status === 'completed').length || 0

    return {
      total_inquiries: totalInquiries,
      resolved_inquiries: resolvedInquiries,
      average_resolution_time_hours: Math.round(avgResolutionTime * 100) / 100,
      customer_satisfaction_score: Math.round(avgSatisfaction * 100) / 100,
      total_complaints: totalComplaints,
      resolved_complaints: resolvedComplaints,
      complaint_escalation_rate: totalComplaints > 0 ? Math.round((escalatedComplaints / totalComplaints) * 100) : 0,
      total_maintenance_requests: totalMaintenanceRequests,
      completed_maintenance_requests: completedMaintenanceRequests,
      average_maintenance_cost: Math.round(avgMaintenanceCost * 100) / 100,
      active_warranties: activeWarranties,
      warranty_claims_count: warrantyClaimsCount,
      warranty_claim_approval_rate: warrantyClaimsCount > 0 ? Math.round((approvedClaims / warrantyClaimsCount) * 100) : 0,
      scheduled_follow_ups: scheduledFollowUps,
      completed_follow_ups: completedFollowUps,
      customer_retention_rate: 85 // This would be calculated from actual customer data
    }
  } catch (error) {
    // Check if it's a table not found error
    if (error instanceof Error && error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('After-sales tables do not exist. Using default metrics.')
      return getDefaultMetrics()
    }
    console.error('Error fetching after-sales metrics:', error)
    return getDefaultMetrics()
  }
}

// Helper function to return default metrics when tables don't exist
const getDefaultMetrics = (): AfterSalesMetrics => {
  return {
    total_inquiries: 0,
    resolved_inquiries: 0,
    average_resolution_time_hours: 0,
    customer_satisfaction_score: 0,
    total_complaints: 0,
    resolved_complaints: 0,
    complaint_escalation_rate: 0,
    total_maintenance_requests: 0,
    completed_maintenance_requests: 0,
    average_maintenance_cost: 0,
    active_warranties: 0,
    warranty_claims_count: 0,
    warranty_claim_approval_rate: 0,
    scheduled_follow_ups: 0,
    completed_follow_ups: 0,
    customer_retention_rate: 0
  }
}

// Support Agent Functions
export const getSupportAgents = async () => {
  try {
    const { data, error } = await supabase
      .from('support_agents')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching support agents:', error)
    throw error
  }
}

export const assignToAgent = async (type: 'inquiry' | 'complaint' | 'maintenance' | 'followup', id: string, agentId: string) => {
  try {
    const tableName = type === 'inquiry' ? 'customer_inquiries' :
                     type === 'complaint' ? 'complaints' :
                     type === 'maintenance' ? 'maintenance_requests' :
                     'follow_up_services'

    const { data, error } = await supabase
      .from(tableName)
      .update({ 
        assigned_to: agentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error assigning to agent:', error)
    throw error
  }
}
