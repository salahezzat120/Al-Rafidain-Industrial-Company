"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, AlertTriangle, CheckCircle, Clock, Fuel, MapPin, Settings, X, User, MessageSquare, RefreshCw, Loader2, TrendingUp, Truck, Package, Wrench } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { VisitAlert } from "@/types/visits"
import { getUnreadAlerts, markAlertAsRead, checkLateVisits, checkExceededTimeVisits } from "@/lib/visits"
import { 
  notificationManager, 
  createAlert, 
  getAlerts, 
  getAlertStats, 
  resolveAlert, 
  deleteAlert,
  startAlertMonitoring,
  type SystemAlert,
  type AlertStats,
  updateNotificationSettings,
  getNotificationSettings,
  type NotificationSettings
} from "@/lib/notifications"
import { supabase } from "@/lib/supabase"
import { 
  lateVisitMonitor,
  startLateVisitMonitoring,
  stopLateVisitMonitoring,
  updateMonitoringConfig,
  getMonitoringStatus,
  type LateVisitAlert,
  type VisitMonitoringConfig
} from "@/lib/late-visit-monitor"
import { initializeAlertsDatabase, createSampleAlerts, checkDatabaseConnection } from "@/lib/init-alerts-database"
import { 
  visitAlertsSync,
  startVisitAlertsSync,
  stopVisitAlertsSync,
  syncVisitAlerts,
  forceSyncAllVisitAlerts,
  getVisitAlertsSyncStatus
} from "@/lib/visit-alerts-sync"
import { 
  representativeMessageMonitor,
  startRepresentativeMessageMonitoring,
  stopRepresentativeMessageMonitoring,
  checkRepresentativeMessages,
  forceCheckAllRepresentativeMessages,
  getRepresentativeMessageMonitoringStatus
} from "@/lib/representative-message-monitor"

// Mock alerts data
const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Vehicle ABC-123 Low Fuel",
    message: "Vehicle ABC-123 has only 15% fuel remaining",
    timestamp: "2 minutes ago",
    driver: "John Smith",
    resolved: false,
    icon: Fuel,
  },
  {
    id: 2,
    type: "warning",
    title: "Delivery Delayed",
    message: "Delivery D001 is running 20 minutes behind schedule",
    timestamp: "5 minutes ago",
    driver: "Sarah Wilson",
    resolved: false,
    icon: Clock,
  },
  {
    id: 3,
    type: "info",
    title: "Route Optimization Available",
    message: "New optimized route available for driver Mike Johnson",
    timestamp: "10 minutes ago",
    driver: "Mike Johnson",
    resolved: false,
    icon: MapPin,
  },
  {
    id: 4,
    type: "success",
    title: "Delivery Completed",
    message: "Delivery D002 completed successfully",
    timestamp: "15 minutes ago",
    driver: "Emma Davis",
    resolved: true,
    icon: CheckCircle,
  },
]

const getAlertColor = (type: string) => {
  switch (type) {
    case "critical":
      return "border-red-200 bg-red-50"
    case "warning":
      return "border-yellow-200 bg-yellow-50"
    case "info":
      return "border-blue-200 bg-blue-50"
    case "success":
      return "border-green-200 bg-green-50"
    default:
      return "border-gray-200 bg-gray-50"
  }
}

const getBadgeColor = (type: string) => {
  switch (type) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "info":
      return "bg-blue-100 text-blue-800"
    case "success":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function AlertsTab() {
  const { t } = useLanguage()
  
  // State management
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [visitAlerts, setVisitAlerts] = useState<VisitAlert[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    unresolved: 0,
    today: 0,
    thisWeek: 0
  })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Late visit monitoring state
  const [monitoringStatus, setMonitoringStatus] = useState<{ isActive: boolean; config: VisitMonitoringConfig } | null>(null)
  const [monitoringConfig, setMonitoringConfig] = useState<VisitMonitoringConfig>({
    gracePeriodMinutes: 10,
    escalationThresholdMinutes: 30,
    checkIntervalMinutes: 2,
    autoEscalate: true,
    notifyAdmins: true,
    notifySupervisors: true,
    sendPushNotifications: true,
    sendEmailNotifications: true
  })

  // Visit alerts sync state
  const [visitAlertsSyncStatus, setVisitAlertsSyncStatus] = useState<{ isActive: boolean; lastSync: Date | null } | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

  // Representative message monitoring state
  const [representativeMessageStatus, setRepresentativeMessageStatus] = useState<{ isActive: boolean; lastCheck: Date | null } | null>(null)
  const [messageSyncInProgress, setMessageSyncInProgress] = useState(false)

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    userId: 'admin',
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
    }
  })

  useEffect(() => {
    const initializeDatabase = async () => {
      console.log('Initializing alerts database...')
      
      // Check database connection
      const isConnected = await checkDatabaseConnection()
      if (!isConnected) {
        console.log('Database not available, using fallback data')
        loadAllData()
        return
      }
      
      // Initialize database
      const isInitialized = await initializeAlertsDatabase()
      if (!isInitialized) {
        console.log('Database initialization failed, using fallback data')
        loadAllData()
        return
      }
      
      // Check if we have any alerts, if not create sample data
      const { data: existingAlerts } = await supabase
        .from('unified_alerts_notifications')
        .select('count')
        .limit(1)
      
      if (!existingAlerts || existingAlerts.length === 0) {
        console.log('No alerts found, creating sample data...')
        await createSampleAlerts()
      }
      
      // Load data from database
      loadAllData()
    }
    
    initializeDatabase()
    startMonitoring()
    loadMonitoringStatus()
    loadVisitAlertsSyncStatus()
    loadRepresentativeMessageStatus()
    
    // Start visit alerts sync automatically
    handleStartVisitAlertsSync()
    
    // Start representative message monitoring automatically
    handleStartRepresentativeMessageMonitoring()
    
    // Load notification settings safely
    try {
      const settings = getNotificationSettings('admin')
      if (settings) {
        setNotificationSettings(settings)
      }
    } catch (error) {
      console.log('Notification settings not available. Using defaults.')
    }
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      console.log('Loading all alerts data...')
      await Promise.all([
        loadSystemAlerts(),
        loadVisitAlerts(),
        loadAlertStats()
      ])
      console.log('All alerts data loaded successfully')
    } catch (error) {
      console.error('Error loading alerts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMonitoringStatus = () => {
    try {
      const status = getMonitoringStatus()
      setMonitoringStatus(status)
      if (status) {
        setMonitoringConfig(status.config)
      }
    } catch (error) {
      console.error('Error loading monitoring status:', error)
    }
  }

  const loadVisitAlertsSyncStatus = () => {
    try {
      const status = getVisitAlertsSyncStatus()
      setVisitAlertsSyncStatus(status)
    } catch (error) {
      console.error('Error loading visit alerts sync status:', error)
    }
  }

  const handleStartVisitAlertsSync = () => {
    try {
      startVisitAlertsSync(2) // Sync every 2 minutes
      loadVisitAlertsSyncStatus()
    } catch (error) {
      console.error('Error starting visit alerts sync:', error)
    }
  }

  const handleStopVisitAlertsSync = () => {
    try {
      stopVisitAlertsSync()
      loadVisitAlertsSyncStatus()
    } catch (error) {
      console.error('Error stopping visit alerts sync:', error)
    }
  }

  const handleSyncVisitAlerts = async () => {
    setSyncInProgress(true)
    try {
      console.log('Manually syncing visit alerts...')
      const result = await syncVisitAlerts()
      console.log(`Visit alerts sync result: ${result.synced} synced, ${result.errors} errors`)
      
      // Reload data after sync
      await loadAllData()
      loadVisitAlertsSyncStatus()
    } catch (error) {
      console.error('Error syncing visit alerts:', error)
    } finally {
      setSyncInProgress(false)
    }
  }

  const handleForceSyncAllVisitAlerts = async () => {
    setSyncInProgress(true)
    try {
      console.log('Force syncing all visit alerts...')
      const result = await forceSyncAllVisitAlerts()
      console.log(`Force sync result: ${result.synced} synced, ${result.errors} errors`)
      
      // Reload data after sync
      await loadAllData()
      loadVisitAlertsSyncStatus()
    } catch (error) {
      console.error('Error force syncing visit alerts:', error)
    } finally {
      setSyncInProgress(false)
    }
  }

  const loadRepresentativeMessageStatus = () => {
    try {
      const status = getRepresentativeMessageMonitoringStatus()
      setRepresentativeMessageStatus(status)
    } catch (error) {
      console.error('Error loading representative message status:', error)
    }
  }

  const handleStartRepresentativeMessageMonitoring = () => {
    try {
      startRepresentativeMessageMonitoring(1) // Monitor every 1 minute
      loadRepresentativeMessageStatus()
    } catch (error) {
      console.error('Error starting representative message monitoring:', error)
    }
  }

  const handleStopRepresentativeMessageMonitoring = () => {
    try {
      stopRepresentativeMessageMonitoring()
      loadRepresentativeMessageStatus()
    } catch (error) {
      console.error('Error stopping representative message monitoring:', error)
    }
  }

  const handleCheckRepresentativeMessages = async () => {
    setMessageSyncInProgress(true)
    try {
      console.log('Checking representative messages...')
      const result = await checkRepresentativeMessages()
      console.log(`Representative message check result: ${result.processed} processed, ${result.errors} errors`)
      
      // Reload data after check
      await loadAllData()
      loadRepresentativeMessageStatus()
    } catch (error) {
      console.error('Error checking representative messages:', error)
    } finally {
      setMessageSyncInProgress(false)
    }
  }

  const handleForceCheckAllRepresentativeMessages = async () => {
    setMessageSyncInProgress(true)
    try {
      console.log('Force checking all representative messages...')
      const result = await forceCheckAllRepresentativeMessages()
      console.log(`Force check result: ${result.processed} processed, ${result.errors} errors`)
      
      // Reload data after check
      await loadAllData()
      loadRepresentativeMessageStatus()
    } catch (error) {
      console.error('Error force checking representative messages:', error)
    } finally {
      setMessageSyncInProgress(false)
    }
  }

  const loadSystemAlerts = async () => {
    try {
      console.log('Loading system alerts from database...')
      
      const { data: alerts, error } = await supabase
        .from('unified_alerts_notifications')
        .select('*')
        .eq('status', 'active')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error loading system alerts:', error)
        console.log('Falling back to mock data...')
        
        // Fallback to mock data if database fails
        const mockAlerts: SystemAlert[] = [
          {
            id: 'mock-1',
            type: 'warning',
            category: 'system',
            title: 'Test Alert',
            message: 'This is a test alert to verify the system is working',
            timestamp: new Date().toISOString(),
            resolved: false,
            priority: 'medium',
            metadata: {}
          }
        ]
        setSystemAlerts(mockAlerts)
        return
      }

      console.log('Database alerts loaded:', alerts?.length || 0)

      // Transform database alerts to SystemAlert format
      const transformedAlerts: SystemAlert[] = alerts?.map(alert => ({
        id: alert.id,
        type: alert.category as 'critical' | 'warning' | 'info' | 'success',
        category: alert.alert_type as 'delivery' | 'vehicle' | 'warehouse' | 'visit' | 'system' | 'maintenance' | 'stock' | 'user',
        title: alert.title,
        message: alert.message,
        timestamp: alert.created_at,
        driver: alert.delegate_name || alert.driver_name,
        vehicle: alert.vehicle_plate,
        location: alert.location,
        resolved: alert.is_resolved,
        resolved_at: alert.resolved_at,
        resolved_by: alert.resolved_by,
        priority: alert.priority as 'low' | 'medium' | 'high' | 'critical',
        metadata: alert.metadata || {}
      })) || []

      console.log('Transformed alerts:', transformedAlerts.length)
      setSystemAlerts(transformedAlerts)
    } catch (error) {
      console.error('Error loading system alerts:', error)
      console.log('Using fallback mock data...')
      
      // Fallback mock data
      const mockAlerts: SystemAlert[] = [
        {
          id: 'fallback-1',
          type: 'warning',
          category: 'system',
          title: 'Fallback Alert',
          message: 'Database connection failed, using mock data',
          timestamp: new Date().toISOString(),
          resolved: false,
          priority: 'medium',
          metadata: {}
        }
      ]
      setSystemAlerts(mockAlerts)
    }
  }

  const loadVisitAlerts = async () => {
    try {
      console.log('Loading visit alerts from database...')
      
      const { data: alerts, error } = await supabase
        .from('unified_alerts_notifications')
        .select('*')
        .in('alert_type', ['visit', 'late_visit'])
        .eq('status', 'active')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error loading visit alerts:', error)
        console.log('Falling back to mock visit alerts...')
        
        // Fallback to mock data
        const mockVisitAlerts: VisitAlert[] = [
          {
            id: "mock-visit-1",
            visit_id: "V123",
            delegate_id: "REP-001",
            alert_type: "late_arrival",
            severity: "high",
            message: "Delegate Ahmed Ibrahim is late for visit at Nile Supplies",
            is_read: false,
            created_at: new Date().toISOString(),
            admin_notified: false
          }
        ]
        setVisitAlerts(mockVisitAlerts)
        return
      }

      console.log('Database visit alerts loaded:', alerts?.length || 0)

      // Transform database alerts to VisitAlert format
      const transformedAlerts: VisitAlert[] = alerts?.map(alert => ({
        id: alert.id,
        visit_id: alert.visit_id || '',
        delegate_id: alert.delegate_id || '',
        alert_type: alert.alert_type === 'late_visit' ? 'late_arrival' : 'visit_update',
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        message: alert.message,
        is_read: alert.is_read,
        created_at: alert.created_at,
        admin_notified: alert.admin_notified
      })) || []

      console.log('Transformed visit alerts:', transformedAlerts.length)
      setVisitAlerts(transformedAlerts)
    } catch (error) {
      console.error('Error loading visit alerts:', error)
      console.log('Using fallback mock visit alerts...')
      
      // Fallback mock data
      const mockVisitAlerts: VisitAlert[] = [
        {
          id: "fallback-visit-1",
          visit_id: "V999",
          delegate_id: "REP-999",
          alert_type: "late_arrival",
          severity: "high",
          message: "Database connection failed, using mock visit alert",
          is_read: false,
          created_at: new Date().toISOString(),
          admin_notified: false
        }
      ]
      setVisitAlerts(mockVisitAlerts)
    }
  }

  const loadAlertStats = async () => {
    try {
      // Get alert statistics from database
      const { data: stats, error } = await supabase
        .rpc('get_alert_statistics')

      if (error) {
        console.error('Error loading alert stats:', error)
        // Fallback to manual calculation
        const { data: alerts, error: alertsError } = await supabase
          .from('unified_alerts_notifications')
          .select('severity, status, created_at')

        if (alertsError) {
          console.error('Error loading alerts for stats:', alertsError)
          setAlertStats({
            total: 0,
            critical: 0,
            warning: 0,
            info: 0,
            resolved: 0,
            unresolved: 0,
            today: 0,
            thisWeek: 0
          })
          return
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        const calculatedStats = {
          total: alerts?.length || 0,
          critical: alerts?.filter(a => a.severity === 'critical').length || 0,
          warning: alerts?.filter(a => a.severity === 'high').length || 0,
          info: alerts?.filter(a => a.severity === 'medium').length || 0,
          resolved: alerts?.filter(a => a.status === 'resolved').length || 0,
          unresolved: alerts?.filter(a => a.status === 'active').length || 0,
          today: alerts?.filter(a => new Date(a.created_at) >= today).length || 0,
          thisWeek: alerts?.filter(a => new Date(a.created_at) >= weekAgo).length || 0
        }

        setAlertStats(calculatedStats)
        return
      }

      // Use database function results
      if (stats && stats.length > 0) {
        const stat = stats[0]
        setAlertStats({
          total: Number(stat.total_alerts) || 0,
          critical: Number(stat.critical_alerts) || 0,
          warning: Number(stat.warning_alerts) || 0,
          info: Number(stat.info_alerts) || 0,
          resolved: Number(stat.resolved_alerts) || 0,
          unresolved: Number(stat.active_alerts) || 0,
          today: Number(stat.today_alerts) || 0,
          thisWeek: Number(stat.this_week_alerts) || 0
        })
      }
    } catch (error) {
      console.error('Error loading alert stats:', error)
      setAlertStats({
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        resolved: 0,
        unresolved: 0,
        today: 0,
        thisWeek: 0
      })
    }
  }

  const startMonitoring = () => {
    // Start the notification manager monitoring
    try {
      startAlertMonitoring()
    } catch (error) {
      console.log('Notification manager not available. Using basic monitoring.')
    }
    
    // Check for late visits and exceeded time visits every minute
    const interval = setInterval(async () => {
      try {
        await checkLateVisits()
        await checkExceededTimeVisits()
        await loadAllData()
      } catch (error) {
        console.log('Monitoring error (expected if tables don\'t exist):', error.message)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadAllData()
      loadMonitoringStatus()
    } catch (error) {
      console.error('Error refreshing alerts:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleStartMonitoring = () => {
    try {
      startLateVisitMonitoring()
      loadMonitoringStatus()
    } catch (error) {
      console.error('Error starting monitoring:', error)
    }
  }

  const handleStopMonitoring = () => {
    try {
      stopLateVisitMonitoring()
      loadMonitoringStatus()
    } catch (error) {
      console.error('Error stopping monitoring:', error)
    }
  }

  const handleUpdateMonitoringConfig = (newConfig: Partial<VisitMonitoringConfig>) => {
    try {
      const updatedConfig = { ...monitoringConfig, ...newConfig }
      setMonitoringConfig(updatedConfig)
      updateMonitoringConfig(newConfig)
      loadMonitoringStatus()
    } catch (error) {
      console.error('Error updating monitoring config:', error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('unified_alerts_notifications')
        .update({
          status: 'resolved',
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) {
        console.error('Error resolving alert:', error)
        return
      }

      await loadAllData()
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('unified_alerts_notifications')
        .delete()
        .eq('id', alertId)

      if (error) {
        console.error('Error deleting alert:', error)
        return
      }

      await loadAllData()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const handleCreateTestAlert = async () => {
    try {
      const { error } = await supabase
        .from('unified_alerts_notifications')
        .insert({
          alert_id: `TEST_${Date.now()}`,
          alert_type: 'system',
          category: 'warning',
          severity: 'medium',
          priority: 'medium',
          title: 'Test Alert',
          message: 'This is a test alert to verify the system is working',
          description: 'System test alert for verification purposes',
          status: 'active',
          is_read: false,
          is_resolved: false,
          notify_admins: true,
          send_push_notification: true,
          tags: ['test', 'system'],
          source_system: 'alert_system',
          created_by: 'admin'
        })

      if (error) {
        console.error('Error creating test alert:', error)
        return
      }

      await loadAllData()
    } catch (error) {
      console.error('Error creating test alert:', error)
      const mockAlert = {
        id: `test_${Date.now()}`,
        type: 'warning' as const,
        category: 'system' as const,
        title: 'Test Alert',
        message: 'This is a test alert to verify the system is working',
        timestamp: new Date().toISOString(),
        resolved: false,
        priority: 'medium' as const
      }
      setSystemAlerts(prev => [mockAlert, ...prev])
    }
  }

  const handleNotificationSettingsChange = async (key: string, value: any) => {
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)
    await updateNotificationSettings('admin', newSettings)
  }

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
      setVisitAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getVisitAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "late_arrival":
        return Clock
      case "time_exceeded":
        return AlertTriangle
      case "no_show":
        return User
      case "early_completion":
        return CheckCircle
      default:
        return Bell
    }
  }

  const getVisitAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50"
      case "high":
        return "border-orange-200 bg-orange-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getVisitAlertBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.resolved)
  const resolvedAlerts = alerts.filter((alert) => alert.resolved)
  const unreadVisitAlerts = visitAlerts.filter(alert => !alert.is_read)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("alertsNotifications")}</h2>
          <p className="text-gray-600">{t("monitorSystemAlerts")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive">
            {alertStats.unresolved + unreadVisitAlerts.length} {t("active")}
          </Badge>
          {unreadVisitAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {unreadVisitAlerts.length} Visit Alerts
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateTestAlert}
          >
            Test Alert
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {t("settings")}
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("criticalAlerts")}</p>
                <p className="text-2xl font-bold text-gray-900">{alertStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("warnings")}</p>
                <p className="text-2xl font-bold text-gray-900">{alertStats.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("infoAlerts")}</p>
                <p className="text-2xl font-bold text-gray-900">{alertStats.info}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("resolvedToday")}</p>
                <p className="text-2xl font-bold text-gray-900">{alertStats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            {t("activeAlerts")} ({activeAlerts.length + unreadVisitAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="visit-alerts">
            Visit Alerts ({unreadVisitAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="late-visit-monitoring">
            Late Visit Monitoring
          </TabsTrigger>
          <TabsTrigger value="visit-alerts-sync">
            Visit Alerts Sync
          </TabsTrigger>
          <TabsTrigger value="representative-messages">
            Representative Messages
          </TabsTrigger>
          <TabsTrigger value="resolved">{t("resolved")}</TabsTrigger>
          <TabsTrigger value="settings">{t("notificationSettings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {/* System Alerts */}
            {systemAlerts.map((alert) => {
              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case 'delivery': return Truck
                  case 'vehicle': return Fuel
                  case 'warehouse': return Package
                  case 'visit': return User
                  case 'system': return Settings
                  case 'maintenance': return Wrench
                  case 'stock': return TrendingUp
                  default: return Bell
                }
              }
              const Icon = getCategoryIcon(alert.category)
              return (
                <Card key={alert.id} className={getAlertColor(alert.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Icon className="h-6 w-6 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={getBadgeColor(alert.type)}>{alert.type}</Badge>
                            <Badge variant="outline">{alert.category}</Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.driver && (
                              <>
                                <span>•</span>
                                <span>Driver: {alert.driver}</span>
                              </>
                            )}
                            {alert.vehicle && (
                              <>
                                <span>•</span>
                                <span>Vehicle: {alert.vehicle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {/* Mock Alerts */}
            {activeAlerts.map((alert) => {
              const Icon = alert.icon
              return (
                <Card key={alert.id} className={getAlertColor(alert.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Icon className="h-6 w-6 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={getBadgeColor(alert.type)}>{alert.type}</Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{alert.timestamp}</span>
                            {alert.driver && (
                              <>
                                <span>•</span>
                                <span>
                                  {t("driver")}: {alert.driver}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          {t("resolve")}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="visit-alerts" className="space-y-4">
          <div className="space-y-4">
            {unreadVisitAlerts.map((alert) => {
              const Icon = getVisitAlertIcon(alert.alert_type)
              return (
                <Card key={alert.id} className={getVisitAlertColor(alert.severity)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Icon className="h-6 w-6 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              {alert.alert_type === 'late_arrival' ? 'Late Visit Alert' :
                               alert.alert_type === 'time_exceeded' ? 'Time Exceeded Alert' :
                               alert.alert_type === 'no_show' ? 'No Show Alert' :
                               'Early Completion Alert'}
                            </h3>
                            <Badge className={getVisitAlertBadgeColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(alert.created_at).toLocaleString()}</span>
                            <span>•</span>
                            <span>Visit ID: {alert.visit_id}</span>
                            <span>•</span>
                            <span>Delegate ID: {alert.delegate_id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAlertAsRead(alert.id)}
                        >
                          Mark as Read
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {unreadVisitAlerts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visit Alerts</h3>
                  <p className="text-gray-600">All visits are on schedule and within time limits.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="representative-messages" className="space-y-4">
          <div className="space-y-6">
            {/* Representative Message Monitoring Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Representative Message Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor messages from representatives and create notifications automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Monitoring Status</Label>
                    <p className="text-sm text-gray-500">
                      {representativeMessageStatus?.isActive ? 'Active' : 'Inactive'}
                    </p>
                    {representativeMessageStatus?.lastCheck && (
                      <p className="text-xs text-gray-400">
                        Last check: {new Date(representativeMessageStatus.lastCheck).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {representativeMessageStatus?.isActive ? (
                      <Button 
                        variant="destructive" 
                        onClick={handleStopRepresentativeMessageMonitoring}
                        size="sm"
                      >
                        Stop Monitoring
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartRepresentativeMessageMonitoring}
                        size="sm"
                      >
                        Start Monitoring
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      Auto Monitor
                    </div>
                    <div className="text-sm text-gray-500">Every 1 minute</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {representativeMessageStatus?.isActive ? 'Running' : 'Stopped'}
                    </div>
                    <div className="text-sm text-gray-500">Monitoring Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Message Check Controls Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manual Message Check
                </CardTitle>
                <CardDescription>
                  Manually check for new representative messages and create notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleCheckRepresentativeMessages}
                    disabled={messageSyncInProgress}
                    variant="outline"
                  >
                    {messageSyncInProgress ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Messages
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleForceCheckAllRepresentativeMessages}
                    disabled={messageSyncInProgress}
                    variant="outline"
                  >
                    {messageSyncInProgress ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Force Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Force Check All
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleRefresh}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How Representative Message Monitoring Works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Monitors messages from representatives in chat support</li>
                    <li>• Automatically creates notifications for new messages</li>
                    <li>• Analyzes message content for priority and urgency</li>
                    <li>• Maps message types to appropriate alert categories</li>
                    <li>• Runs every 1 minute automatically</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Message Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Message Statistics
                </CardTitle>
                <CardDescription>
                  View representative message monitoring statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {systemAlerts.filter(a => a.category === 'user' && a.metadata?.source_system === 'chat_support').length}
                    </div>
                    <div className="text-sm text-gray-500">Message Notifications</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemAlerts.filter(a => a.metadata?.is_urgent === true).length}
                    </div>
                    <div className="text-sm text-gray-500">Urgent Messages</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {representativeMessageStatus?.isActive ? '1 min' : 'Off'}
                    </div>
                    <div className="text-sm text-gray-500">Check Interval</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Message Monitoring Benefits</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Real-time notification of representative messages</li>
                    <li>• Automatic priority detection based on content</li>
                    <li>• Centralized alert management for all communications</li>
                    <li>• Escalation for urgent messages</li>
                    <li>• Historical tracking of representative communications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <div className="space-y-4">
            {resolvedAlerts.map((alert) => {
              const Icon = alert.icon
              return (
                <Card key={alert.id} className="border-gray-200 bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Icon className="h-6 w-6 mt-1 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-700">{alert.title}</h3>
                          <Badge variant="outline">{t("resolved")}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{alert.timestamp}</span>
                          {alert.driver && (
                            <>
                              <span>•</span>
                              <span>
                                {t("driver")}: {alert.driver}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notificationPreferences")}</CardTitle>
              <CardDescription>{t("configureAlertsReceive")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowFuel" className="text-base font-medium">
                      {t("lowFuelAlerts")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("lowFuelDescription")}</p>
                  </div>
                  <Switch
                    id="lowFuel"
                    checked={notificationSettings.categories.vehicle}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, vehicle: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="delayedDeliveries" className="text-base font-medium">
                      {t("delayedDeliveries")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("delayedDeliveriesDescription")}</p>
                  </div>
                  <Switch
                    id="delayedDeliveries"
                    checked={notificationSettings.categories.delivery}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, delivery: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vehicleMaintenance" className="text-base font-medium">
                      {t("vehicleMaintenance")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("maintenanceReminders")}</p>
                  </div>
                  <Switch
                    id="vehicleMaintenance"
                    checked={notificationSettings.categories.maintenance}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, maintenance: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="routeOptimization" className="text-base font-medium">
                      {t("routeOptimization")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("routeOptimizationDescription")}</p>
                  </div>
                  <Switch
                    id="routeOptimization"
                    checked={notificationSettings.categories.delivery}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, delivery: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="customerFeedback" className="text-base font-medium">
                      {t("customerFeedback")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("customerFeedbackDescription")}</p>
                  </div>
                  <Switch
                    id="customerFeedback"
                    checked={notificationSettings.categories.user}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, user: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemUpdates" className="text-base font-medium">
                      {t("systemUpdates")}
                    </Label>
                    <p className="text-sm text-gray-500">{t("systemUpdatesDescription")}</p>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={notificationSettings.categories.system}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, system: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lateVisits" className="text-base font-medium">
                      Late Visit Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Get notified when delegates are late to visits</p>
                  </div>
                  <Switch
                    id="lateVisits"
                    checked={notificationSettings.categories.visit}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, visit: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="timeExceeded" className="text-base font-medium">
                      Time Exceeded Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Get notified when delegates exceed allowed visit time</p>
                  </div>
                  <Switch
                    id="timeExceeded"
                    checked={notificationSettings.categories.visit}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, visit: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="internalMessages" className="text-base font-medium">
                      Internal Message Notifications
                    </Label>
                    <p className="text-sm text-gray-500">Get notified about new internal messages</p>
                  </div>
                  <Switch
                    id="internalMessages"
                    checked={notificationSettings.categories.user}
                    onCheckedChange={(checked) => handleNotificationSettingsChange('categories', { ...notificationSettings.categories, user: checked })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>{t("savePreferences")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="late-visit-monitoring" className="space-y-4">
          <div className="space-y-6">
            {/* Monitoring Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Late Visit Monitoring Status
                </CardTitle>
                <CardDescription>
                  Monitor and manage late visit alerts with automatic notifications and escalation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Monitoring Status</Label>
                    <p className="text-sm text-gray-500">
                      {monitoringStatus?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {monitoringStatus?.isActive ? (
                      <Button 
                        variant="destructive" 
                        onClick={handleStopMonitoring}
                        size="sm"
                      >
                        Stop Monitoring
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartMonitoring}
                        size="sm"
                      >
                        Start Monitoring
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {monitoringConfig.gracePeriodMinutes}
                    </div>
                    <div className="text-sm text-gray-500">Grace Period (minutes)</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {monitoringConfig.escalationThresholdMinutes}
                    </div>
                    <div className="text-sm text-gray-500">Escalation Threshold (minutes)</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {monitoringConfig.checkIntervalMinutes}
                    </div>
                    <div className="text-sm text-gray-500">Check Interval (minutes)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Monitoring Configuration
                </CardTitle>
                <CardDescription>
                  Configure grace periods, escalation thresholds, and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gracePeriod" className="text-base font-medium">
                        Grace Period (minutes)
                      </Label>
                      <p className="text-sm text-gray-500">
                        Time allowed before considering a visit late
                      </p>
                      <input
                        id="gracePeriod"
                        type="number"
                        min="1"
                        max="60"
                        value={monitoringConfig.gracePeriodMinutes}
                        onChange={(e) => handleUpdateMonitoringConfig({ 
                          gracePeriodMinutes: parseInt(e.target.value) 
                        })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <Label htmlFor="escalationThreshold" className="text-base font-medium">
                        Escalation Threshold (minutes)
                      </Label>
                      <p className="text-sm text-gray-500">
                        Time before escalating to supervisors
                      </p>
                      <input
                        id="escalationThreshold"
                        type="number"
                        min="5"
                        max="120"
                        value={monitoringConfig.escalationThresholdMinutes}
                        onChange={(e) => handleUpdateMonitoringConfig({ 
                          escalationThresholdMinutes: parseInt(e.target.value) 
                        })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <Label htmlFor="checkInterval" className="text-base font-medium">
                        Check Interval (minutes)
                      </Label>
                      <p className="text-sm text-gray-500">
                        How often to check for late visits
                      </p>
                      <input
                        id="checkInterval"
                        type="number"
                        min="1"
                        max="10"
                        value={monitoringConfig.checkIntervalMinutes}
                        onChange={(e) => handleUpdateMonitoringConfig({ 
                          checkIntervalMinutes: parseInt(e.target.value) 
                        })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoEscalate" className="text-base font-medium">
                          Auto Escalate
                        </Label>
                        <p className="text-sm text-gray-500">
                          Automatically escalate persistent delays
                        </p>
                      </div>
                      <Switch
                        id="autoEscalate"
                        checked={monitoringConfig.autoEscalate}
                        onCheckedChange={(checked) => handleUpdateMonitoringConfig({ 
                          autoEscalate: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifyAdmins" className="text-base font-medium">
                          Notify Admins
                        </Label>
                        <p className="text-sm text-gray-500">
                          Send notifications to administrators
                        </p>
                      </div>
                      <Switch
                        id="notifyAdmins"
                        checked={monitoringConfig.notifyAdmins}
                        onCheckedChange={(checked) => handleUpdateMonitoringConfig({ 
                          notifyAdmins: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifySupervisors" className="text-base font-medium">
                          Notify Supervisors
                        </Label>
                        <p className="text-sm text-gray-500">
                          Send escalated alerts to supervisors
                        </p>
                      </div>
                      <Switch
                        id="notifySupervisors"
                        checked={monitoringConfig.notifySupervisors}
                        onCheckedChange={(checked) => handleUpdateMonitoringConfig({ 
                          notifySupervisors: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications" className="text-base font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Send push notifications to mobile devices
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={monitoringConfig.sendPushNotifications}
                        onCheckedChange={(checked) => handleUpdateMonitoringConfig({ 
                          sendPushNotifications: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="text-base font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Send email notifications
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={monitoringConfig.sendEmailNotifications}
                        onCheckedChange={(checked) => handleUpdateMonitoringConfig({ 
                          sendEmailNotifications: checked 
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                    <Button onClick={() => {
                      // Test late visit alert
                      createAlert({
                        type: 'warning',
                        category: 'visit',
                        title: 'Test Late Visit Alert',
                        message: 'This is a test alert for late visit monitoring system',
                        priority: 'medium',
                        driver: 'Test Agent',
                        location: 'Test Location',
                        metadata: { test: true }
                      })
                    }}>
                      Test Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Examples Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alert Examples
                </CardTitle>
                <CardDescription>
                  Examples of notifications that will be sent for late visits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-800">Dashboard Notification</div>
                    <div className="text-sm text-yellow-700">
                      Late Visit Alert: Agent Ahmed Ibrahim hasn't arrived for Visit #V123 (Client: Nile Supplies). 
                      Scheduled: 11:00 — Current: 11:10 — Delay: 10 min. Action: Call agent or reassign.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-red-400 bg-red-50 rounded">
                    <div className="font-medium text-red-800">Push/Email Subject</div>
                    <div className="text-sm text-red-700">
                      Late Visit — Visit #V123 — Agent Ahmed Ibrahim — 10 minutes late
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded">
                    <div className="font-medium text-blue-800">Email Body</div>
                    <div className="text-sm text-blue-700">
                      Agent Ahmed Ibrahim is 10 minutes late for Visit #V123 at Nile Supplies (scheduled 11:00). 
                      Last known status: Location not updated. Please call the agent or reassign. 
                      [Open Visit] [Call Agent]
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visit-alerts-sync" className="space-y-4">
          <div className="space-y-6">
            {/* Visit Alerts Sync Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Visit Alerts Sync Status
                </CardTitle>
                <CardDescription>
                  Synchronize alerts from visit management table to unified alerts system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Sync Status</Label>
                    <p className="text-sm text-gray-500">
                      {visitAlertsSyncStatus?.isActive ? 'Active' : 'Inactive'}
                    </p>
                    {visitAlertsSyncStatus?.lastSync && (
                      <p className="text-xs text-gray-400">
                        Last sync: {new Date(visitAlertsSyncStatus.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {visitAlertsSyncStatus?.isActive ? (
                      <Button 
                        variant="destructive" 
                        onClick={handleStopVisitAlertsSync}
                        size="sm"
                      >
                        Stop Sync
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartVisitAlertsSync}
                        size="sm"
                      >
                        Start Sync
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      Auto Sync
                    </div>
                    <div className="text-sm text-gray-500">Every 2 minutes</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {visitAlertsSyncStatus?.isActive ? 'Running' : 'Stopped'}
                    </div>
                    <div className="text-sm text-gray-500">Sync Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Sync Controls Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manual Sync Controls
                </CardTitle>
                <CardDescription>
                  Manually trigger synchronization of visit alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleSyncVisitAlerts}
                    disabled={syncInProgress}
                    variant="outline"
                  >
                    {syncInProgress ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleForceSyncAllVisitAlerts}
                    disabled={syncInProgress}
                    variant="outline"
                  >
                    {syncInProgress ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Force Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Force Sync All
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleRefresh}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How Visit Alerts Sync Works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Reads alerts from the <code>visit_management</code> table</li>
                    <li>• Syncs them to the <code>unified_alerts_notifications</code> table</li>
                    <li>• Automatically maps alert types and severities</li>
                    <li>• Updates existing alerts or creates new ones</li>
                    <li>• Runs every 2 minutes automatically</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sync Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sync Statistics
                </CardTitle>
                <CardDescription>
                  View synchronization statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {systemAlerts.filter(a => a.category === 'visit' || a.category === 'late_visit').length}
                    </div>
                    <div className="text-sm text-gray-500">Synced Visit Alerts</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {visitAlerts.length}
                    </div>
                    <div className="text-sm text-gray-500">Active Visit Alerts</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {visitAlertsSyncStatus?.isActive ? '2 min' : 'Off'}
                    </div>
                    <div className="text-sm text-gray-500">Sync Interval</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Sync Benefits</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Centralized alert management across all systems</li>
                    <li>• Real-time synchronization of visit alerts</li>
                    <li>• Automatic mapping of alert types and priorities</li>
                    <li>• Unified notification system for all alerts</li>
                    <li>• Historical tracking of alert synchronization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
