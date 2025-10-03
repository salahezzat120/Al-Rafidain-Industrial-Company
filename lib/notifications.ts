// Comprehensive Notifications and Alerts System
// Handles all types of alerts and notifications across the entire system

import { supabase } from './supabase'
import { safeLocalStorage, safeParseJSON } from './local-storage-utils'

export interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'delivery' | 'vehicle' | 'warehouse' | 'visit' | 'system' | 'maintenance' | 'stock' | 'user'
  title: string
  message: string
  timestamp: string
  driver?: string
  vehicle?: string
  location?: string
  resolved: boolean
  resolved_at?: string
  resolved_by?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  userId: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  alertTypes: {
    critical: boolean
    warning: boolean
    info: boolean
    success: boolean
  }
  categories: {
    delivery: boolean
    vehicle: boolean
    warehouse: boolean
    visit: boolean
    system: boolean
    maintenance: boolean
    stock: boolean
    user: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface AlertStats {
  total: number
  critical: number
  warning: number
  info: number
  resolved: number
  unresolved: number
  today: number
  thisWeek: number
}

// Alert Management Functions
export class NotificationManager {
  private static instance: NotificationManager
  private alerts: SystemAlert[] = []
  private settings: NotificationSettings[] = []

  constructor() {
    this.loadAlerts()
    this.loadSettings()
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  // Create a new alert
  public async createAlert(alert: Omit<SystemAlert, 'id' | 'timestamp' | 'resolved'>): Promise<SystemAlert> {
    const newAlert: SystemAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    this.alerts.unshift(newAlert)
    await this.saveAlerts()
    await this.notifyUsers(newAlert)
    
    return newAlert
  }

  // Get all alerts with filtering
  public getAlerts(filters?: {
    type?: string
    category?: string
    resolved?: boolean
    priority?: string
    limit?: number
  }): SystemAlert[] {
    let filteredAlerts = [...this.alerts]

    if (filters?.type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type)
    }

    if (filters?.category) {
      filteredAlerts = filteredAlerts.filter(alert => alert.category === filters.category)
    }

    if (filters?.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === filters.resolved)
    }

    if (filters?.priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === filters.priority)
    }

    if (filters?.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit)
    }

    return filteredAlerts
  }

  // Get alert statistics
  public getAlertStats(): AlertStats {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: this.alerts.length,
      critical: this.alerts.filter(a => a.type === 'critical').length,
      warning: this.alerts.filter(a => a.type === 'warning').length,
      info: this.alerts.filter(a => a.type === 'info').length,
      resolved: this.alerts.filter(a => a.resolved).length,
      unresolved: this.alerts.filter(a => !a.resolved).length,
      today: this.alerts.filter(a => new Date(a.timestamp) >= today).length,
      thisWeek: this.alerts.filter(a => new Date(a.timestamp) >= weekAgo).length
    }
  }

  // Resolve an alert
  public async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId)
    if (alertIndex === -1) return false

    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy
    }

    await this.saveAlerts()
    return true
  }

  // Delete an alert
  public async deleteAlert(alertId: string): Promise<boolean> {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId)
    if (alertIndex === -1) return false

    this.alerts.splice(alertIndex, 1)
    await this.saveAlerts()
    return true
  }

  // System Integration Functions
  public async checkVehicleAlerts(): Promise<void> {
    // Check for low fuel alerts
    const vehicles = await this.getVehicleData()
    for (const vehicle of vehicles) {
      if (vehicle.fuelLevel < 20 && !this.hasActiveAlert('vehicle', vehicle.id, 'low_fuel')) {
        await this.createAlert({
          type: 'critical',
          category: 'vehicle',
          title: `Vehicle ${vehicle.id} Low Fuel`,
          message: `Vehicle ${vehicle.id} has only ${vehicle.fuelLevel}% fuel remaining`,
          driver: vehicle.driver,
          vehicle: vehicle.id,
          priority: 'critical',
          metadata: { fuelLevel: vehicle.fuelLevel }
        })
      }
    }
  }

  public async checkDeliveryAlerts(): Promise<void> {
    // Check for delayed deliveries
    const deliveries = await this.getDeliveryData()
    for (const delivery of deliveries) {
      if (delivery.isDelayed && !this.hasActiveAlert('delivery', delivery.id, 'delayed')) {
        await this.createAlert({
          type: 'warning',
          category: 'delivery',
          title: 'Delivery Delayed',
          message: `Delivery ${delivery.id} is running ${delivery.delayMinutes} minutes behind schedule`,
          driver: delivery.driver,
          priority: 'high',
          metadata: { delayMinutes: delivery.delayMinutes }
        })
      }
    }
  }

  public async checkWarehouseAlerts(): Promise<void> {
    // Check for low stock alerts
    const stockItems = await this.getStockData()
    for (const item of stockItems) {
      if (item.quantity < item.minThreshold && !this.hasActiveAlert('warehouse', item.id, 'low_stock')) {
        await this.createAlert({
          type: 'warning',
          category: 'warehouse',
          title: `Low Stock Alert - ${item.name}`,
          message: `${item.name} is running low (${item.quantity} remaining, minimum: ${item.minThreshold})`,
          priority: 'medium',
          metadata: { 
            itemId: item.id, 
            quantity: item.quantity, 
            minThreshold: item.minThreshold 
          }
        })
      }
    }
  }

  public async checkVisitAlerts(): Promise<void> {
    // Check for late visits
    const visits = await this.getVisitData()
    for (const visit of visits) {
      if (visit.isLate && !this.hasActiveAlert('visit', visit.id, 'late_arrival')) {
        await this.createAlert({
          type: 'warning',
          category: 'visit',
          title: 'Late Visit Alert',
          message: `Delegate ${visit.delegateName} is late for visit at ${visit.customerName}`,
          driver: visit.delegateName,
          location: visit.customerName,
          priority: 'high',
          metadata: { 
            visitId: visit.id, 
            delegateId: visit.delegateId,
            scheduledTime: visit.scheduledTime,
            currentTime: new Date().toISOString()
          }
        })
      }
    }
  }

  // Notification Settings
  public async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    const userSettingsIndex = this.settings.findIndex(s => s.userId === userId)
    
    if (userSettingsIndex === -1) {
      this.settings.push({
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        alertTypes: {
          critical: true,
          warning: true,
          info: false,
          success: false
        },
        categories: {
          delivery: true,
          vehicle: true,
          warehouse: true,
          visit: true,
          system: true,
          maintenance: true,
          stock: true,
          user: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        ...settings
      })
    } else {
      this.settings[userSettingsIndex] = {
        ...this.settings[userSettingsIndex],
        ...settings
      }
    }

    await this.saveSettings()
  }

  public getNotificationSettings(userId: string): NotificationSettings | null {
    return this.settings.find(s => s.userId === userId) || null
  }

  // Real-time monitoring
  public startMonitoring(): void {
    // Check for alerts every 30 seconds
    setInterval(async () => {
      await this.checkVehicleAlerts()
      await this.checkDeliveryAlerts()
      await this.checkWarehouseAlerts()
      await this.checkVisitAlerts()
    }, 30000)
  }

  // Helper functions
  private async hasActiveAlert(category: string, entityId: string, alertType: string): Promise<boolean> {
    return this.alerts.some(alert => 
      alert.category === category && 
      alert.metadata?.entityId === entityId && 
      alert.metadata?.alertType === alertType &&
      !alert.resolved
    )
  }

  private async notifyUsers(alert: SystemAlert): Promise<void> {
    // In a real implementation, this would send notifications via email, SMS, push notifications
    console.log('Notification sent:', alert)
  }

  private async loadAlerts(): Promise<void> {
    try {
      const saved = safeLocalStorage.getItem('system-alerts')
      this.alerts = safeParseJSON(saved, [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  private async saveAlerts(): Promise<void> {
    try {
      safeLocalStorage.setItem('system-alerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('Error saving alerts:', error)
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const saved = safeLocalStorage.getItem('notification-settings')
      this.settings = safeParseJSON(saved, {
        userId: '',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        alertTypes: {
          critical: true,
          warning: true,
          info: true,
          success: true
        },
        categories: {
          delivery: true,
          vehicle: true,
          warehouse: true,
          visit: true,
          system: true,
          maintenance: true,
          stock: true,
          user: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      safeLocalStorage.setItem('notification-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  // Mock data functions (replace with real API calls)
  private async getVehicleData(): Promise<any[]> {
    return [
      { id: 'ABC-123', fuelLevel: 15, driver: 'John Smith' },
      { id: 'DEF-456', fuelLevel: 45, driver: 'Sarah Wilson' },
      { id: 'GHI-789', fuelLevel: 8, driver: 'Mike Johnson' }
    ]
  }

  private async getDeliveryData(): Promise<any[]> {
    return [
      { id: 'D001', isDelayed: true, delayMinutes: 20, driver: 'Sarah Wilson' },
      { id: 'D002', isDelayed: false, delayMinutes: 0, driver: 'Emma Davis' }
    ]
  }

  private async getStockData(): Promise<any[]> {
    return [
      { id: 'ITEM001', name: 'Product A', quantity: 5, minThreshold: 10 },
      { id: 'ITEM002', name: 'Product B', quantity: 15, minThreshold: 20 }
    ]
  }

  private async getVisitData(): Promise<any[]> {
    return [
      { 
        id: 'V001', 
        isLate: true, 
        delegateName: 'Sarah Wilson', 
        delegateId: 'DEL001',
        customerName: 'XYZ Industries',
        scheduledTime: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()

// Utility functions for easy access
export const createAlert = (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'resolved'>) => 
  notificationManager.createAlert(alert)

export const getAlerts = (filters?: any) => 
  notificationManager.getAlerts(filters)

export const getAlertStats = () => 
  notificationManager.getAlertStats()

export const resolveAlert = (alertId: string, resolvedBy: string) => 
  notificationManager.resolveAlert(alertId, resolvedBy)

export const deleteAlert = (alertId: string) => 
  notificationManager.deleteAlert(alertId)

export const updateNotificationSettings = (userId: string, settings: Partial<NotificationSettings>) => 
  notificationManager.updateNotificationSettings(userId, settings)

export const getNotificationSettings = (userId: string) => 
  notificationManager.getNotificationSettings(userId)

export const startAlertMonitoring = () => 
  notificationManager.startMonitoring()
