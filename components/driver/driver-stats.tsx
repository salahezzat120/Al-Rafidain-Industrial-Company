"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, DollarSign, Star, MapPin, Fuel } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function RepresentativeStats() {
  const { t } = useLanguage()

  const stats = {
    todayDeliveries: 8,
    totalDeliveries: 247,
    earnings: 156.5,
    rating: 4.8,
    hoursWorked: 6.5,
    milesdriven: 89,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("representative.todayDeliveries")}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.todayDeliveries}</div>
          <p className="text-xs text-muted-foreground">
            {t("representative.total")}: {stats.totalDeliveries} {t("representative.deliveries")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("representative.todayEarnings")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${stats.earnings}</div>
          <p className="text-xs text-muted-foreground">+$23.50 {t("representative.fromYesterday")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("representative.hoursWorked")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.hoursWorked} {t("representative.hours")}</div>
          <p className="text-xs text-muted-foreground">{t("representative.milesDriven")}: {stats.milesdriven}</p>
        </CardContent>
      </Card>
    </div>
  )
}
