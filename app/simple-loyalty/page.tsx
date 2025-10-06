"use client"

import React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { PermissionProviderSimple } from "@/contexts/permission-context-simple"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"
import SimpleLoyaltyTab from "@/components/admin/simple-loyalty-tab"
import Image from "next/image"
import dynamic from "next/dynamic"
import { NoSSR } from "@/components/no-ssr"

function SimpleLoyaltyPage() {
  const { user, logout } = useAuth()
  const { t, isRTL } = useLanguage()

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

  return (
    <PermissionProviderSimple>
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
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
                    {isRTL ? "نظام الولاء" : "Loyalty System"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "إدارة نقاط الولاء للعملاء والمندوبين" : "Manage loyalty points for customers and representatives"}
                  </p>
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <SimpleLoyaltyTab />
        </main>
      </div>
    </PermissionProviderSimple>
  )
}

function ClientOnlySimpleLoyaltyPage() {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <SimpleLoyaltyPage />
}

const DynamicSimpleLoyaltyPage = dynamic(() => Promise.resolve(ClientOnlySimpleLoyaltyPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function SimpleLoyaltyPageRoute() {
  return (
    <NoSSR fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProtectedRoute>
        <DynamicSimpleLoyaltyPage />
      </ProtectedRoute>
    </NoSSR>
  )
}
