import { supabase } from './supabase'
import type { Visit, Delegate, VisitAlert, InternalMessage, ChatMessage } from '@/types/visits'

// Visit Management Functions
export const createVisit = async (visit: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'is_late' | 'exceeds_time_limit'>) => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert([visit])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating visit:', error)
    throw error
  }
}

export const updateVisit = async (id: string, updates: Partial<Visit>) => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating visit:', error)
    throw error
  }
}

export const getVisitsByDelegate = async (delegateId: string) => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('delegate_id', delegateId)
      .order('scheduled_start_time', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching visits:', error)
    throw error
  }
}

export const getUpcomingVisits = async () => {
  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('scheduled_start_time', now)
      .order('scheduled_start_time', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching upcoming visits:', error)
    throw error
  }
}

// Alert Functions
export const createVisitAlert = async (alert: Omit<VisitAlert, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('visit_alerts')
      .insert([alert])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating visit alert:', error)
    throw error
  }
}

export const getUnreadAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from('visit_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching alerts:', error)
    throw error
  }
}

export const markAlertAsRead = async (alertId: string) => {
  try {
    const { data, error } = await supabase
      .from('visit_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking alert as read:', error)
    throw error
  }
}

// Messaging Functions
export const sendInternalMessage = async (message: Omit<InternalMessage, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('internal_messages')
      .insert([message])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const getMessagesForUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('internal_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

export const markMessageAsRead = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('internal_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw error
  }
}

// Chat Functions
export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ ...message, timestamp: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error sending chat message:', error)
    throw error
  }
}

export const getChatMessages = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data?.reverse() || []
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    throw error
  }
}

// Monitoring Functions
export const checkLateVisits = async () => {
  try {
    const now = new Date()
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_start_time', now.toISOString())

    if (error) {
      // Check if it's a table not found error
      if (error.message?.includes('relation "visits" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Visits table does not exist. Skipping late visit checks.')
        return []
      }
      throw error
    }

    const lateVisits = data?.filter(visit => {
      const scheduledTime = new Date(visit.scheduled_start_time)
      const timeDiff = now.getTime() - scheduledTime.getTime()
      return timeDiff > 0 && !visit.is_late
    }) || []

    // Create alerts for late visits
    for (const visit of lateVisits) {
      await createVisitAlert({
        visit_id: visit.id,
        delegate_id: visit.delegate_id,
        alert_type: 'late_arrival',
        severity: 'high',
        message: `Delegate ${visit.delegate_name} is late for visit at ${visit.customer_name}`,
        is_read: false,
        admin_notified: false
      })

      await updateVisit(visit.id, { is_late: true, status: 'late' })
    }

    return lateVisits
  } catch (error) {
    // Check if it's a table not found error
    if (error instanceof Error && 
        (error.message?.includes('relation "visits" does not exist') || 
         error.message?.includes('Could not find the table'))) {
      console.log('Visits table does not exist. Skipping late visit checks.')
      return []
    }
    console.error('Error checking late visits:', error)
    return [] // Return empty array instead of throwing
  }
}

export const checkExceededTimeVisits = async () => {
  try {
    const now = new Date()
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('status', 'in_progress')
      .not('actual_start_time', 'is', null)

    if (error) {
      // Check if it's a table not found error
      if (error.message?.includes('relation "visits" does not exist') || 
          error.message?.includes('Could not find the table')) {
        console.log('Visits table does not exist. Skipping exceeded time visit checks.')
        return []
      }
      throw error
    }

    const exceededVisits = data?.filter(visit => {
      if (!visit.actual_start_time) return false
      
      const startTime = new Date(visit.actual_start_time)
      const timeDiff = now.getTime() - startTime.getTime()
      const allowedDurationMs = visit.allowed_duration_minutes * 60 * 1000
      
      return timeDiff > allowedDurationMs && !visit.exceeds_time_limit
    }) || []

    // Create alerts for exceeded time visits
    for (const visit of exceededVisits) {
      await createVisitAlert({
        visit_id: visit.id,
        delegate_id: visit.delegate_id,
        alert_type: 'time_exceeded',
        severity: 'medium',
        message: `Delegate ${visit.delegate_name} has exceeded allowed time for visit at ${visit.customer_name}`,
        is_read: false,
        admin_notified: false
      })

      await updateVisit(visit.id, { exceeds_time_limit: true })
    }

    return exceededVisits
  } catch (error) {
    // Check if it's a table not found error
    if (error instanceof Error && 
        (error.message?.includes('relation "visits" does not exist') || 
         error.message?.includes('Could not find the table'))) {
      console.log('Visits table does not exist. Skipping exceeded time visit checks.')
      return []
    }
    console.error('Error checking exceeded time visits:', error)
    return [] // Return empty array instead of throwing
  }
}
