"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, AlertTriangle, CheckCircle, Clock, Fuel, MapPin, Settings, X, User, MessageSquare } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { VisitAlert } from "@/types/visits"
import { getUnreadAlerts, markAlertAsRead, checkLateVisits, checkExceededTimeVisits } from "@/lib/visits"

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
  const [visitAlerts, setVisitAlerts] = useState<VisitAlert[]>([])
  const [loading, setLoading] = useState(false)

  const [alertSettings, setAlertSettings] = useState({
    lowFuel: true,
    delayedDeliveries: true,
    vehicleMaintenance: true,
    routeOptimization: false,
    customerFeedback: true,
    systemUpdates: false,
    lateVisits: true,
    timeExceeded: true,
    internalMessages: true,
  })

  useEffect(() => {
    loadVisitAlerts()
    startMonitoring()
  }, [])

  const loadVisitAlerts = async () => {
    setLoading(true)
    try {
      // In real app, this would fetch from API
      const mockVisitAlerts: VisitAlert[] = [
        {
          id: "1",
          visit_id: "2",
          delegate_id: "2",
          alert_type: "late_arrival",
          severity: "high",
          message: "Delegate Sarah Wilson is late for visit at XYZ Industries",
          is_read: false,
          created_at: new Date().toISOString(),
          admin_notified: false
        },
        {
          id: "2",
          visit_id: "3",
          delegate_id: "3",
          alert_type: "time_exceeded",
          severity: "medium",
          message: "Delegate David Chen has exceeded allowed time for visit at Tech Solutions Ltd",
          is_read: false,
          created_at: new Date().toISOString(),
          admin_notified: false
        }
      ]
      setVisitAlerts(mockVisitAlerts)
    } catch (error) {
      console.error('Error loading visit alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const startMonitoring = () => {
    // Check for late visits and exceeded time visits every minute
    const interval = setInterval(async () => {
      try {
        await checkLateVisits()
        await checkExceededTimeVisits()
        loadVisitAlerts()
      } catch (error) {
        console.error('Error in monitoring:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
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
            {activeAlerts.length + unreadVisitAlerts.length} {t("active")}
          </Badge>
          {unreadVisitAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {unreadVisitAlerts.length} Visit Alerts
            </Badge>
          )}
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
                <p className="text-2xl font-bold text-gray-900">1</p>
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
                <p className="text-2xl font-bold text-gray-900">2</p>
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
                <p className="text-2xl font-bold text-gray-900">1</p>
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
                <p className="text-2xl font-bold text-gray-900">8</p>
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
          <TabsTrigger value="resolved">{t("resolved")}</TabsTrigger>
          <TabsTrigger value="settings">{t("notificationSettings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
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
                    checked={alertSettings.lowFuel}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, lowFuel: checked }))}
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
                    checked={alertSettings.delayedDeliveries}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, delayedDeliveries: checked }))}
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
                    checked={alertSettings.vehicleMaintenance}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => ({ ...prev, vehicleMaintenance: checked }))
                    }
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
                    checked={alertSettings.routeOptimization}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, routeOptimization: checked }))}
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
                    checked={alertSettings.customerFeedback}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, customerFeedback: checked }))}
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
                    checked={alertSettings.systemUpdates}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, systemUpdates: checked }))}
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
                    checked={alertSettings.lateVisits}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, lateVisits: checked }))}
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
                    checked={alertSettings.timeExceeded}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, timeExceeded: checked }))}
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
                    checked={alertSettings.internalMessages}
                    onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, internalMessages: checked }))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>{t("savePreferences")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
