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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useLanguage()

  const sidebarItems = [
    { id: "overview", label: t("nav.overview"), icon: LayoutDashboard },
    { id: "users", label: t("nav.userManagement"), icon: UserPlus },
    { id: "drivers", label: t("nav.driverManagement"), icon: Users },
    { id: "customers", label: t("nav.customerManagement"), icon: UserCheck },
    { id: "vehicles", label: t("nav.vehicles"), icon: Truck },
    { id: "deliveries", label: t("nav.deliveryTasks"), icon: Package },
    { id: "tracking", label: t("nav.tracking"), icon: MapPin },
    { id: "analytics", label: t("nav.analytics"), icon: BarChart3 },
    { id: "alerts", label: t("nav.alerts"), icon: Bell },
    { id: "settings", label: t("nav.settings"), icon: Settings },
  ]

  return (
    <div className={cn("bg-white border-r border-gray-200 transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className="text-lg font-semibold text-gray-900">{t("nav.adminPanel")}</h2>}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn("w-full justify-start mb-1", collapsed ? "px-2" : "px-3")}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
