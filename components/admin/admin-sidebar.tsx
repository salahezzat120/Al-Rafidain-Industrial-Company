"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  MapPin,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserPlus,
  Calendar,
  MessageSquare,
  Headphones,
  DollarSign,
  Warehouse,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { usePermissions } from "@/contexts/permission-context-simple"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { t, isRTL } = useLanguage()
  const { canAccess } = usePermissions()

  const sidebarItems = [
    { id: "overview", label: t("nav.overview"), icon: LayoutDashboard },
    { id: "users", label: t("nav.userManagement"), icon: UserPlus },
    { id: "employees", label: t("nav.employeeManagement"), icon: Users },
    { id: "representatives", label: t("nav.representativeManagement"), icon: Users },
    { id: "customers", label: t("nav.customerManagement"), icon: UserCheck },
    { id: "warehouse", label: t("nav.warehouseManagement"), icon: Warehouse },
    { id: "payments", label: t("nav.paymentTracking"), icon: DollarSign },
    { id: "simple-loyalty", label: t("nav.simpleLoyalty"), icon: Star },
    { id: "attendance", label: t("nav.attendance"), icon: Calendar },
    { id: "chat-support", label: t("nav.chatSupport"), icon: MessageSquare },
    { id: "live-map", label: t("nav.liveMap"), icon: MapPin },
    { id: "vehicles", label: t("nav.vehicles"), icon: Truck },
    { id: "deliveries", label: t("nav.deliveryTasks"), icon: Package },
    { id: "analytics", label: t("nav.analytics"), icon: BarChart3 },
    { id: "alerts", label: t("nav.alerts"), icon: Bell },
    { id: "visits", label: t("nav.visitManagement"), icon: Calendar },
    { id: "after-sales", label: t("nav.afterSalesSupport"), icon: Headphones },
    { id: "settings", label: t("nav.settings"), icon: Settings },
  ]

  return (
    <div className={cn("bg-white border-r border-gray-200 transition-all duration-300", collapsed ? "w-16" : "w-64")} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className={cn("text-lg font-semibold text-gray-900", isRTL ? 'text-right' : 'text-left')}>{t("nav.adminPanel")}</h2>}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const hasAccess = canAccess(item.id)
            
            // Don't render items the user can't access
            if (!hasAccess) return null
            
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn("w-full mb-1", collapsed ? "px-2 justify-center" : "px-3 justify-start")}
                onClick={() => onTabChange(item.id)}
              >
                {!collapsed && (
                  <div className={cn("flex items-center w-full gap-2", isRTL ? "justify-end" : "justify-start")} dir={isRTL ? 'rtl' : 'ltr'}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </div>
                )}
                {collapsed && <Icon className="h-4 w-4" />}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
