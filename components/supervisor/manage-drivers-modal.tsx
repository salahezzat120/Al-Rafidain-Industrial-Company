"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Phone, MapPin, Clock, MessageSquare } from "lucide-react"
import { getDrivers } from "@/lib/supabase-utils"

interface ManageRepresentativesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ManageRepresentativesModal({ isOpen, onClose }: ManageRepresentativesModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [drivers, setDrivers] = useState<any[]>([])

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await getDrivers()
      if (error) {
        console.error('Error fetching drivers:', error)
      } else {
        setDrivers(data || [])
      }
    }

    fetchDrivers()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "on-route":
        return "bg-blue-100 text-blue-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Manage Drivers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search drivers by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
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
                        <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {driver.phone}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(driver.status)}>{driver.status}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location:
                      </span>
                      <span className="font-medium">{driver.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Deliveries:</span>
                      <span className="font-medium">{driver.currentDeliveries}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Completed Today:
                      </span>
                      <span className="font-medium">{driver.completedToday}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <MapPin className="h-3 w-3 mr-1" />
                      Track
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
