"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Truck, Navigation, Clock, Fuel } from "lucide-react"

interface TrackVehiclesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TrackVehiclesModal({ isOpen, onClose }: TrackVehiclesModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock vehicle data
  const vehicles = [
    {
      id: "V001",
      driver: "John Smith",
      location: "Downtown - 5th & Main St",
      status: "in-transit",
      speed: "35 mph",
      destination: "ABC Corp",
      eta: "12 min",
      fuel: "78%",
      lastUpdate: "2 min ago",
    },
    {
      id: "V002",
      driver: "Sarah Johnson",
      location: "North Side - Oak Avenue",
      status: "delivering",
      speed: "0 mph",
      destination: "XYZ Store",
      eta: "On site",
      fuel: "65%",
      lastUpdate: "1 min ago",
    },
    {
      id: "V003",
      driver: "Mike Wilson",
      location: "East End - Industrial Park",
      status: "available",
      speed: "0 mph",
      destination: "Warehouse",
      eta: "-",
      fuel: "92%",
      lastUpdate: "5 min ago",
    },
    {
      id: "V004",
      driver: "Lisa Brown",
      location: "South District - Commerce St",
      status: "in-transit",
      speed: "28 mph",
      destination: "Tech Solutions",
      eta: "8 min",
      fuel: "45%",
      lastUpdate: "30 sec ago",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "in-transit":
        return "bg-blue-100 text-blue-800"
      case "delivering":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFuelColor = (fuel: string) => {
    const fuelLevel = Number.parseInt(fuel)
    if (fuelLevel > 50) return "text-green-600"
    if (fuelLevel > 25) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Track Vehicles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by vehicle ID, driver, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.id}</h3>
                        <p className="text-sm text-gray-600">{vehicle.driver}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Current Location</p>
                        <p className="text-sm text-gray-600">{vehicle.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-gray-600">{vehicle.destination}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Speed</p>
                        <p className="text-sm font-medium">{vehicle.speed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">ETA</p>
                        <p className="text-sm font-medium flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {vehicle.eta}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Fuel</p>
                        <p
                          className={`text-sm font-medium flex items-center justify-center gap-1 ${getFuelColor(vehicle.fuel)}`}
                        >
                          <Fuel className="h-3 w-3" />
                          {vehicle.fuel}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">Last updated: {vehicle.lastUpdate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <MapPin className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Navigation className="h-3 w-3 mr-1" />
                      Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
