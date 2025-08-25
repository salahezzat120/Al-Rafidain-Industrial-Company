"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, DollarSign, Star, MapPin, Fuel } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function DriverStats() {
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
          <CardTitle className="text-sm font-medium">{t("driver.todayDeliveries")}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.todayDeliveries}</div>
          <p className="text-xs text-muted-foreground">
            {t("driver.total")}: {stats.totalDeliveries} {t("driver.deliveries")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("driver.todayEarnings")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${stats.earnings}</div>
          <p className="text-xs text-muted-foreground">+$23.50 {t("driver.fromYesterday")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("driver.driverRating")}</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.rating}</div>
          <p className="text-xs text-muted-foreground">{t("driver.basedOnReviews")} 156</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("driver.hoursWorked")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hoursWorked}h</div>
          <p className="text-xs text-muted-foreground">
            {t("driver.target")}: 8h {t("driver.today")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("driver.milesDriven")}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.milesdriven}</div>
          <p className="text-xs text-muted-foreground">
            {t("driver.avg")}: 12.5 {t("driver.milesPerDelivery")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("driver.vehicleStatus")}</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {t("driver.good")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("driver.fuel")}: 75% | {t("driver.nextService")}: 2 {t("driver.days")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
