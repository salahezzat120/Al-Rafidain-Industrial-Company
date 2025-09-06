"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Speed, 
  Route, 
  Phone, 
  MessageCircle,
  RefreshCw,
  Play,
  Pause,
  Square
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  status: string
  location: string
  rating: number
  deliveries: number
  vehicle: string
  avatar?: string
  currentLocation?: {
    lat: number
    lng: number
    address: string
    timestamp: string
  }
  isOnline?: boolean
  speed?: number
  heading?: number
}

interface LiveTrackingModalProps {
  driver: Driver | null
  isOpen: boolean
  onClose: () => void
}

export function LiveTrackingModal({ driver, isOpen, onClose }: LiveTrackingModalProps) {
  const { t } = useLanguage()
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number
    lng: number
    address: string
    timestamp: string
  } | null>(null)
  const [movementHistory, setMovementHistory] = useState<Array<{
    lat: number
    lng: number
    address: string
    timestamp: string
    speed: number
  }>>([])

  // Mock GPS data - in real implementation, this would come from the driver's device
  const mockLocations = [
    { lat: 33.3152, lng: 44.3661, address: "Al-Mansour District, Baghdad", speed: 45 },
    { lat: 33.3200, lng: 44.3700, address: "Karrada Street, Baghdad", speed: 30 },
    { lat: 33.3250, lng: 44.3750, address: "Al-Rusafa, Baghdad", speed: 55 },
    { lat: 33.3300, lng: 44.3800, address: "Al-Karkh District, Baghdad", speed: 25 },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking && driver) {
      // Simulate real-time location updates
      interval = setInterval(() => {
        const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]
        const newLocation = {
          ...randomLocation,
          timestamp: new Date().toLocaleTimeString(),
        }
        
        setCurrentLocation(newLocation)
        setMovementHistory(prev => [newLocation, ...prev.slice(0, 49)]) // Keep last 50 locations
      }, 3000) // Update every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, driver])

  const startTracking = () => {
    setIsTracking(true)
    // In real implementation, this would start GPS tracking on driver's device
  }

  const stopTracking = () => {
    setIsTracking(false)
    // In real implementation, this would stop GPS tracking
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-route":
        return "bg-blue-100 text-blue-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!driver) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                <AvatarFallback>
                  {driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">Live Tracking - {driver.name}</h2>
                <p className="text-sm text-gray-600">Driver ID: {driver.id}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isTracking ? (
                <Button onClick={stopTracking} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  {t("stopTracking")}
                </Button>
              ) : (
                <Button onClick={startTracking} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  {t("startLiveTracking")}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">{t("liveLocationMap")}</TabsTrigger>
            <TabsTrigger value="history">{t("movementHistory")}</TabsTrigger>
            <TabsTrigger value="details">{t("viewProfile")}</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Map Placeholder */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("liveLocationMap")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">{t("interactiveMapView")}</p>
                        <p className="text-sm text-gray-500">
                          {isTracking ? t("trackingActive") : t("startTracking")}
                        </p>
                        {currentLocation && (
                          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                            <p className="font-medium">{t("currentLocation")}</p>
                            <p className="text-sm text-gray-600">{currentLocation.address}</p>
                            <p className="text-xs text-gray-500">{t("updated")} {currentLocation.timestamp}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Status Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      {t("liveStatus")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("common.status")}:</span>
                      <Badge className={getStatusColor(driver.status)}>
                        {driver.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("tracking")}:</span>
                      <Badge variant={isTracking ? "default" : "secondary"}>
                        {isTracking ? t("active") : t("inactive")}
                      </Badge>
                    </div>

                    {currentLocation && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t("speed")}</span>
                          <span className="text-sm">{currentLocation.speed} km/h</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t("lastUpdate")}</span>
                          <span className="text-sm">{currentLocation.timestamp}</span>
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          {t("call")}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {t("message")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      {t("vehicleInfo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t("vehicle")}:</span>
                      <span className="text-sm font-medium">{driver.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("avgRating")}:</span>
                      <span className="text-sm font-medium">{driver.rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("deliveries")}:</span>
                      <span className="text-sm font-medium">{driver.deliveries}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t("movementHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {movementHistory.length > 0 ? (
                    movementHistory.map((location, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{location.address}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{location.timestamp}</span>
                            <span className="flex items-center gap-1">
                              <Speed className="h-3 w-3" />
                              {location.speed} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>{t("noMovementHistory")}</p>
                      <p className="text-sm">{t("startTrackingToSee")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("personalInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{t("auth.email")}</p>
                    <p className="text-sm text-gray-600">{driver.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("phoneNumber")}</p>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("address")}</p>
                    <p className="text-sm text-gray-600">{driver.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("performance")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{t("avgRating")}</p>
                    <p className="text-sm text-gray-600">{driver.rating}/5.0</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("deliveries")}</p>
                    <p className="text-sm text-gray-600">{driver.deliveries}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("vehicle")}</p>
                    <p className="text-sm text-gray-600">{driver.vehicle}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
