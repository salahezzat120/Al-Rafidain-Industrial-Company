"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Clock,
  DollarSign,
  Truck,
  MapPin,
  Star,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock analytics data
const kpiData = [
  {
    title: "totalDeliveries",
    value: "1,234",
    change: "+12.5%",
    trend: "up",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "revenue",
    value: "$45,678",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "activeDrivers",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "avgDeliveryTime",
    value: "28 min",
    change: "-3.1%",
    trend: "down",
    icon: Clock,
    color: "text-orange-600",
  },
]

const performanceData = [
  { driver: "John Smith", deliveries: 45, rating: 4.8, onTime: 96 },
  { driver: "Sarah Wilson", deliveries: 42, rating: 4.9, onTime: 98 },
  { driver: "Mike Johnson", deliveries: 38, rating: 4.7, onTime: 94 },
  { driver: "Emma Davis", deliveries: 41, rating: 4.6, onTime: 92 },
  { driver: "Tom Brown", deliveries: 35, rating: 4.5, onTime: 89 },
]

export function AnalyticsTab() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("analyticsDashboard")}</h2>
        <p className="text-gray-600">{t("performanceInsights")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t(kpi.title as keyof typeof t)}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <div className="flex items-center mt-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="performance">{t("driverPerformance")}</TabsTrigger>
          <TabsTrigger value="routes">{t("routeAnalytics")}</TabsTrigger>
          <TabsTrigger value="customers">{t("customerInsights")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t("deliveryTrends")}</CardTitle>
                <CardDescription>{t("dailyDeliveryVolume")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t("deliveryTrendsChart")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t("revenueAnalytics")}</CardTitle>
                <CardDescription>{t("monthlyRevenueBreakdown")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t("revenueAnalyticsChart")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                  <p className="text-sm text-gray-600">{t("onTimeDeliveryRate")}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">4.7</p>
                  <p className="text-sm text-gray-600">{t("avgCustomerRating")}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">15.2 km</p>
                  <p className="text-sm text-gray-600">{t("avgDistancePerDelivery")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("driverPerformanceLeaderboard")}</CardTitle>
              <CardDescription>{t("topPerformingDrivers")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{driver.driver}</p>
                        <p className="text-sm text-gray-500">
                          {driver.deliveries} {t("deliveries")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="font-medium">{driver.rating}</p>
                        <p className="text-xs text-gray-500">{t("rating")}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{driver.onTime}%</p>
                        <p className="text-xs text-gray-500">{t("onTime")}</p>
                      </div>
                      <Badge variant={driver.onTime >= 95 ? "default" : "secondary"}>
                        {driver.onTime >= 95 ? t("excellent") : t("good")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("routeEfficiency")}</CardTitle>
              <CardDescription>{t("routeAnalysisOptimization")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t("routeAnalyticsPlaceholder")}</p>
                <p className="text-sm text-gray-400">{t("routeEfficiencyMetrics")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("customerInsights")}</CardTitle>
              <CardDescription>{t("customerBehaviorMetrics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t("customerInsightsPlaceholder")}</p>
                <p className="text-sm text-gray-400">{t("customerSatisfactionAnalytics")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
