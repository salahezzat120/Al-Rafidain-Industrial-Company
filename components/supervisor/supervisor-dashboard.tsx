"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Package, 
  Truck, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Warehouse,
  DollarSign,
  Bell,
  MapPin,
  Headphones,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { usePermissions } from "@/contexts/permission-context-simple"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  href: string
  color: string
}

export function SupervisorDashboard() {
  const { canAccess } = usePermissions()
  const { t, isRTL } = useLanguage()
  const { user } = useAuth()
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalRepresentatives: 0,
    activeRepresentatives: 0,
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    totalCustomers: 0,
    activeVehicles: 0,
    totalRevenue: 0,
    todayRevenue: 0
  })

  const [loading, setLoading] = useState(true)

  // Load dashboard statistics from database
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch representatives data
      const { data: representatives, error: repsError } = await supabase
        .from('representatives')
        .select('id, status, vehicle, name, email, phone, transportation_type')

      if (repsError) {
        console.error('Error fetching representatives:', repsError)
      }

      // Fetch live locations to determine who is online
      const { data: liveLocations, error: locationsError } = await supabase
        .from('representative_live_locations')
        .select('representative_id, timestamp')
        .order('timestamp', { ascending: false })

      if (locationsError) {
        console.error('Error fetching live locations:', locationsError)
      }

      // Fetch delivery tasks data for completed deliveries
      const { data: deliveryTasks, error: deliveryError } = await supabase
        .from('delivery_tasks')
        .select('status, completed_at, total_value')

      if (deliveryError) {
        console.error('Error fetching delivery tasks:', deliveryError)
      }

      // Fetch customers data
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, status')

      if (customersError) {
        console.error('Error fetching customers:', customersError)
      }

      // Calculate statistics
      const totalRepresentatives = representatives?.length || 0
      
      // Determine active representatives based on recent location updates (within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      const recentLocations = liveLocations?.filter(location => 
        new Date(location.timestamp) > thirtyMinutesAgo
      ) || []
      
      // Get unique representative IDs who have sent location recently
      const onlineRepresentativeIds = [...new Set(recentLocations.map(loc => loc.representative_id))]
      const activeRepresentatives = onlineRepresentativeIds.length
      
      // Get representatives with vehicles
      const activeVehicles = representatives?.filter(rep => rep.vehicle).length || 0
      
      // Get representatives who are on route (from status)
      const onRouteRepresentatives = representatives?.filter(rep => rep.status === 'on-route').length || 0
      
      // Use representatives count as "Total Deliveries" (as requested)
      const totalDeliveries = totalRepresentatives
      
      // Calculate completed deliveries from delivery_tasks table
      const completedDeliveries = deliveryTasks?.filter(task => task.status === 'completed').length || 0
      const pendingDeliveries = deliveryTasks?.filter(task => task.status === 'pending' || task.status === 'assigned').length || 0
      
      // Calculate revenue
      const totalRevenue = deliveryTasks
        ?.filter(task => task.status === 'completed' && task.total_value)
        .reduce((sum, task) => sum + (parseFloat(task.total_value) || 0), 0) || 0

      // Calculate today's revenue
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayRevenue = deliveryTasks
        ?.filter(task => {
          if (task.status !== 'completed' || !task.completed_at) return false
          const completedDate = new Date(task.completed_at)
          return completedDate >= today
        })
        .reduce((sum, task) => sum + (parseFloat(task.total_value) || 0), 0) || 0

      // Calculate customers stats
      const totalCustomers = customers?.length || 0

      setStats({
        totalRepresentatives,
        activeRepresentatives,
        totalDeliveries, // This is now the count of representatives
        completedDeliveries,
        pendingDeliveries,
        totalCustomers,
        activeVehicles,
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue)
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Define all possible quick actions
  const allQuickActions: QuickAction[] = [
    {
      id: 'overview',
      name: t("dashboard.dashboardOverview"),
      description: 'View system overview and metrics',
      icon: LayoutDashboard,
      href: '/admin?tab=overview',
      color: 'bg-blue-500'
    },
    {
      id: 'employees',
      name: t("dashboard.employeeManagement"),
      description: 'Manage company employees',
      icon: Users,
      href: '/admin?tab=employees',
      color: 'bg-green-500'
    },
    {
      id: 'representatives',
      name: t("dashboard.manageRepresentatives"),
      description: 'Manage delivery representatives',
      icon: UserCheck,
      href: '/admin?tab=representatives',
      color: 'bg-purple-500'
    },
    {
      id: 'customers',
      name: t("dashboard.customerManagement"),
      description: 'Manage customer information',
      icon: UserCheck,
      href: '/admin?tab=customers',
      color: 'bg-orange-500'
    },
    {
      id: 'warehouse',
      name: t("dashboard.warehouseManagement"),
      description: 'Manage inventory and warehouses',
      icon: Warehouse,
      href: '/admin?tab=warehouse',
      color: 'bg-indigo-500'
    },
    {
      id: 'deliveries',
      name: t("dashboard.deliveryTasks"),
      description: 'Manage delivery tasks and assignments',
      icon: Package,
      href: '/admin?tab=deliveries',
      color: 'bg-red-500'
    },
    {
      id: 'vehicles',
      name: t("dashboard.vehicleFleet"),
      description: 'Manage delivery vehicles',
      icon: Truck,
      href: '/admin?tab=vehicles',
      color: 'bg-yellow-500'
    },
    {
      id: 'analytics',
      name: t("dashboard.analyticsReports"),
      description: 'View system analytics and reports',
      icon: BarChart3,
      href: '/admin?tab=analytics',
      color: 'bg-pink-500'
    },
    {
      id: 'attendance',
      name: t("dashboard.attendanceTracking"),
      description: 'Track employee attendance',
      icon: Calendar,
      href: '/admin?tab=attendance',
      color: 'bg-teal-500'
    },
    {
      id: 'chat-support',
      name: t("dashboard.chatSupport"),
      description: 'Customer support chat system',
      icon: MessageSquare,
      href: '/admin?tab=chat-support',
      color: 'bg-cyan-500'
    },
    {
      id: 'live-map',
      name: t("dashboard.liveMap"),
      description: 'Real-time delivery tracking',
      icon: MapPin,
      href: '/admin?tab=live-map',
      color: 'bg-emerald-500'
    },
    {
      id: 'payments',
      name: t("dashboard.paymentTracking"),
      description: 'Track payments and transactions',
      icon: DollarSign,
      href: '/admin?tab=payments',
      color: 'bg-lime-500'
    },
    {
      id: 'alerts',
      name: t("dashboard.alertsNotifications"),
      description: 'System alerts and notifications',
      icon: Bell,
      href: '/admin?tab=alerts',
      color: 'bg-rose-500'
    },
    {
      id: 'visits',
      name: t("dashboard.visitManagement"),
      description: 'Customer visit management',
      icon: Calendar,
      href: '/admin?tab=visits',
      color: 'bg-violet-500'
    },
    {
      id: 'messaging',
      name: t("dashboard.internalMessaging"),
      description: 'Internal communication',
      icon: MessageSquare,
      href: '/admin?tab=messaging',
      color: 'bg-slate-500'
    },
    {
      id: 'after-sales',
      name: t("dashboard.afterSalesSupport"),
      description: 'Post-sale customer support',
      icon: Headphones,
      href: '/admin?tab=after-sales',
      color: 'bg-violet-500'
    }
  ]

  // Filter actions based on supervisor permissions - this shows only what they can access
  const accessibleActions = allQuickActions.filter(action => canAccess(action.id))

  const handleActionClick = (action: QuickAction) => {
    // Navigate to the admin page with the specific tab
    // Use window.location to navigate to the admin panel with the specific tab
    const adminUrl = `/?tab=${action.id}&role=admin`
    window.location.href = adminUrl
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, supervisor (Supervisor)!
          </h1>
          <p className="text-gray-600">
            Welcome to Al-Rafidain Delivery Management
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Welcome Section */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <Button 
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            disabled={loading}
          >
            {loading ? t("common.loading") : t("dashboard.updateData")}
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isRTL ? `${t("dashboard.welcomeBack")}، ${user?.name}!` : `${t("dashboard.welcomeBack")}, ${user?.name}!`}
        </h1>
        <p className="text-gray-600">
          {t("dashboard.deliveryOverview")}
        </p>
      </div>

      {/* Key Metrics Section - Real data from database */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Representatives (shown as "Total Deliveries") */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.totalRepresentatives")}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              <p className="text-xs text-blue-600">{stats.activeRepresentatives} {t("dashboard.active")}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Online Representatives (based on live location) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.onlineRepresentatives")}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRepresentatives}</p>
              <p className="text-xs text-green-600">{t("dashboard.locationUpdatedLast30Min")}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Completed Deliveries - Real data from delivery_tasks table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.completedDeliveries")}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
              <p className="text-xs text-green-600">
                {stats.totalDeliveries > 0 ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) : 0}% {t("dashboard.completionRate")}
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.successRate")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDeliveries > 0 ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100) : 0}%
              </p>
              <p className="text-xs text-green-600">{t("dashboard.basedOnCompletedTasks")}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section - Dynamic based on permissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t("dashboard.quickActions")}</h2>
          <div className="text-xs text-gray-500">
            {accessibleActions.length} of {allQuickActions.length} available
          </div>
        </div>
        
        {accessibleActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {accessibleActions.map((action) => {
              const Icon = action.icon
              return (
                <div 
                  key={action.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white rounded-lg border border-gray-200 p-4 text-center"
                  onClick={() => handleActionClick(action)}
                >
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Access Granted</h3>
            <p className="text-xs text-gray-600">
              Contact your administrator to request permissions.
            </p>
          </div>
        )}
      </div>


    </div>
  )
}
