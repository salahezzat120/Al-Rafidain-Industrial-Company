"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone, Navigation, CheckCircle, Package } from "lucide-react"
import { useState } from "react"

export function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState([
    {
      id: "DEL-001",
      customer: "John Smith",
      address: "123 Main St, Downtown",
      phone: "+1 (555) 123-4567",
      priority: "high",
      estimatedTime: "2:30 PM",
      status: "pending",
      distance: "2.3 miles",
      items: 3,
    },
    {
      id: "DEL-002",
      customer: "Sarah Johnson",
      address: "456 Oak Ave, Midtown",
      phone: "+1 (555) 987-6543",
      priority: "medium",
      estimatedTime: "3:15 PM",
      status: "pending",
      distance: "1.8 miles",
      items: 1,
    },
    {
      id: "DEL-003",
      customer: "Mike Wilson",
      address: "789 Pine St, Uptown",
      phone: "+1 (555) 456-7890",
      priority: "low",
      estimatedTime: "4:00 PM",
      status: "pending",
      distance: "3.1 miles",
      items: 2,
    },
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const markAsCompleted = (id: string) => {
    setDeliveries((prev) =>
      prev.map((delivery) => (delivery.id === id ? { ...delivery, status: "completed" } : delivery)),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Assigned Deliveries ({deliveries.filter((d) => d.status === "pending").length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className={`p-4 border rounded-lg ${delivery.status === "completed" ? "bg-green-50 border-green-200" : "bg-white"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{delivery.customer}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {delivery.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getPriorityColor(delivery.priority)}>
                    {delivery.priority.toUpperCase()}
                  </Badge>
                  {delivery.status === "completed" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      COMPLETED
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-3 w-3" />
                  {delivery.estimatedTime}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Navigation className="h-3 w-3" />
                  {delivery.distance}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Package className="h-3 w-3" />
                  {delivery.items} items
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Phone className="h-3 w-3" />
                  {delivery.phone}
                </div>
              </div>

              {delivery.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => markAsCompleted(delivery.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
