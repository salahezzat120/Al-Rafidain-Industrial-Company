"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, Clock, Truck, AlertTriangle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock tracking data
const activeDeliveries = [
  {
    id: "D001",
    driver: "John Smith",
    vehicle: "ABC-123",
    customer: "Tech Corp",
    address: "123 Business St",
    status: "in_transit",
    estimatedArrival: "14:30",
    currentLocation: "Main St & 5th Ave",
    progress: 75,
  },
  {
    id: "D002",
    driver: "Sarah Wilson",
    vehicle: "XYZ-789",
    customer: "Global Inc",
    address: "456 Corporate Blvd",
    status: "pickup",
    estimatedArrival: "15:15",
    currentLocation: "Warehouse District",
    progress: 25,
  },
  {
    id: "D003",
    driver: "Mike Johnson",
    vehicle: "DEF-456",
    customer: "Local Store",
    address: "789 Retail Ave",
    status: "delivered",
    estimatedArrival: "13:45",
    currentLocation: "789 Retail Ave",
    progress: 100,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "pickup":
      return "bg-blue-100 text-blue-800"
    case "in_transit":
      return "bg-yellow-100 text-yellow-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "delayed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pickup":
      return <Navigation className="h-4 w-4" />
    case "in_transit":
      return <Truck className="h-4 w-4" />
    case "delivered":
      return <CheckCircle className="h-4 w-4" />
    case "delayed":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

export function TrackingTab() {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("liveTracking")}</h2>
          <p className="text-gray-600">{t("realTimeMonitoring")}</p>
        </div>
        <Button variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          {t("fullMapView")}
        </Button>
      </div>

      {/* Tracking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("activeDeliveries")}</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Navigation className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("inTransit")}</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("completedToday")}</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("delayed")}</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">{t("liveTracking")}</TabsTrigger>
          <TabsTrigger value="routes">{t("routeOptimization")}</TabsTrigger>
          <TabsTrigger value="history">{t("deliveryHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Placeholder */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{t("liveMap")}</CardTitle>
                <CardDescription>{t("realTimeRepresentativeLocations")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t("interactiveMapPlaceholder")}</p>
                    <p className="text-sm text-gray-400">{t("showingRealTimeLocations")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Deliveries List */}
            <Card>
              <CardHeader>
                <CardTitle>{t("activeDeliveries")}</CardTitle>
                <CardDescription>{t("currentlyInProgress")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDelivery === delivery.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDelivery(delivery.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(delivery.status)}
                          <span className="font-medium">{delivery.driver}</span>
                          <Badge className={getStatusColor(delivery.status)}>
                            {t(delivery.status as keyof typeof t)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{delivery.vehicle}</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{delivery.customer}</p>
                          <p className="text-sm text-gray-600">{delivery.address}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {t("eta")}: {delivery.estimatedArrival}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${delivery.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{delivery.progress}%</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {delivery.currentLocation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("routeOptimization")}</CardTitle>
              <CardDescription>{t("optimizeDeliveryRoutes")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t("routeOptimizationTools")}</p>
                <p className="text-sm text-gray-400">{t("aiPoweredRoutePlanning")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("deliveryHistory")}</CardTitle>
              <CardDescription>{t("pastDeliveryRecords")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t("deliveryHistoryAnalytics")}</p>
                <p className="text-sm text-gray-400">{t("historicalDataMetrics")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
