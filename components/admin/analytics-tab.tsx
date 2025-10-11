"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { 
  getAnalyticsKPIs, 
  getDriverPerformance, 
  getDeliveryTrends, 
  getRevenueAnalytics,
  getPaymentAnalytics,
  getPaymentStatusSummary,
  getProductAnalytics,
  getProductStockAnalytics,
  getAttendanceAnalytics,
  getAttendanceTrends,
  getCustomerAnalytics,
  getCustomerBehaviorMetrics,
  type AnalyticsKPIs,
  type DriverPerformanceData,
  type DeliveryTrend,
  type RevenueAnalytics
} from "@/lib/analytics"

export function AnalyticsTab() {
  const { t, isRTL } = useLanguage()
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null)
  const [driverPerformance, setDriverPerformance] = useState<DriverPerformanceData[]>([])
  const [deliveryTrends, setDeliveryTrends] = useState<DeliveryTrend[]>([])
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics[]>([])
  const [paymentAnalytics, setPaymentAnalytics] = useState<any>(null)
  const [paymentStatusSummary, setPaymentStatusSummary] = useState<any>(null)
  const [productAnalytics, setProductAnalytics] = useState<any>(null)
  const [productStockAnalytics, setProductStockAnalytics] = useState<any>(null)
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>(null)
  const [attendanceTrends, setAttendanceTrends] = useState<any>(null)
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null)
  const [customerBehaviorMetrics, setCustomerBehaviorMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('📊 Loading analytics data...')

      // Load all analytics data in parallel
      const [kpisResult, driversResult, trendsResult, revenueResult, paymentResult, paymentStatusResult, productResult, productStockResult, attendanceResult, attendanceTrendsResult, customerResult, customerBehaviorResult] = await Promise.all([
        getAnalyticsKPIs(),
        getDriverPerformance(),
        getDeliveryTrends(),
        getRevenueAnalytics(),
        getPaymentAnalytics(),
        getPaymentStatusSummary(),
        getProductAnalytics(),
        getProductStockAnalytics(),
        getAttendanceAnalytics(),
        getAttendanceTrends(),
        getCustomerAnalytics(),
        getCustomerBehaviorMetrics()
      ])

      // Handle KPIs
      if (kpisResult.error) {
        console.error('❌ Error loading KPIs:', kpisResult.error)
        setError(kpisResult.error)
      } else {
        setKpis(kpisResult.data)
      }

      // Handle driver performance
      if (driversResult.error) {
        console.error('❌ Error loading driver performance:', driversResult.error)
      } else {
        setDriverPerformance(driversResult.data || [])
      }

      // Handle delivery trends
      if (trendsResult.error) {
        console.error('❌ Error loading delivery trends:', trendsResult.error)
      } else {
        setDeliveryTrends(trendsResult.data || [])
      }

      // Handle revenue analytics
      if (revenueResult.error) {
        console.error('❌ Error loading revenue analytics:', revenueResult.error)
      } else {
        setRevenueAnalytics(revenueResult.data || [])
      }

      // Handle payment analytics
      if (paymentResult.error) {
        console.error('❌ Error loading payment analytics:', paymentResult.error)
      } else {
        setPaymentAnalytics(paymentResult.data)
      }

      // Handle payment status summary
      if (paymentStatusResult.error) {
        console.error('❌ Error loading payment status summary:', paymentStatusResult.error)
      } else {
        setPaymentStatusSummary(paymentStatusResult.data)
      }

      // Handle product analytics
      if (productResult.error) {
        console.error('❌ Error loading product analytics:', productResult.error)
      } else {
        setProductAnalytics(productResult.data)
      }

      // Handle product stock analytics
      if (productStockResult.error) {
        console.error('❌ Error loading product stock analytics:', productStockResult.error)
      } else {
        setProductStockAnalytics(productStockResult.data)
      }

      // Handle attendance analytics
      if (attendanceResult.error) {
        console.error('❌ Error loading attendance analytics:', attendanceResult.error)
      } else {
        setAttendanceAnalytics(attendanceResult.data)
      }

      // Handle attendance trends
      if (attendanceTrendsResult.error) {
        console.error('❌ Error loading attendance trends:', attendanceTrendsResult.error)
      } else {
        setAttendanceTrends(attendanceTrendsResult.data)
      }

      // Handle customer analytics
      if (customerResult.error) {
        console.error('❌ Error loading customer analytics:', customerResult.error)
      } else {
        setCustomerAnalytics(customerResult.data)
      }

      // Handle customer behavior metrics
      if (customerBehaviorResult.error) {
        console.error('❌ Error loading customer behavior metrics:', customerBehaviorResult.error)
      } else {
        setCustomerBehaviorMetrics(customerBehaviorResult.data)
      }

      console.log('✅ Analytics data loaded successfully')

    } catch (error) {
      console.error('❌ Error loading analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const handleRefresh = () => {
    loadAnalyticsData(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("analyticsDashboard")}</h2>
        <p className="text-gray-600">{t("performanceInsights")}</p>
      </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-800">
              <div className="text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("totalDeliveries")}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.totalDeliveries)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("revenue")}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.2%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                  <p className="text-sm font-medium text-gray-600">{t("activeDrivers")}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.activeDrivers}</p>
                    <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+2</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("avgDeliveryTime")}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.avgDeliveryTime} min</p>
                  <div className="flex items-center mt-1">
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-3.1%</span>
                  </div>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
      </div>
      ) : null}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="performance">{t("driverPerformance")}</TabsTrigger>
          <TabsTrigger value="payments">{t("paymentAnalytics")}</TabsTrigger>
          <TabsTrigger value="products">{t("productAnalytics")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("attendanceAnalytics")}</TabsTrigger>
          <TabsTrigger value="customers">{t("customerInsights")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">

          {/* Real Analytics Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("customerSummary")}</CardTitle>
                <CardDescription>{t("customerOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {customerAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{customerAnalytics.summary.totalCustomers}</p>
                        <p className="text-xs text-gray-600">{t("totalCustomers")}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{customerAnalytics.summary.activeCustomers}</p>
                        <p className="text-xs text-gray-600">{t("activeCustomers")}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalSpent")}</p>
                          <p className="text-lg font-bold">${customerAnalytics.summary.totalSpent}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("averageRating")}</p>
                          <p className="text-lg font-bold">{customerAnalytics.summary.averageRating}/5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{t("noCustomerData")}</p>
                </div>
                )}
              </CardContent>
            </Card>

            {/* Product Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("productSummary")}</CardTitle>
                <CardDescription>{t("productOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {productAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xl font-bold text-purple-600">{productAnalytics.summary.totalProducts}</p>
                        <p className="text-xs text-gray-600">{t("totalProducts")}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xl font-bold text-orange-600">{productAnalytics.summary.activeProducts}</p>
                        <p className="text-xs text-gray-600">{t("activeProducts")}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalStockValue")}</p>
                          <p className="text-lg font-bold">${productAnalytics.summary.totalStockValue}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("lowStock")}</p>
                          <p className="text-lg font-bold">{productAnalytics.summary.lowStock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{t("noProductData")}</p>
                </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("attendanceSummary")}</CardTitle>
                <CardDescription>{t("attendanceOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{attendanceAnalytics.summary.checkedInRecords}</p>
                        <p className="text-xs text-gray-600">{t("checkedInRecords")}</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-xl font-bold text-yellow-600">{attendanceAnalytics.summary.checkedOutRecords}</p>
                        <p className="text-xs text-gray-600">{t("checkedOutRecords")}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalHours")}</p>
                          <p className="text-lg font-bold">{attendanceAnalytics.summary.totalHours}h</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("averageHoursPerDay")}</p>
                          <p className="text-lg font-bold">{attendanceAnalytics.summary.averageHoursPerDay}h</p>
                        </div>
                      </div>
                </div>
                </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{t("noAttendanceData")}</p>
                </div>
                )}
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
              {driverPerformance.length > 0 ? (
              <div className="space-y-4">
                  {driverPerformance.map((driver, index) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                          <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-gray-500">
                          {driver.deliveries} {t("deliveries")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                          <p className="font-medium">{driver.rating.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">{t("rating")}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{driver.onTime}%</p>
                        <p className="text-xs text-gray-500">{t("onTime")}</p>
                      </div>
                        <div className="text-center">
                          <p className="font-medium">{driver.avgDeliveryTime} min</p>
                          <p className="text-xs text-gray-500">Avg Time</p>
                      </div>
                      <Badge variant={driver.onTime >= 95 ? "default" : "secondary"}>
                        {driver.onTime >= 95 ? t("excellent") : t("good")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No driver performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("paymentStatusSummary")}</CardTitle>
                <CardDescription>{t("paymentStatusOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentStatusSummary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{paymentStatusSummary.completed}</p>
                        <p className="text-sm text-gray-600">{t("completed")}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{paymentStatusSummary.pending}</p>
                        <p className="text-sm text-gray-600">{t("pending")}</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{paymentStatusSummary.failed}</p>
                        <p className="text-sm text-gray-600">{t("failed")}</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{paymentStatusSummary.refunded}</p>
                        <p className="text-sm text-gray-600">{t("refunded")}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t("successRate")}</span>
                        <span className="text-sm font-bold">{paymentStatusSummary.successRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${paymentStatusSummary.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noPaymentData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t("paymentMethodDistribution")}</CardTitle>
                <CardDescription>{t("paymentMethodsBreakdown")}</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentAnalytics?.methodDistribution && paymentAnalytics.methodDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {paymentAnalytics.methodDistribution.map((method: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                          <span className="font-medium">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{method.count} {t("payments")}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(method.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noPaymentMethodData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("productSummary")}</CardTitle>
                <CardDescription>{t("productOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {productAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{productAnalytics.summary.totalProducts}</p>
                        <p className="text-sm text-gray-600">{t("totalProducts")}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{productAnalytics.summary.activeProducts}</p>
                        <p className="text-sm text-gray-600">{t("activeProducts")}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{productAnalytics.summary.lowStockProducts}</p>
                        <p className="text-sm text-gray-600">{t("lowStockProducts")}</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{productAnalytics.summary.outOfStockProducts}</p>
                        <p className="text-sm text-gray-600">{t("outOfStockProducts")}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalStockValue")}</p>
                          <p className="text-lg font-bold">{formatCurrency(productAnalytics.summary.totalSellingValue)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalCostValue")}</p>
                          <p className="text-lg font-bold">{formatCurrency(productAnalytics.summary.totalCostValue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noProductData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Levels */}
            <Card>
              <CardHeader>
                <CardTitle>{t("stockLevels")}</CardTitle>
                <CardDescription>{t("stockLevelBreakdown")}</CardDescription>
              </CardHeader>
              <CardContent>
                {productStockAnalytics?.stockLevels ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{productStockAnalytics.stockLevels.outOfStock}</p>
                        <p className="text-sm text-gray-600">{t("outOfStock")}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{productStockAnalytics.stockLevels.lowStock}</p>
                        <p className="text-sm text-gray-600">{t("lowStock")}</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{productStockAnalytics.stockLevels.mediumStock}</p>
                        <p className="text-sm text-gray-600">{t("mediumStock")}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{productStockAnalytics.stockLevels.highStock}</p>
                        <p className="text-sm text-gray-600">{t("highStock")}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t("potentialProfit")}</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(productStockAnalytics.potentialProfit)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noStockData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Groups Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t("productGroupsDistribution")}</CardTitle>
              <CardDescription>{t("productsByMainGroup")}</CardDescription>
            </CardHeader>
            <CardContent>
              {productAnalytics?.distributions?.mainGroups && productAnalytics.distributions.mainGroups.length > 0 ? (
                <div className="space-y-4">
                  {productAnalytics.distributions.mainGroups.slice(0, 10).map((group: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 40}, 70%, 50%)` }}></div>
                        <span className="font-medium">{group.group}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{group.count} {t("products")}</p>
                        <p className="text-sm text-gray-600">{Math.round(group.percentage * 10) / 10}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noGroupData")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products by Value */}
          <Card>
            <CardHeader>
              <CardTitle>{t("topProductsByValue")}</CardTitle>
              <CardDescription>{t("highestValueProducts")}</CardDescription>
            </CardHeader>
            <CardContent>
              {productAnalytics?.topProducts && productAnalytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {productAnalytics.topProducts.slice(0, 10).map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{t("stock")}: {product.stock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.totalValue)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(product.sellingPrice)} {t("perUnit")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noTopProductsData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("attendanceSummary")}</CardTitle>
                <CardDescription>{t("attendanceOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{attendanceAnalytics.summary.totalRecords}</p>
                        <p className="text-sm text-gray-600">{t("totalRecords")}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{attendanceAnalytics.summary.checkedInRecords}</p>
                        <p className="text-sm text-gray-600">{t("checkedInRecords")}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{attendanceAnalytics.summary.checkedOutRecords}</p>
                        <p className="text-sm text-gray-600">{t("checkedOutRecords")}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{attendanceAnalytics.summary.breakRecords}</p>
                        <p className="text-sm text-gray-600">{t("breakRecords")}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalHours")}</p>
                          <p className="text-lg font-bold">{attendanceAnalytics.summary.totalHours}h</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("averageHoursPerDay")}</p>
                          <p className="text-lg font-bold">{attendanceAnalytics.summary.averageHoursPerDay}h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noAttendanceData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t("attendanceStatusDistribution")}</CardTitle>
                <CardDescription>{t("attendanceStatusBreakdown")}</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceAnalytics?.statusDistribution ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t("checkedIn")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{attendanceAnalytics.statusDistribution.checkedIn}</p>
                          <p className="text-sm text-gray-600">{t("records")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">{t("checkedOut")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{attendanceAnalytics.statusDistribution.checkedOut}</p>
                          <p className="text-sm text-gray-600">{t("records")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="font-medium">{t("onBreak")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{attendanceAnalytics.statusDistribution.onBreak}</p>
                          <p className="text-sm text-gray-600">{t("records")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noStatusData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Representative Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{t("representativePerformance")}</CardTitle>
              <CardDescription>{t("attendancePerformanceByRepresentative")}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceAnalytics?.representativeStats && attendanceAnalytics.representativeStats.length > 0 ? (
                <div className="space-y-4">
                  {attendanceAnalytics.representativeStats.slice(0, 10).map((rep: any, index: number) => (
                    <div key={rep.representativeId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{rep.name}</p>
                          <p className="text-sm text-gray-600">{t("totalRecords")}: {rep.totalRecords}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{rep.totalHours}h</p>
                        <p className="text-sm text-gray-600">{rep.averageHours}h {t("average")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noRepresentativeData")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Trends (Last 7 Days) */}
          <Card>
            <CardHeader>
              <CardTitle>{t("attendanceTrends")}</CardTitle>
              <CardDescription>{t("last7DaysAttendanceTrends")}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceTrends && attendanceTrends.length > 0 ? (
                <div className="space-y-4">
                  {attendanceTrends.map((day: any, index: number) => (
                    <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">{day.dayName}</span>
                        </div>
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{day.uniqueRepresentatives} {t("representatives")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{day.totalHours}h</p>
                        <p className="text-sm text-gray-600">{day.checkIns} {t("checkIns")}, {day.checkOuts} {t("checkOuts")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noTrendsData")}</p>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("customerSummary")}</CardTitle>
                <CardDescription>{t("customerOverview")}</CardDescription>
              </CardHeader>
              <CardContent>
                {customerAnalytics?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{customerAnalytics.summary.totalCustomers}</p>
                        <p className="text-sm text-gray-600">{t("totalCustomers")}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{customerAnalytics.summary.activeCustomers}</p>
                        <p className="text-sm text-gray-600">{t("activeCustomers")}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{customerAnalytics.summary.vipCustomers}</p>
                        <p className="text-sm text-gray-600">{t("vipCustomers")}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{customerAnalytics.summary.recentCustomers}</p>
                        <p className="text-sm text-gray-600">{t("recentCustomers")}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("totalSpent")}</p>
                          <p className="text-lg font-bold">${customerAnalytics.summary.totalSpent}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t("averageRating")}</p>
                          <p className="text-lg font-bold">{customerAnalytics.summary.averageRating}/5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noCustomerData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t("customerStatusDistribution")}</CardTitle>
                <CardDescription>{t("customerStatusBreakdown")}</CardDescription>
              </CardHeader>
              <CardContent>
                {customerAnalytics?.statusDistribution ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t("active")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{customerAnalytics.statusDistribution.active}</p>
                          <p className="text-sm text-gray-600">{t("customers")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">{t("vip")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{customerAnalytics.statusDistribution.vip}</p>
                          <p className="text-sm text-gray-600">{t("customers")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="font-medium">{t("inactive")}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{customerAnalytics.statusDistribution.inactive}</p>
                          <p className="text-sm text-gray-600">{t("customers")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noStatusData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t("customerRatingDistribution")}</CardTitle>
              <CardDescription>{t("customerRatingBreakdown")}</CardDescription>
            </CardHeader>
            <CardContent>
              {customerAnalytics?.ratingDistribution ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{customerAnalytics.ratingDistribution.excellent}</p>
                      <p className="text-sm text-gray-600">{t("excellent")} (4.5+)</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{customerAnalytics.ratingDistribution.good}</p>
                      <p className="text-sm text-gray-600">{t("good")} (3.5-4.4)</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{customerAnalytics.ratingDistribution.average}</p>
                      <p className="text-sm text-gray-600">{t("average")} (2.5-3.4)</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{customerAnalytics.ratingDistribution.poor}</p>
                      <p className="text-sm text-gray-600">{t("poor")} (1.0-2.4)</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">{customerAnalytics.ratingDistribution.noRating}</p>
                      <p className="text-sm text-gray-600">{t("noRating")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noRatingData")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers by Spending */}
          <Card>
            <CardHeader>
              <CardTitle>{t("topCustomersBySpending")}</CardTitle>
              <CardDescription>{t("topCustomersBySpendingDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {customerAnalytics?.topCustomersBySpending && customerAnalytics.topCustomersBySpending.length > 0 ? (
                <div className="space-y-4">
                  {customerAnalytics.topCustomersBySpending.slice(0, 10).map((customer: any, index: number) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${customer.totalSpent}</p>
                        <p className="text-sm text-gray-600">{customer.totalOrders} {t("orders")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noTopCustomersData")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>{t("customerSegments")}</CardTitle>
              <CardDescription>{t("customerSegmentsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {customerBehaviorMetrics?.segments ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{customerBehaviorMetrics.segments.highValue}</p>
                    <p className="text-sm text-gray-600">{t("highValue")}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{customerBehaviorMetrics.segments.frequent}</p>
                    <p className="text-sm text-gray-600">{t("frequent")}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{customerBehaviorMetrics.segments.loyal}</p>
                    <p className="text-sm text-gray-600">{t("loyal")}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{customerBehaviorMetrics.segments.atRisk}</p>
                    <p className="text-sm text-gray-600">{t("atRisk")}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{customerBehaviorMetrics.segments.new}</p>
                    <p className="text-sm text-gray-600">{t("new")}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("noSegmentsData")}</p>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}
