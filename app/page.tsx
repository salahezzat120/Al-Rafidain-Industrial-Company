"use client"

import React, { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { PermissionProviderSimple } from "@/contexts/permission-context-simple"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Package, BarChart3 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { OverviewTab } from "@/components/admin/overview-tab"
import { UsersTabSimple } from "@/components/admin/users-tab-simple"
import { SupervisorDashboard } from "@/components/supervisor/supervisor-dashboard"
import EmployeesTab from "@/components/admin/employees-tab"
import { RepresentativesTab } from "@/components/admin/representatives-tab";
import CustomersTab from "@/components/admin/customers-tab"
import PaymentsTab from "@/components/admin/payments-tab"
import { DeliveriesTab } from "@/components/admin/deliveries-tab"
import { VehiclesTab } from "@/components/admin/vehicles-tab"
import { AnalyticsTab } from "@/components/admin/analytics-tab"
import ReportsTab from "@/components/admin/reports-tab"
import LiveMapTab from "@/components/admin/live-map-tab"
import LoyaltyTab from "@/components/admin/loyalty-tab"
import { AlertsTab } from "@/components/admin/alerts-tab"
import { SettingsTab } from "@/components/admin/settings-tab"
import { VisitManagementSingleTab } from "@/components/admin/visit-management-single-tab"
import { AfterSalesTab } from "@/components/admin/after-sales-tab"
import { WarehouseTab } from "@/components/admin/warehouse-tab"
import SimpleLoyaltyTab from "@/components/admin/simple-loyalty-tab"
import { ChatBot } from "@/components/chatbot/chatbot"
import { AssignDeliveryModal } from "@/components/supervisor/assign-delivery-modal"
import { ManageRepresentativesModal } from "@/components/supervisor/manage-representatives-modal";
import { ReportsModal } from "@/components/supervisor/reports-modal"
import { TrackVehiclesModal } from "@/components/supervisor/track-vehicles-modal"
import Image from "next/image"
import dynamic from "next/dynamic"
import { NoSSR } from "@/components/no-ssr"
import AttendanceTab from "@/components/admin/attendance-tab"
import ChatSupportTab from "@/components/admin/chat-support-tab"

function Dashboard() {
  const { user, logout } = useAuth()
  const { t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [])
  
  // Debug logging
  console.log('Dashboard: Current user object', user)
  console.log('Dashboard: User role', user?.role)
  console.log('Dashboard: Is representative?', user?.role === 'representative')
  const [assignDeliveryOpen, setAssignDeliveryOpen] = useState(false)
  const [manageDriversOpen, setManageDriversOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [trackVehiclesOpen, setTrackVehiclesOpen] = useState(false)
  const [isChatBotMinimized, setIsChatBotMinimized] = useState(false)
  const [manageRepresentativesOpen, setManageRepresentativesOpen] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "supervisor":
        return "bg-blue-100 text-blue-800"
      case "driver":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (user?.role === "admin") {
    return (
      <PermissionProviderSimple>
        <div className="min-h-screen bg-gray-50 flex" dir={isRTL ? "rtl" : "ltr"}>
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Al-Rafidain Industrial Company"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial Company"}
                    </h1>
                    <p className="text-sm text-gray-600">{t("dashboard.welcome")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <Badge variant="secondary" className={getRoleColor(user?.role || "")}>
                        {t(`auth.${user?.role || ""}`).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("auth.logout")}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTabSimple />}
            {activeTab === "employees" && <EmployeesTab />}
            {activeTab === "representatives" && <RepresentativesTab onNavigateToChatSupport={() => setActiveTab("chat-support")} onNavigateToDeliveryTasks={() => setActiveTab("deliveries")} onNavigateToLiveMap={(representativeName) => {
              console.log('Dashboard: Navigating to live-map with representative:', representativeName);
              setActiveTab("live-map");
              // Store representative name in URL for the live map to pick up
              if (representativeName) {
                const url = new URL(window.location.href);
                url.searchParams.set('search', representativeName);
                window.history.replaceState({}, '', url.toString());
                console.log('Dashboard: URL updated with search parameter:', url.toString());
              }
            }} />}
            {activeTab === "customers" && <CustomersTab />}
            {activeTab === "warehouse" && <WarehouseTab />}
            {activeTab === "simple-loyalty" && <SimpleLoyaltyTab />}
            {activeTab === "payments" && <PaymentsTab />}
            {activeTab === "deliveries" && <DeliveriesTab />}
            {activeTab === "vehicles" && <VehiclesTab />}
            {activeTab === "live-map" && <LiveMapTab onNavigateToChatSupport={(representativeId) => {
              setActiveTab("chat-support")
              // Store representative ID in URL for chat support to pick up
              if (representativeId) {
                const url = new URL(window.location.href)
                url.searchParams.set('rep', representativeId)
                window.history.replaceState({}, '', url.toString())
              }
            }} />}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "reports" && <ReportsTab />}
            {activeTab === "loyalty" && <LoyaltyTab />}
            {activeTab === "alerts" && <AlertsTab />}
            {activeTab === "visits" && <VisitManagementSingleTab />}
                {activeTab === "after-sales" && <AfterSalesTab onNavigateToLiveMap={(representativeName) => {
              setActiveTab("live-map");
              // Store representative name in URL for the live map to pick up
              if (representativeName) {
                const url = new URL(window.location.href);
                url.searchParams.set('search', representativeName);
                window.history.replaceState({}, '', url.toString());
              }
            }} />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "attendance" && <AttendanceTab />}
            {activeTab === "chat-support" && <ChatSupportTab onNavigateToLiveMap={(representativeName) => {
              setActiveTab("live-map")
              // Store representative name in URL for the live map to pick up
              if (representativeName) {
                const url = new URL(window.location.href)
                url.searchParams.set('search', representativeName)
                window.history.replaceState({}, '', url.toString())
              }
            }} />}
          </main>
        </div>
        </div>
      </PermissionProviderSimple>
    )
  }

  if (user?.role === "supervisor") {
    // Check if supervisor is accessing a specific admin page
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    
    // If accessing a specific tab, show admin interface
    if (tabParam) {
      return (
        <PermissionProviderSimple>
          <div className="min-h-screen bg-gray-50 flex" dir={isRTL ? "rtl" : "ltr"}>
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col">
              <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/logo.png"
                        alt="Al-Rafidain Industrial Company"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">
                          {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial Company"}
                        </h1>
                        <p className="text-sm text-gray-600">{t("dashboard.welcome")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <LanguageSwitcher />
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {t(`auth.${user?.role || ""}`).toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("auth.logout")}
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              <main className="flex-1 p-6">
                {/* Back to Dashboard button for supervisors */}
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="mb-4"
                  >
                    ← Back to Supervisor Dashboard
                  </Button>
                </div>
                
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "users" && <UsersTabSimple />}
                {activeTab === "employees" && <EmployeesTab />}
                {activeTab === "representatives" && <RepresentativesTab onNavigateToChatSupport={() => setActiveTab("chat-support")} onNavigateToDeliveryTasks={() => setActiveTab("deliveries")} onNavigateToLiveMap={(representativeName) => {
                  console.log('Dashboard: Navigating to live-map with representative:', representativeName);
                  setActiveTab("live-map");
                  // Store representative name in URL for the live map to pick up
                  if (representativeName) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('search', representativeName);
                    window.history.replaceState({}, '', url.toString());
                    console.log('Dashboard: URL updated with search parameter:', url.toString());
                  }
                }} />}
                {activeTab === "customers" && <CustomersTab />}
                {activeTab === "warehouse" && <WarehouseTab />}
                {activeTab === "simple-loyalty" && <SimpleLoyaltyTab />}
                {activeTab === "payments" && <PaymentsTab />}
                {activeTab === "deliveries" && <DeliveriesTab />}
                {activeTab === "vehicles" && <VehiclesTab />}
                {activeTab === "live-map" && <LiveMapTab />}
                {activeTab === "analytics" && <AnalyticsTab />}
                {activeTab === "reports" && <ReportsTab />}
                {activeTab === "loyalty" && <LoyaltyTab />}
                {activeTab === "alerts" && <AlertsTab />}
                {activeTab === "visits" && <VisitsTab />}
                {activeTab === "messaging" && <MessagingTab />}
                {activeTab === "after-sales" && <AfterSalesTab onNavigateToLiveMap={(representativeName) => {
                  setActiveTab("live-map");
                  // Store representative name in URL for the live map to pick up
                  if (representativeName) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('search', representativeName);
                    window.history.replaceState({}, '', url.toString());
                  }
                }} />}
                {activeTab === "settings" && <SettingsTab />}
                {activeTab === "attendance" && <AttendanceTab />}
                {activeTab === "chat-support" && <ChatSupportTab onNavigateToLiveMap={(representativeName) => {
                  setActiveTab("live-map")
                  // Store representative name in URL for the live map to pick up
                  if (representativeName) {
                    const url = new URL(window.location.href)
                    url.searchParams.set('search', representativeName)
                    window.history.replaceState({}, '', url.toString())
                  }
                }} />}
              </main>
            </div>
          </div>
        </PermissionProviderSimple>
      )
    }
    
    // Default supervisor dashboard
    return (
      <PermissionProviderSimple>
        <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Al-Rafidain Industrial Company"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial Company"}
                    </h1>
                    <p className="text-sm text-gray-600">{t("dashboard.supervisorDashboard")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {t(`auth.${user?.role || ""}`).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("auth.logout")}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SupervisorDashboard />
          </main>
        </div>
      </PermissionProviderSimple>
    )
  }

  if (user?.role === "representative") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Al-Rafidain Industrial Company"
              width={64}
              height={64}
              className="h-16 w-16 object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isRTL ? 'لوحة تحكم المندوب غير متاحة' : 'Representative Dashboard Not Available'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isRTL 
                ? 'لوحة تحكم المندوبين غير متاحة حالياً. يرجى التواصل مع الإدارة.' 
                : 'The representative dashboard is currently not available. Please contact the administration.'}
            </p>
            <Button onClick={logout} className="bg-blue-600 hover:bg-blue-700 text-white">
              <LogOut className="h-4 w-4 mr-2" />
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Al-Rafidain Industrial Company"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">
                {isRTL ? "شركة الرفيدان للصناعة" : "Al-Rafidain Industrial Company"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <Badge variant="secondary" className={getRoleColor(user?.role || "")}>
                    {t(`auth.${user?.role || ""}`).toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("auth.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isRTL ? `${t("dashboard.welcomeBack")}، ${user?.name}!` : `${t("dashboard.welcomeBack")}, ${user?.name}!`}
          </h2>
          <p className="text-gray-600">{t("dashboard.welcome")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.totalDeliveries")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.activeRepresentatives")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">8 {t("common.onRoute")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("driver.completedDeliveries")}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("common.successRate")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+0.5% {t("common.fromLastWeek")}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="h-20 flex-col gap-2 bg-transparent"
                variant="outline"
                onClick={() => setAssignDeliveryOpen(true)}
              >
                <Package className="h-6 w-6" />
                {t("supervisor.assignDelivery")}
              </Button>
              <Button
                className="h-20 flex-col gap-2 bg-transparent"
                variant="outline"
                onClick={() => setManageDriversOpen(true)}
              >
                <Users className="h-6 w-6" />
                {t("supervisor.manageDrivers")}
              </Button>
              <Button
                className="h-20 flex-col gap-2 bg-transparent"
                variant="outline"
                onClick={() => setReportsOpen(true)}
              >
                <BarChart3 className="h-6 w-6" />
                {t("supervisor.viewReports")}
              </Button>
              <Button
                className="h-20 flex-col gap-2 bg-transparent"
                variant="outline"
                onClick={() => setTrackVehiclesOpen(true)}
              >
                <Package className="h-6 w-6" />
                {t("supervisor.trackVehicles")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <AssignDeliveryModal isOpen={assignDeliveryOpen} onClose={() => setAssignDeliveryOpen(false)} />
      <ManageRepresentativesModal isOpen={manageRepresentativesOpen} onClose={() => setManageRepresentativesOpen(false)} />
      <ReportsModal isOpen={reportsOpen} onClose={() => setReportsOpen(false)} />
      <TrackVehiclesModal isOpen={trackVehiclesOpen} onClose={() => setTrackVehiclesOpen(false)} />
      <ManageRepresentativesModal isOpen={manageRepresentativesOpen} onClose={() => setManageRepresentativesOpen(false)} />
      
      {/* ChatBot */}
      <ChatBot 
        isMinimized={isChatBotMinimized}
        onMinimize={() => setIsChatBotMinimized(true)}
        onMaximize={() => setIsChatBotMinimized(false)}
        onNavigateToChatSupport={() => setActiveTab("chat-support")}
      />
    </div>
  )
}

function ClientOnlyDashboard() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <Dashboard />
}

const DynamicDashboard = dynamic(() => Promise.resolve(ClientOnlyDashboard), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function HomePage() {
  return (
    <NoSSR fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProtectedRoute>
        <DynamicDashboard />
      </ProtectedRoute>
    </NoSSR>
  )
}
