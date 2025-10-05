// Representative Message Monitor - Monitors representative messages and creates notifications
import { supabase } from './supabase'

export interface RepresentativeMessage {
  id: string
  representative_id: string
  message_type: 'text' | 'image' | 'file' | 'location'
  content: string
  sender_type: 'representative' | 'admin' | 'system'
  is_read?: boolean
  metadata?: any
  created_at?: string
  updated_at?: string
}

export interface RepresentativeInfo {
  id: string
  name: string
  phone: string
  email?: string
  status?: string
}

export class RepresentativeMessageMonitor {
  private static instance: RepresentativeMessageMonitor
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastCheckTime: Date | null = null
  private processedMessages: Set<string> = new Set()

  constructor() {
    this.lastCheckTime = new Date()
  }

  public static getInstance(): RepresentativeMessageMonitor {
    if (!RepresentativeMessageMonitor.instance) {
      RepresentativeMessageMonitor.instance = new RepresentativeMessageMonitor()
    }
    return RepresentativeMessageMonitor.instance
  }

  // Start monitoring representative messages
  public startMonitoring(intervalMinutes: number = 1): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      await this.checkNewMessages()
    }, intervalMinutes * 60 * 1000)

    console.log(`Representative message monitoring started (every ${intervalMinutes} minutes)`)
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    console.log('Representative message monitoring stopped')
  }

  // Check for new representative messages
  public async checkNewMessages(): Promise<{ processed: number; errors: number }> {
    try {
      console.log('Checking for new representative messages...')
      
      // Get new messages from representatives since last check
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('sender_type', 'representative')
        .gte('created_at', this.lastCheckTime?.toISOString() || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching representative messages:', error)
        return { processed: 0, errors: 1 }
      }

      if (!messages || messages.length === 0) {
        console.log('No new representative messages found')
        this.lastCheckTime = new Date()
        return { processed: 0, errors: 0 }
      }

      console.log(`Found ${messages.length} new representative messages`)

      let processedCount = 0
      let errorCount = 0

      for (const message of messages) {
        try {
          // Skip if already processed
          if (this.processedMessages.has(message.id)) {
            continue
          }

          await this.createMessageNotification(message)
          this.processedMessages.add(message.id)
          processedCount++
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error)
          errorCount++
        }
      }

      this.lastCheckTime = new Date()
      console.log(`Representative message monitoring completed: ${processedCount} processed, ${errorCount} errors`)
      
      return { processed: processedCount, errors: errorCount }
    } catch (error) {
      console.error('Error in checkNewMessages:', error)
      return { processed: 0, errors: 1 }
    }
  }

  // Create notification for representative message
  private async createMessageNotification(message: RepresentativeMessage): Promise<void> {
    // Get representative information
    const representative = await this.getRepresentativeInfo(message.representative_id)
    if (!representative) {
      console.error(`Representative not found: ${message.representative_id}`)
      return
    }

    // Determine alert priority based on message content
    const priority = this.determineMessagePriority(message.content)
    const severity = this.determineMessageSeverity(message.content)

    const alertData = {
      alert_id: `MSG_${message.id}_${Date.now()}`,
      alert_type: 'user',
      category: this.mapSeverityToCategory(severity),
      severity: severity,
      priority: priority,
      title: this.generateMessageTitle(representative, message),
      message: this.generateMessageAlert(message.content),
      description: this.generateMessageDescription(representative, message),
      status: 'active',
      is_read: false,
      is_resolved: false,
      delegate_id: message.representative_id,
      delegate_name: representative.name,
      delegate_phone: representative.phone,
      delegate_email: representative.email,
      location: 'Chat Support',
      notify_admins: true,
      notify_supervisors: priority === 'high' || priority === 'critical',
      send_push_notification: true,
      send_email_notification: priority === 'critical',
      admin_notified: false,
      tags: this.generateMessageTags(message),
      source_system: 'chat_support',
      created_by: 'representative_message_monitor',
      metadata: {
        original_message_id: message.id,
        message_type: message.message_type,
        sender_type: message.sender_type,
        representative_status: representative.status,
        message_length: message.content.length,
        is_urgent: this.isUrgentMessage(message.content)
      }
    }

    const { error } = await supabase
      .from('unified_alerts_notifications')
      .insert(alertData)

    if (error) {
      throw new Error(`Failed to create message notification: ${error.message}`)
    }
  }

  // Get representative information
  private async getRepresentativeInfo(representativeId: string): Promise<RepresentativeInfo | null> {
    try {
      const { data, error } = await supabase
        .from('representatives')
        .select('id, name, phone, email, status')
        .eq('id', representativeId)
        .single()

      if (error) {
        console.error('Error fetching representative info:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getRepresentativeInfo:', error)
      return null
    }
  }

  // Determine message priority based on content
  private determineMessagePriority(content: string): string {
    const urgentKeywords = ['urgent', 'emergency', 'help', 'problem', 'issue', 'stuck', 'broken']
    const highKeywords = ['important', 'asap', 'quick', 'fast', 'delay', 'late']
    const criticalKeywords = ['critical', 'urgent', 'emergency', 'help', 'stuck', 'broken']

    const lowerContent = content.toLowerCase()

    if (criticalKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'critical'
    }
    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high'
    }
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium'
    }
    return 'low'
  }

  // Determine message severity based on content
  private determineMessageSeverity(content: string): string {
    const criticalKeywords = ['critical', 'emergency', 'stuck', 'broken', 'help']
    const highKeywords = ['urgent', 'problem', 'issue', 'delay', 'late']
    const mediumKeywords = ['important', 'question', 'info', 'update']

    const lowerContent = content.toLowerCase()

    if (criticalKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'critical'
    }
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high'
    }
    if (mediumKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium'
    }
    return 'low'
  }

  // Map severity to category
  private mapSeverityToCategory(severity: string): string {
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
        return 'info'
    }
  }

  // Generate message title
  private generateMessageTitle(representative: RepresentativeInfo, message: RepresentativeMessage): string {
    const priority = this.determineMessagePriority(message.content)
    const urgency = priority === 'critical' ? 'URGENT' : priority === 'high' ? 'IMPORTANT' : ''
    
    return `${urgency ? urgency + ': ' : ''}Message from ${representative.name}`
  }

  // Generate message alert
  private generateMessageAlert(content: string): string {
    const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content
    return `Representative sent a message: "${truncatedContent}"`
  }

  // Generate message description
  private generateMessageDescription(representative: RepresentativeInfo, message: RepresentativeMessage): string {
    const priority = this.determineMessagePriority(message.content)
    const timestamp = new Date(message.created_at || Date.now()).toLocaleString()
    
    return `Message from ${representative.name} (${representative.phone}) at ${timestamp}. ` +
           `Priority: ${priority.toUpperCase()}. ` +
           `Message type: ${message.message_type}. ` +
           `Content: ${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}`
  }

  // Generate message tags
  private generateMessageTags(message: RepresentativeMessage): string[] {
    const tags = ['representative', 'message', 'chat_support']
    
    const priority = this.determineMessagePriority(message.content)
    if (priority === 'critical') tags.push('urgent', 'critical')
    if (priority === 'high') tags.push('important', 'high_priority')
    if (priority === 'medium') tags.push('medium_priority')
    
    if (message.message_type === 'location') tags.push('location')
    if (message.message_type === 'file') tags.push('file_attachment')
    if (message.message_type === 'image') tags.push('image')
    
    return tags
  }

  // Check if message is urgent
  private isUrgentMessage(content: string): boolean {
    const urgentKeywords = ['urgent', 'emergency', 'help', 'stuck', 'broken', 'critical']
    const lowerContent = content.toLowerCase()
    return urgentKeywords.some(keyword => lowerContent.includes(keyword))
  }

  // Get monitoring status
  public getMonitoringStatus(): { isActive: boolean; lastCheck: Date | null } {
    return {
      isActive: this.monitoringInterval !== null,
      lastCheck: this.lastCheckTime
    }
  }

  // Force check all messages
  public async forceCheckAllMessages(): Promise<{ processed: number; errors: number }> {
    console.log('Force checking all representative messages...')
    this.lastCheckTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Check last 24 hours
    return await this.checkNewMessages()
  }

  // Clear processed messages (useful for testing)
  public clearProcessedMessages(): void {
    this.processedMessages.clear()
  }
}

// Export singleton instance
export const representativeMessageMonitor = RepresentativeMessageMonitor.getInstance()

// Utility functions
export const startRepresentativeMessageMonitoring = (intervalMinutes?: number) => 
  representativeMessageMonitor.startMonitoring(intervalMinutes)

export const stopRepresentativeMessageMonitoring = () => 
  representativeMessageMonitor.stopMonitoring()

export const checkRepresentativeMessages = () => 
  representativeMessageMonitor.checkNewMessages()

export const forceCheckAllRepresentativeMessages = () => 
  representativeMessageMonitor.forceCheckAllMessages()

export const getRepresentativeMessageMonitoringStatus = () => 
  representativeMessageMonitor.getMonitoringStatus()
