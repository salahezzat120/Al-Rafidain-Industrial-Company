import { supabase } from './supabase'

export interface Alert {
  id: string
  alert_id: string
  alert_type: 'system' | 'visit' | 'late_visit' | 'vehicle' | 'delivery' | 'warehouse' | 'maintenance' | 'stock' | 'user'
  category: 'general' | 'critical' | 'warning' | 'info' | 'success' | 'urgent'
  severity: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  description?: string
  status: 'active' | 'resolved' | 'dismissed' | 'escalated' | 'archived'
  is_read: boolean
  is_resolved: boolean
  resolved_at?: string
  resolved_by?: string
  dismissed_at?: string
  dismissed_by?: string
  visit_id?: string
  delegate_id?: string
  delegate_name?: string
  delegate_phone?: string
  delegate_email?: string
  customer_id?: string
  customer_name?: string
  customer_address?: string
  vehicle_id?: string
  vehicle_plate?: string
  driver_name?: string
  driver_phone?: string
  location?: string
  scheduled_time?: string
  actual_time?: string
  delay_minutes?: number
  grace_period_minutes?: number
  escalation_threshold_minutes?: number
  escalation_level?: 'initial' | 'escalated' | 'critical'
  escalation_count: number
  last_escalated_at?: string
  escalation_notes?: string
  notify_admins: boolean
  notify_supervisors: boolean
  send_push_notification: boolean
  send_email_notification: boolean
  send_sms_notification: boolean
  admin_notified: boolean
  supervisor_notified: boolean
  push_sent: boolean
  email_sent: boolean
  sms_sent: boolean
  notification_sent_at?: string
  metadata?: any
  tags?: string[]
  source_system?: string
  created_by?: string
  assigned_to?: string
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface AlertStats {
  total: number
  active: number
  resolved: number
  dismissed: number
  critical: number
  high: number
  medium: number
  low: number
  unread: number
  today: number
  thisWeek: number
}

export async function getAlerts(filters?: {
  limit?: number
  status?: string
  severity?: string
  alertType?: string
}): Promise<{ data: Alert[] | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Database connection not available' }
    }

    const { limit = 10, status = 'active', severity, alertType } = filters || {}

    let query = supabase
      .from('unified_alerts_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
      return { data: null, error: 'Failed to fetch alerts' }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getAlerts:', error)
    return { data: null, error: 'Internal server error' }
  }
}

export async function getAlertStats(): Promise<{ data: AlertStats | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Database connection not available' }
    }

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total alerts:', totalError)
      return { data: null, error: 'Failed to fetch alert stats' }
    }

    // Get active count
    const { count: active, error: activeError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (activeError) {
      console.error('Error fetching active alerts:', activeError)
      return { data: null, error: 'Failed to fetch alert stats' }
    }

    // Get resolved count
    const { count: resolved, error: resolvedError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')

    if (resolvedError) {
      console.error('Error fetching resolved alerts:', resolvedError)
      return { data: null, error: 'Failed to fetch alert stats' }
    }

    // Get dismissed count
    const { count: dismissed, error: dismissedError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'dismissed')

    if (dismissedError) {
      console.error('Error fetching dismissed alerts:', dismissedError)
      return { data: null, error: 'Failed to fetch alert stats' }
    }

    // Get severity counts
    const { count: critical, error: criticalError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')

    const { count: high, error: highError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'high')

    const { count: medium, error: mediumError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'medium')

    const { count: low, error: lowError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'low')

    // Get unread count
    const { count: unread, error: unreadError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    // Get today's count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayCount, error: todayError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get this week's count
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const { count: thisWeek, error: weekError } = await supabase
      .from('unified_alerts_notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())

    const stats: AlertStats = {
      total: total || 0,
      active: active || 0,
      resolved: resolved || 0,
      dismissed: dismissed || 0,
      critical: critical || 0,
      high: high || 0,
      medium: medium || 0,
      low: low || 0,
      unread: unread || 0,
      today: todayCount || 0,
      thisWeek: thisWeek || 0
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error in getAlertStats:', error)
    return { data: null, error: 'Internal server error' }
  }
}

export async function createAlert(alertData: Partial<Alert>): Promise<{ data: Alert | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Database connection not available' }
    }

    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .insert(alertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating alert:', error)
      return { data: null, error: 'Failed to create alert' }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createAlert:', error)
    return { data: null, error: 'Internal server error' }
  }
}

export async function updateAlert(id: string, updates: Partial<Alert>): Promise<{ data: Alert | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Database connection not available' }
    }

    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating alert:', error)
      return { data: null, error: 'Failed to update alert' }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateAlert:', error)
    return { data: null, error: 'Internal server error' }
  }
}

export async function performAlertAction(
  alertId: string,
  action: 'mark_read' | 'mark_unread' | 'resolve' | 'dismiss' | 'escalate' | 'acknowledge',
  userId?: string
): Promise<{ data: Alert | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Database connection not available' }
    }

    let updateData: any = {}

    switch (action) {
      case 'mark_read':
        updateData = {
          is_read: true,
          updated_at: new Date().toISOString()
        }
        break

      case 'mark_unread':
        updateData = {
          is_read: false,
          updated_at: new Date().toISOString()
        }
        break

      case 'resolve':
        updateData = {
          is_resolved: true,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          updated_at: new Date().toISOString()
        }
        break

      case 'dismiss':
        updateData = {
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
          dismissed_by: userId,
          updated_at: new Date().toISOString()
        }
        break

      case 'escalate':
        updateData = {
          escalation_level: 'escalated',
          escalation_count: supabase.raw('escalation_count + 1'),
          last_escalated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      case 'acknowledge':
        updateData = {
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        break

      default:
        return { data: null, error: 'Invalid action' }
    }

    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      console.error('Error performing alert action:', error)
      return { data: null, error: 'Failed to perform action' }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in performAlertAction:', error)
    return { data: null, error: 'Internal server error' }
  }
}
