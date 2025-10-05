// Visit Alerts Sync - Syncs alerts from visit_management table to unified_alerts_notifications table
import { supabase } from './supabase'

export interface VisitManagementAlert {
  id: string
  visit_id: string
  delegate_id: string
  delegate_name: string
  delegate_email?: string
  delegate_phone?: string
  customer_id: string
  customer_name: string
  customer_address: string
  customer_phone?: string
  customer_email?: string
  scheduled_start_time: string
  scheduled_end_time: string
  actual_start_time?: string
  actual_end_time?: string
  visit_type: string
  priority: string
  status: string
  allowed_duration_minutes: number
  is_late: boolean
  exceeds_time_limit: boolean
  alert_type?: string
  alert_severity?: string
  alert_message?: string
  is_alert_read: boolean
  admin_notified: boolean
  internal_message?: string
  message_type?: string
  message_priority?: string
  is_message_read: boolean
  current_location?: string
  created_at: string
  updated_at: string
}

export class VisitAlertsSync {
  private static instance: VisitAlertsSync
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime: Date | null = null

  constructor() {
    this.lastSyncTime = new Date()
  }

  public static getInstance(): VisitAlertsSync {
    if (!VisitAlertsSync.instance) {
      VisitAlertsSync.instance = new VisitAlertsSync()
    }
    return VisitAlertsSync.instance
  }

  // Start automatic syncing
  public startAutoSync(intervalMinutes: number = 2): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      await this.syncVisitAlerts()
    }, intervalMinutes * 60 * 1000)

    console.log(`Visit alerts auto-sync started (every ${intervalMinutes} minutes)`)
  }

  // Stop automatic syncing
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    console.log('Visit alerts auto-sync stopped')
  }

  // Manual sync of visit alerts
  public async syncVisitAlerts(): Promise<{ synced: number; errors: number }> {
    try {
      console.log('Syncing visit alerts...')
      
      // Get all visit management records with alerts
      const { data: visitAlerts, error: fetchError } = await supabase
        .from('visit_management')
        .select('*')
        .not('alert_type', 'is', null)
        .not('alert_message', 'is', null)

      if (fetchError) {
        console.error('Error fetching visit alerts:', fetchError)
        return { synced: 0, errors: 1 }
      }

      if (!visitAlerts || visitAlerts.length === 0) {
        console.log('No visit alerts to sync')
        return { synced: 0, errors: 0 }
      }

      console.log(`Found ${visitAlerts.length} visit alerts to sync`)

      let syncedCount = 0
      let errorCount = 0

      for (const visitAlert of visitAlerts) {
        try {
          await this.syncSingleVisitAlert(visitAlert)
          syncedCount++
        } catch (error) {
          console.error(`Error syncing visit alert ${visitAlert.id}:`, error)
          errorCount++
        }
      }

      this.lastSyncTime = new Date()
      console.log(`Visit alerts sync completed: ${syncedCount} synced, ${errorCount} errors`)
      
      return { synced: syncedCount, errors: errorCount }
    } catch (error) {
      console.error('Error in syncVisitAlerts:', error)
      return { synced: 0, errors: 1 }
    }
  }

  // Sync a single visit alert
  private async syncSingleVisitAlert(visitAlert: VisitManagementAlert): Promise<void> {
    // Check if alert already exists in unified table
    const { data: existingAlert } = await supabase
      .from('unified_alerts_notifications')
      .select('id')
      .eq('visit_id', visitAlert.visit_id)
      .eq('alert_type', this.mapAlertType(visitAlert.alert_type))
      .single()

    if (existingAlert) {
      // Update existing alert
      await this.updateExistingAlert(visitAlert, existingAlert.id)
    } else {
      // Create new alert
      await this.createNewAlert(visitAlert)
    }
  }

  // Map visit management alert type to unified alert type
  private mapAlertType(alertType?: string): string {
    switch (alertType) {
      case 'late_arrival':
        return 'late_visit'
      case 'time_exceeded':
        return 'visit'
      case 'no_show':
        return 'visit'
      case 'early_completion':
        return 'visit'
      default:
        return 'visit'
    }
  }

  // Map visit management severity to unified category
  private mapCategory(severity?: string): string {
    switch (severity) {
      case 'critical':
        return 'critical'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'info'
      default:
        return 'warning'
    }
  }

  // Map visit management severity to unified severity
  private mapSeverity(severity?: string): string {
    switch (severity) {
      case 'low':
        return 'low'
      case 'medium':
        return 'medium'
      case 'high':
        return 'high'
      case 'critical':
        return 'critical'
      default:
        return 'medium'
    }
  }

  // Map visit management priority to unified priority
  private mapPriority(priority?: string): string {
    switch (priority) {
      case 'low':
        return 'low'
      case 'medium':
        return 'medium'
      case 'high':
        return 'high'
      case 'urgent':
        return 'critical'
      default:
        return 'medium'
    }
  }

  // Create new alert in unified table
  private async createNewAlert(visitAlert: VisitManagementAlert): Promise<void> {
    const category = this.mapCategory(visitAlert.alert_severity)
    const severity = this.mapSeverity(visitAlert.alert_severity)
    const priority = this.mapPriority(visitAlert.priority)
    
    console.log('Creating alert with category:', category, 'severity:', severity, 'priority:', priority)
    console.log('Visit alert data:', {
      alert_severity: visitAlert.alert_severity,
      priority: visitAlert.priority,
      alert_type: visitAlert.alert_type,
      is_alert_read: visitAlert.is_alert_read
    })
    
    const alertData = {
      alert_id: `VISIT_${visitAlert.visit_id}_${Date.now()}`,
      alert_type: this.mapAlertType(visitAlert.alert_type),
      category: category,
      severity: severity,
      priority: priority,
      title: this.generateAlertTitle(visitAlert),
      message: visitAlert.alert_message || this.generateAlertMessage(visitAlert),
      description: this.generateAlertDescription(visitAlert),
      status: visitAlert.is_alert_read ? 'resolved' : 'active',
      is_read: visitAlert.is_alert_read,
      is_resolved: visitAlert.is_alert_read,
      visit_id: visitAlert.visit_id,
      delegate_id: visitAlert.delegate_id,
      delegate_name: visitAlert.delegate_name,
      delegate_phone: visitAlert.delegate_phone,
      customer_id: visitAlert.customer_id,
      customer_name: visitAlert.customer_name,
      customer_address: visitAlert.customer_address,
      location: visitAlert.customer_address,
      scheduled_time: visitAlert.scheduled_start_time,
      actual_time: visitAlert.actual_start_time,
      delay_minutes: this.calculateDelayMinutes(visitAlert),
      escalation_level: this.determineEscalationLevel(visitAlert),
      notify_admins: true,
      notify_supervisors: visitAlert.alert_severity === 'critical' || visitAlert.alert_severity === 'high',
      send_push_notification: true,
      send_email_notification: visitAlert.alert_severity === 'critical',
      admin_notified: visitAlert.admin_notified,
      tags: this.generateTags(visitAlert),
      source_system: 'visit_management',
      created_by: 'visit_management_sync',
      metadata: {
        original_visit_id: visitAlert.id,
        visit_type: visitAlert.visit_type,
        is_late: visitAlert.is_late,
        exceeds_time_limit: visitAlert.exceeds_time_limit,
        allowed_duration_minutes: visitAlert.allowed_duration_minutes,
        current_location: visitAlert.current_location,
        internal_message: visitAlert.internal_message,
        message_type: visitAlert.message_type,
        message_priority: visitAlert.message_priority
      }
    }

    const { error } = await supabase
      .from('unified_alerts_notifications')
      .insert(alertData)

    if (error) {
      throw new Error(`Failed to create unified alert: ${error.message}`)
    }
  }

  // Update existing alert in unified table
  private async updateExistingAlert(visitAlert: VisitManagementAlert, unifiedAlertId: string): Promise<void> {
    const category = this.mapCategory(visitAlert.alert_severity)
    const severity = this.mapSeverity(visitAlert.alert_severity)
    const priority = this.mapPriority(visitAlert.priority)
    const escalationLevel = this.determineEscalationLevel(visitAlert)
    
    console.log('Updating alert with category:', category, 'severity:', severity, 'priority:', priority, 'escalation_level:', escalationLevel)
    console.log('Visit alert data:', {
      alert_severity: visitAlert.alert_severity,
      priority: visitAlert.priority,
      alert_type: visitAlert.alert_type,
      is_alert_read: visitAlert.is_alert_read
    })
    
    const updateData = {
      category: category,
      severity: severity,
      priority: priority,
      title: this.generateAlertTitle(visitAlert),
      message: visitAlert.alert_message || this.generateAlertMessage(visitAlert),
      description: this.generateAlertDescription(visitAlert),
      status: visitAlert.is_alert_read ? 'resolved' : 'active',
      is_read: visitAlert.is_alert_read,
      is_resolved: visitAlert.is_alert_read,
      delegate_name: visitAlert.delegate_name,
      delegate_phone: visitAlert.delegate_phone,
      customer_name: visitAlert.customer_name,
      customer_address: visitAlert.customer_address,
      location: visitAlert.customer_address,
      actual_time: visitAlert.actual_start_time,
      delay_minutes: this.calculateDelayMinutes(visitAlert),
      escalation_level: escalationLevel,
      notify_supervisors: visitAlert.alert_severity === 'critical' || visitAlert.alert_severity === 'high',
      send_email_notification: visitAlert.alert_severity === 'critical',
      admin_notified: visitAlert.admin_notified,
      tags: this.generateTags(visitAlert),
      metadata: {
        original_visit_id: visitAlert.id,
        visit_type: visitAlert.visit_type,
        is_late: visitAlert.is_late,
        exceeds_time_limit: visitAlert.exceeds_time_limit,
        allowed_duration_minutes: visitAlert.allowed_duration_minutes,
        current_location: visitAlert.current_location,
        internal_message: visitAlert.internal_message,
        message_type: visitAlert.message_type,
        message_priority: visitAlert.message_priority
      }
    }

    const { error } = await supabase
      .from('unified_alerts_notifications')
      .update(updateData)
      .eq('id', unifiedAlertId)

    if (error) {
      throw new Error(`Failed to update unified alert: ${error.message}`)
    }
  }

  // Generate alert title
  private generateAlertTitle(visitAlert: VisitManagementAlert): string {
    switch (visitAlert.alert_type) {
      case 'late_arrival':
        return `Late Visit Alert - Visit #${visitAlert.visit_id}`
      case 'time_exceeded':
        return `Time Exceeded - Visit #${visitAlert.visit_id}`
      case 'no_show':
        return `No Show - Visit #${visitAlert.visit_id}`
      case 'early_completion':
        return `Early Completion - Visit #${visitAlert.visit_id}`
      default:
        return `Visit Alert - Visit #${visitAlert.visit_id}`
    }
  }

  // Generate alert message
  private generateAlertMessage(visitAlert: VisitManagementAlert): string {
    if (visitAlert.alert_message) {
      return visitAlert.alert_message
    }

    switch (visitAlert.alert_type) {
      case 'late_arrival':
        return `Delegate ${visitAlert.delegate_name} is late for visit at ${visitAlert.customer_name}`
      case 'time_exceeded':
        return `Delegate ${visitAlert.delegate_name} has exceeded allowed time for visit at ${visitAlert.customer_name}`
      case 'no_show':
        return `Delegate ${visitAlert.delegate_name} did not show up for visit at ${visitAlert.customer_name}`
      case 'early_completion':
        return `Delegate ${visitAlert.delegate_name} completed visit early at ${visitAlert.customer_name}`
      default:
        return `Visit alert for ${visitAlert.customer_name}`
    }
  }

  // Generate alert description
  private generateAlertDescription(visitAlert: VisitManagementAlert): string {
    const delay = this.calculateDelayMinutes(visitAlert)
    const delayText = delay > 0 ? ` (${delay} minutes late)` : ''
    
    return `Visit #${visitAlert.visit_id} at ${visitAlert.customer_name}${delayText}. ` +
           `Delegate: ${visitAlert.delegate_name}. ` +
           `Scheduled: ${new Date(visitAlert.scheduled_start_time).toLocaleString()}. ` +
           `Status: ${visitAlert.status}.`
  }

  // Calculate delay in minutes
  private calculateDelayMinutes(visitAlert: VisitManagementAlert): number {
    if (!visitAlert.actual_start_time) {
      const scheduledTime = new Date(visitAlert.scheduled_start_time)
      const currentTime = new Date()
      return Math.max(0, Math.floor((currentTime.getTime() - scheduledTime.getTime()) / (60 * 1000)))
    }
    return 0
  }

  // Determine escalation level
  private determineEscalationLevel(visitAlert: VisitManagementAlert): string {
    const delay = this.calculateDelayMinutes(visitAlert)
    
    if (delay >= 60) return 'critical'
    if (delay >= 30) return 'escalated'
    return 'initial'
  }

  // Generate tags
  private generateTags(visitAlert: VisitManagementAlert): string[] {
    const tags = ['visit', visitAlert.alert_type || 'general']
    
    if (visitAlert.is_late) tags.push('late')
    if (visitAlert.exceeds_time_limit) tags.push('time_exceeded')
    if (visitAlert.alert_severity === 'critical') tags.push('critical')
    if (visitAlert.alert_severity === 'high') tags.push('high_priority')
    
    return tags
  }

  // Get sync status
  public getSyncStatus(): { isActive: boolean; lastSync: Date | null } {
    return {
      isActive: this.syncInterval !== null,
      lastSync: this.lastSyncTime
    }
  }

  // Force sync all visit alerts
  public async forceSyncAll(): Promise<{ synced: number; errors: number }> {
    console.log('Force syncing all visit alerts...')
    return await this.syncVisitAlerts()
  }
}

// Export singleton instance
export const visitAlertsSync = VisitAlertsSync.getInstance()

// Utility functions
export const startVisitAlertsSync = (intervalMinutes?: number) => 
  visitAlertsSync.startAutoSync(intervalMinutes)

export const stopVisitAlertsSync = () => 
  visitAlertsSync.stopAutoSync()

export const syncVisitAlerts = () => 
  visitAlertsSync.syncVisitAlerts()

export const forceSyncAllVisitAlerts = () => 
  visitAlertsSync.forceSyncAll()

export const getVisitAlertsSyncStatus = () => 
  visitAlertsSync.getSyncStatus()
