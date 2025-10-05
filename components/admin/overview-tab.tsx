"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Users, Truck, Package, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, User, DollarSign as DollarIcon, RefreshCw, X, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPerformanceMetrics, getRecentActivity, getDashboardKPIs } from "@/lib/overview-analytics"
import { getAlerts, getAlertStats, performAlertAction, type Alert, type AlertStats } from "@/lib/alerts"

export function OverviewTab() {
  const { t } = useLanguage()
  const [kpis, setKpis] = useState<any>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    loadAlerts()
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadAlerts()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📊 Loading dashboard data...')

      // Load all dashboard data in parallel
      const [kpisResult, performanceResult, activityResult] = await Promise.all([
        getDashboardKPIs(),
        getPerformanceMetrics(),
        getRecentActivity()
      ])

      // Handle KPIs
      if (kpisResult.error) {
        console.error('❌ Error loading KPIs:', kpisResult.error)
        setError(kpisResult.error)
      } else {
        setKpis(kpisResult.data)
      }

      // Handle performance metrics
      if (performanceResult.error) {
        console.error('❌ Error loading performance metrics:', performanceResult.error)
      } else {
        setPerformanceMetrics(performanceResult.data)
      }

      // Handle recent activity
      if (activityResult.error) {
        console.error('❌ Error loading recent activity:', activityResult.error)
      } else {
        setRecentActivity(activityResult.data || [])
      }

      console.log('✅ Dashboard data loaded successfully')

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true)
      console.log('🚨 Loading alerts...')

      const [alertsResult, statsResult] = await Promise.all([
        getAlerts({ limit: 5, status: 'active' }),
        getAlertStats()
      ])

      if (alertsResult.error) {
        console.error('❌ Error loading alerts:', alertsResult.error)
      } else {
        setAlerts(alertsResult.data || [])
      }

      if (statsResult.error) {
        console.error('❌ Error loading alert stats:', statsResult.error)
      } else {
        setAlertStats(statsResult.data)
      }

      console.log('✅ Alerts loaded successfully')
    } catch (error) {
      console.error('❌ Error loading alerts:', error)
    } finally {
      setAlertsLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: 'mark_read' | 'resolve' | 'dismiss') => {
    try {
      const result = await performAlertAction(alertId, action, 'admin')
      
      if (result.error) {
        console.error('❌ Error performing alert action:', result.error)
      } else {
        console.log('✅ Alert action performed successfully')
        // Reload alerts to reflect changes
        loadAlerts()
      }
    } catch (error) {
      console.error('❌ Error performing alert action:', error)
    }
  }

  const createSampleData = async () => {
    try {
      setAlertsLoading(true)
      console.log('📝 Creating sample alerts...')

      const response = await fetch('/api/alerts/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create' }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Sample alerts created successfully')
        // Reload alerts to show the new data
        loadAlerts()
      } else {
        console.error('❌ Error creating sample alerts:', result.error)
      }
    } catch (error) {
      console.error('❌ Error creating sample alerts:', error)
    } finally {
      setAlertsLoading(false)
    }
  }

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'package':
        return <Package className="h-4 w-4" />
      case 'dollar':
        return <DollarIcon className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500'
      case 'blue':
        return 'bg-blue-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'purple':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAlertIcon = (alertType: string, severity: string) => {
    switch (alertType) {
      case 'vehicle':
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'delivery':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'system':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return severity === 'critical' || severity === 'high' 
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-red-50'
      case 'medium':
        return 'bg-yellow-50'
      case 'low':
        return 'bg-green-50'
      default:
        return 'bg-gray-50'
    }
  }

  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-900'
      case 'medium':
        return 'text-yellow-900'
      case 'low':
        return 'text-green-900'
      default:
        return 'text-gray-900'
    }
  }

  const getAlertSubTextColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-700'
      case 'medium':
        return 'text-yellow-700'
      case 'low':
        return 'text-green-700'
      default:
        return 'text-gray-700'
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : kpis ? `$${kpis.totalRevenue.toLocaleString()}` : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeRepresentatives")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : kpis ? kpis.activeRepresentatives : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{kpis?.onRouteRepresentatives || 0} {t("onRoute")}</span>, {kpis?.availableRepresentatives || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("fleetVehicles")}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : kpis ? kpis.activeRepresentatives : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{kpis?.activeRepresentatives || 0} operational</span>, 0 {t("maintenance")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("deliveriesToday")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : kpis ? kpis.totalTasks : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{kpis?.completedTasks || 0} {t("completed")}</span>, {kpis?.pendingTasks || 0} {t("pending")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("performanceMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="h-4 w-24 bg-gray-200 rounded animate-pulse"></span>
                      <span className="h-4 w-12 bg-gray-200 rounded animate-pulse"></span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : performanceMetrics ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("onTimeDeliveryRate")}</span>
                    <span className="font-medium">{performanceMetrics.onTimeDeliveryRate}%</span>
                  </div>
                  <Progress value={performanceMetrics.onTimeDeliveryRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("customerSatisfaction")}</span>
                    <span className="font-medium">{performanceMetrics.customerSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(performanceMetrics.customerSatisfaction / 5) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("fleetUtilization")}</span>
                    <span className="font-medium">{performanceMetrics.fleetUtilization}%</span>
                  </div>
                  <Progress value={performanceMetrics.fleetUtilization} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("driverEfficiency")}</span>
                    <span className="font-medium">{performanceMetrics.driverEfficiency}%</span>
                  </div>
                  <Progress value={performanceMetrics.driverEfficiency} className="h-2" />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("systemAlerts")}
                {alertStats && (
                  <Badge variant="destructive" className="ml-2">
                    {alertStats.active} {t("active")}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAlerts}
                  disabled={alertsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${alertsLoading ? 'animate-spin' : ''}`} />
                  {t("refresh")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createSampleData}
                  disabled={alertsLoading}
                >
                  Create Sample
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-3 p-3 ${getAlertBgColor(alert.severity)} rounded-lg`}>
                    {getAlertIcon(alert.alert_type, alert.severity)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${getAlertTextColor(alert.severity)}`}>
                        {alert.title}
                      </p>
                      <p className={`text-xs ${getAlertSubTextColor(alert.severity)}`}>
                        {alert.message}
                      </p>
                      {alert.vehicle_plate && (
                        <p className={`text-xs ${getAlertSubTextColor(alert.severity)} mt-1`}>
                          Vehicle: {alert.vehicle_plate}
                        </p>
                      )}
                      {alert.driver_name && (
                        <p className={`text-xs ${getAlertSubTextColor(alert.severity)}`}>
                          Driver: {alert.driver_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadgeVariant(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                      <div className="flex gap-1">
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'mark_read')}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'dismiss')}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`h-2 w-2 ${getActivityColor(activity.color)} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
