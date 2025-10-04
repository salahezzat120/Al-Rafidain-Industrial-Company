"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Truck, Package, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, User, DollarSign as DollarIcon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPerformanceMetrics, getRecentActivity, getDashboardKPIs } from "@/lib/overview-analytics"

export function OverviewTab() {
  const { t } = useLanguage()
  const [kpis, setKpis] = useState<any>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("systemAlerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Vehicle Maintenance Due</p>
                  <p className="text-xs text-red-700">Truck #VH-001 needs service</p>
                </div>
                <Badge variant="destructive">{t("high")}</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">{t("delayed")} Delivery</p>
                  <p className="text-xs text-yellow-700">Order #12345 is 30 mins behind</p>
                </div>
                <Badge variant="secondary">{t("medium")}</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Route Optimized</p>
                  <p className="text-xs text-green-700">Saved 45 mins on Route A</p>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </div>
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
