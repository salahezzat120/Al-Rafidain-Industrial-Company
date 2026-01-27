"use client"

import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  MapPin,
  BarChart3,
  Settings,
  Bell,
  UserCheck,
  UserPlus,
  Calendar,
  MessageSquare,
  Headphones,
  DollarSign,
  Warehouse,
  Star,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { usePermissions } from "@/contexts/permission-context-simple"

interface AdminDashboardHomeProps {
  onTabChange: (tab: string) => void
  userName?: string
}

const cardColors = [
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-green-500 to-green-700",
  "bg-gradient-to-br from-cyan-500 to-cyan-700",
  "bg-gradient-to-br from-pink-500 to-pink-700",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-teal-500 to-teal-700",
  "bg-gradient-to-br from-indigo-500 to-indigo-700",
  "bg-gradient-to-br from-rose-500 to-rose-700",
  "bg-gradient-to-br from-emerald-500 to-emerald-700",
  "bg-gradient-to-br from-violet-500 to-violet-700",
  "bg-gradient-to-br from-amber-500 to-amber-700",
  "bg-gradient-to-br from-lime-500 to-lime-700",
  "bg-gradient-to-br from-fuchsia-500 to-fuchsia-700",
  "bg-gradient-to-br from-sky-500 to-sky-700",
  "bg-gradient-to-br from-red-500 to-red-700",
]

export function AdminDashboardHome({ onTabChange, userName }: AdminDashboardHomeProps) {
  const { t, isRTL } = useLanguage()
  const { canAccess } = usePermissions()

  const dashboardItems = [
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
  ]

  // Filter items based on permissions
  const accessibleItems = dashboardItems.filter(item => canAccess(item.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {isRTL ? `أهلاً ${userName || "admin"}` : `Hello ${userName || "admin"}`}
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          {isRTL ? "اختر القسم الذي تريد الوصول إليه" : "Select the section you want to access"}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {accessibleItems.map((item, index) => {
          const Icon = item.icon
          const colorClass = cardColors[index % cardColors.length]

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`${colorClass} rounded-2xl p-6 md:p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-3 md:gap-4 min-h-[140px] md:min-h-[160px]`}
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10" />
              <span className="text-sm md:text-base font-semibold text-center leading-tight">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Settings Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => onTabChange("settings")}
          className="bg-gray-700/50 hover:bg-gray-600/50 rounded-xl px-6 py-3 text-white flex items-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">
            {isRTL ? "الإعدادات" : "Settings"}
          </span>
        </button>
      </div>
    </div>
  )
}
