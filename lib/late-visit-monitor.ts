// Late Visit Monitoring System
// Comprehensive monitoring and notification system for late visits

import { supabase } from './supabase'
import { createAlert, type SystemAlert } from './notifications'

export interface LateVisitAlert {
  visitId: string
  delegateId: string
  delegateName: string
  delegatePhone: string
  customerName: string
  customerAddress: string
  scheduledTime: string
  currentTime: string
  delayMinutes: number
  lastKnownStatus: string
  lastKnownLocation?: string
  escalationLevel: 'initial' | 'escalated' | 'critical'
  gracePeriodMinutes: number
  escalationThresholdMinutes: number
}

export interface VisitMonitoringConfig {
  gracePeriodMinutes: number
  escalationThresholdMinutes: number
  checkIntervalMinutes: number
  autoEscalate: boolean
  notifyAdmins: boolean
  notifySupervisors: boolean
  sendPushNotifications: boolean
  sendEmailNotifications: boolean
}

export class LateVisitMonitor {
  private static instance: LateVisitMonitor
  private config: VisitMonitoringConfig
  private monitoringInterval: NodeJS.Timeout | null = null
  private processedAlerts: Set<string> = new Set()

  constructor() {
    this.config = {
      gracePeriodMinutes: 10, // 10 minutes grace period
      escalationThresholdMinutes: 30, // Escalate after 30 minutes
      checkIntervalMinutes: 2, // Check every 2 minutes
      autoEscalate: true,
      notifyAdmins: true,
      notifySupervisors: true,
      sendPushNotifications: true,
      sendEmailNotifications: true
    }
  }

  public static getInstance(): LateVisitMonitor {
    if (!LateVisitMonitor.instance) {
      LateVisitMonitor.instance = new LateVisitMonitor()
    }
    return LateVisitMonitor.instance
  }

  // Start monitoring visits
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      await this.checkLateVisits()
    }, this.config.checkIntervalMinutes * 60 * 1000)

    console.log('Late visit monitoring started')
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    console.log('Late visit monitoring stopped')
  }

  // Update monitoring configuration
  public updateConfig(newConfig: Partial<VisitMonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Main function to check for late visits
  public async checkLateVisits(): Promise<void> {
    try {
      const currentTime = new Date()
      const gracePeriodMs = this.config.gracePeriodMinutes * 60 * 1000
      const escalationThresholdMs = this.config.escalationThresholdMinutes * 60 * 1000

      // Get all scheduled visits that haven't started
      const { data: visits, error } = await supabase
        .from('visit_management')
        .select('*')
        .in('status', ['scheduled', 'late'])
        .lte('scheduled_start_time', currentTime.toISOString())

      if (error) {
        console.error('Error fetching visits:', error)
        return
      }

      if (!visits || visits.length === 0) {
        return
      }

      for (const visit of visits) {
        const scheduledTime = new Date(visit.scheduled_start_time)
        const timeSinceScheduled = currentTime.getTime() - scheduledTime.getTime()
        const delayMinutes = Math.floor(timeSinceScheduled / (60 * 1000))

        // Check if visit is late (past grace period)
        if (timeSinceScheduled > gracePeriodMs && !visit.actual_start_time) {
          await this.handleLateVisit(visit, delayMinutes, timeSinceScheduled)
        }
      }
    } catch (error) {
      console.error('Error in checkLateVisits:', error)
    }
  }

  // Handle a late visit
  private async handleLateVisit(visit: any, delayMinutes: number, timeSinceScheduled: number): Promise<void> {
    const alertKey = `late_${visit.visit_id}_${Math.floor(delayMinutes / 10)}`
    
    // Avoid duplicate alerts for the same visit within 10-minute windows
    if (this.processedAlerts.has(alertKey)) {
      return
    }

    this.processedAlerts.add(alertKey)

    const escalationLevel = this.determineEscalationLevel(timeSinceScheduled)
    const lastKnownStatus = visit.delegate_status || 'unknown'
    const lastKnownLocation = visit.current_location || 'Location not updated'

    const lateVisitAlert: LateVisitAlert = {
      visitId: visit.visit_id,
      delegateId: visit.delegate_id,
      delegateName: visit.delegate_name,
      delegatePhone: visit.delegate_phone || 'N/A',
      customerName: visit.customer_name,
      customerAddress: visit.customer_address,
      scheduledTime: visit.scheduled_start_time,
      currentTime: new Date().toISOString(),
      delayMinutes,
      lastKnownStatus,
      lastKnownLocation,
      escalationLevel,
      gracePeriodMinutes: this.config.gracePeriodMinutes,
      escalationThresholdMinutes: this.config.escalationThresholdMinutes
    }

    // Create system alert
    await this.createLateVisitAlert(lateVisitAlert)

    // Update visit status
    await this.updateVisitStatus(visit.visit_id, 'late', delayMinutes)

    // Send notifications
    await this.sendNotifications(lateVisitAlert)

    // Auto-escalate if needed
    if (escalationLevel === 'escalated' || escalationLevel === 'critical') {
      await this.escalateAlert(lateVisitAlert)
    }
  }

  // Determine escalation level based on delay
  private determineEscalationLevel(timeSinceScheduled: number): 'initial' | 'escalated' | 'critical' {
    const escalationThresholdMs = this.config.escalationThresholdMinutes * 60 * 1000
    const criticalThresholdMs = escalationThresholdMs * 2

    if (timeSinceScheduled >= criticalThresholdMs) {
      return 'critical'
    } else if (timeSinceScheduled >= escalationThresholdMs) {
      return 'escalated'
    } else {
      return 'initial'
    }
  }

  // Create system alert for late visit
  private async createLateVisitAlert(alert: LateVisitAlert): Promise<void> {
    const alertType = alert.escalationLevel === 'critical' ? 'critical' : 
                     alert.escalationLevel === 'escalated' ? 'warning' : 'warning'
    
    const priority = alert.escalationLevel === 'critical' ? 'critical' : 
                    alert.escalationLevel === 'escalated' ? 'high' : 'medium'

    const title = `Late Visit Alert - ${alert.escalationLevel === 'critical' ? 'CRITICAL' : 'WARNING'}`
    const message = this.generateAlertMessage(alert)

    const systemAlert: Omit<SystemAlert, 'id' | 'timestamp' | 'resolved'> = {
      type: alertType,
      category: 'visit',
      title,
      message,
      priority,
      driver: alert.delegateName,
      location: alert.customerName,
      metadata: {
        visitId: alert.visitId,
        delegateId: alert.delegateId,
        delegatePhone: alert.delegatePhone,
        customerName: alert.customerName,
        customerAddress: alert.customerAddress,
        scheduledTime: alert.scheduledTime,
        currentTime: alert.currentTime,
        delayMinutes: alert.delayMinutes,
        lastKnownStatus: alert.lastKnownStatus,
        lastKnownLocation: alert.lastKnownLocation,
        escalationLevel: alert.escalationLevel,
        gracePeriodMinutes: alert.gracePeriodMinutes,
        escalationThresholdMinutes: alert.escalationThresholdMinutes
      }
    }

    await createAlert(systemAlert)
  }

  // Generate alert message
  private generateAlertMessage(alert: LateVisitAlert): string {
    const action = this.getRecommendedAction(alert)
    
    return `Agent ${alert.delegateName} hasn't arrived for Visit #${alert.visitId} (Client: ${alert.customerName}). ` +
           `Scheduled: ${new Date(alert.scheduledTime).toLocaleTimeString()} — ` +
           `Current: ${new Date(alert.currentTime).toLocaleTimeString()} — ` +
           `Delay: ${alert.delayMinutes} min. ` +
           `Last known status: ${alert.lastKnownStatus}. ` +
           `Action: ${action}`
  }

  // Get recommended action based on escalation level
  private getRecommendedAction(alert: LateVisitAlert): string {
    switch (alert.escalationLevel) {
      case 'critical':
        return 'URGENT: Call agent immediately or reassign visit to backup agent'
      case 'escalated':
        return 'Call agent or reassign visit to supervisor'
      default:
        return 'Call agent or reassign visit'
    }
  }

  // Update visit status in database
  private async updateVisitStatus(visitId: string, status: string, delayMinutes: number): Promise<void> {
    try {
      await supabase
        .from('visit_management')
        .update({
          status,
          is_late: true,
          alert_type: 'late_arrival',
          alert_severity: delayMinutes > 30 ? 'critical' : delayMinutes > 15 ? 'high' : 'medium',
          alert_message: `Visit is ${delayMinutes} minutes late`,
          admin_notified: true,
          updated_at: new Date().toISOString()
        })
        .eq('visit_id', visitId)
    } catch (error) {
      console.error('Error updating visit status:', error)
    }
  }

  // Send notifications
  private async sendNotifications(alert: LateVisitAlert): Promise<void> {
    if (this.config.notifyAdmins) {
      await this.sendAdminNotification(alert)
    }

    if (this.config.sendPushNotifications) {
      await this.sendPushNotification(alert)
    }

    if (this.config.sendEmailNotifications) {
      await this.sendEmailNotification(alert)
    }
  }

  // Send admin notification
  private async sendAdminNotification(alert: LateVisitAlert): Promise<void> {
    const notification = {
      type: 'late_visit',
      title: `Late Visit — Visit #${alert.visitId} — Agent ${alert.delegateName} — ${alert.delayMinutes} minutes late`,
      message: this.generateAlertMessage(alert),
      visitId: alert.visitId,
      delegateId: alert.delegateId,
      escalationLevel: alert.escalationLevel,
      timestamp: new Date().toISOString()
    }

    // Store in database for dashboard display
    try {
      await supabase
        .from('visit_management')
        .update({
          internal_message: notification.message,
          message_type: 'system_alert',
          message_priority: alert.escalationLevel === 'critical' ? 'urgent' : 'high',
          is_message_read: false
        })
        .eq('visit_id', alert.visitId)
    } catch (error) {
      console.error('Error storing admin notification:', error)
    }
  }

  // Send push notification
  private async sendPushNotification(alert: LateVisitAlert): Promise<void> {
    const pushNotification = {
      title: `Late Visit — Visit #${alert.visitId} — Agent ${alert.delegateName} — ${alert.delayMinutes} minutes late`,
      body: `Agent ${alert.delegateName} is ${alert.delayMinutes} minutes late for Visit #${alert.visitId} at ${alert.customerName} (scheduled ${new Date(alert.scheduledTime).toLocaleTimeString()}). Last known status: ${alert.lastKnownStatus}. Please call the agent or reassign.`,
      data: {
        visitId: alert.visitId,
        delegateId: alert.delegateId,
        escalationLevel: alert.escalationLevel,
        action: 'visit_management'
      }
    }

    // In a real implementation, this would integrate with a push notification service
    console.log('Push notification:', pushNotification)
  }

  // Send email notification
  private async sendEmailNotification(alert: LateVisitAlert): Promise<void> {
    const emailSubject = `Late Visit — Visit #${alert.visitId} — Agent ${alert.delegateName} — ${alert.delayMinutes} minutes late`
    const emailBody = `
      <h2>Late Visit Alert</h2>
      <p><strong>Visit ID:</strong> ${alert.visitId}</p>
      <p><strong>Agent:</strong> ${alert.delegateName} (${alert.delegatePhone})</p>
      <p><strong>Client:</strong> ${alert.customerName}</p>
      <p><strong>Address:</strong> ${alert.customerAddress}</p>
      <p><strong>Scheduled Time:</strong> ${new Date(alert.scheduledTime).toLocaleString()}</p>
      <p><strong>Current Time:</strong> ${new Date(alert.currentTime).toLocaleString()}</p>
      <p><strong>Delay:</strong> ${alert.delayMinutes} minutes</p>
      <p><strong>Last Known Status:</strong> ${alert.lastKnownStatus}</p>
      <p><strong>Last Known Location:</strong> ${alert.lastKnownLocation}</p>
      <p><strong>Recommended Action:</strong> ${this.getRecommendedAction(alert)}</p>
      <p><strong>Escalation Level:</strong> ${alert.escalationLevel.toUpperCase()}</p>
      
      <div style="margin-top: 20px;">
        <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Visit</a>
        <a href="tel:${alert.delegatePhone}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Call Agent</a>
      </div>
    `

    // In a real implementation, this would integrate with an email service
    console.log('Email notification:', { subject: emailSubject, body: emailBody })
  }

  // Escalate alert
  private async escalateAlert(alert: LateVisitAlert): Promise<void> {
    if (!this.config.autoEscalate) return

    const escalationAlert: Omit<SystemAlert, 'id' | 'timestamp' | 'resolved'> = {
      type: 'critical',
      category: 'visit',
      title: `ESCALATED: Late Visit - ${alert.visitId}`,
      message: `CRITICAL: Visit #${alert.visitId} has been escalated due to ${alert.delayMinutes} minute delay. Agent ${alert.delegateName} has not arrived at ${alert.customerName}. Immediate action required.`,
      priority: 'critical',
      driver: alert.delegateName,
      location: alert.customerName,
      metadata: {
        visitId: alert.visitId,
        delegateId: alert.delegateId,
        escalationLevel: alert.escalationLevel,
        escalatedAt: new Date().toISOString(),
        originalDelay: alert.delayMinutes
      }
    }

    await createAlert(escalationAlert)

    // Notify supervisors
    if (this.config.notifySupervisors) {
      await this.notifySupervisors(alert)
    }
  }

  // Notify supervisors
  private async notifySupervisors(alert: LateVisitAlert): Promise<void> {
    const supervisorNotification = {
      type: 'escalated_late_visit',
      title: `ESCALATED: Late Visit #${alert.visitId}`,
      message: `Visit #${alert.visitId} has been escalated. Agent ${alert.delegateName} is ${alert.delayMinutes} minutes late. Immediate supervisor intervention required.`,
      visitId: alert.visitId,
      delegateId: alert.delegateId,
      escalationLevel: alert.escalationLevel,
      timestamp: new Date().toISOString()
    }

    console.log('Supervisor notification:', supervisorNotification)
  }

  // Get monitoring status
  public getMonitoringStatus(): { isActive: boolean; config: VisitMonitoringConfig } {
    return {
      isActive: this.monitoringInterval !== null,
      config: this.config
    }
  }

  // Clear processed alerts (useful for testing)
  public clearProcessedAlerts(): void {
    this.processedAlerts.clear()
  }
}

// Export singleton instance
export const lateVisitMonitor = LateVisitMonitor.getInstance()

// Utility functions
export const startLateVisitMonitoring = () => lateVisitMonitor.startMonitoring()
export const stopLateVisitMonitoring = () => lateVisitMonitor.stopMonitoring()
export const updateMonitoringConfig = (config: Partial<VisitMonitoringConfig>) => 
  lateVisitMonitor.updateConfig(config)
export const getMonitoringStatus = () => lateVisitMonitor.getMonitoringStatus()
