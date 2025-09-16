"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Truck, Package, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function OverviewTab() {
  const { t } = useLanguage()

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
            <div className="text-2xl font-bold">$45,231</div>
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
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">12 {t("onRoute")}</span>, 16 available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("fleetVehicles")}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">32 operational</span>, 3 {t("maintenance")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("deliveriesToday")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">89 {t("completed")}</span>, 67 {t("pending")}
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
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("onTimeDeliveryRate")}</span>
                <span className="font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("customerSatisfaction")}</span>
                <span className="font-medium">4.8/5.0</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("fleetUtilization")}</span>
                <span className="font-medium">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("driverEfficiency")}</span>
                <span className="font-medium">91.3%</span>
              </div>
              <Progress value={91.3} className="h-2" />
            </div>
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
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New driver John Smith registered</p>
                <p className="text-xs text-muted-foreground">2 {t("minutesAgo")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Route optimization completed for Zone A</p>
                <p className="text-xs text-muted-foreground">15 {t("minutesAgo")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Vehicle VH-003 scheduled for maintenance</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly performance report generated</p>
                <p className="text-xs text-muted-foreground">3 {t("hoursAgo")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
