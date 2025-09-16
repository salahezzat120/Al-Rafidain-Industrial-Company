"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { User, Star, Truck, Calendar, Clock, Award, CheckCircle, Save, X, BarChart3, MapPin, Camera, Navigation } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Representative {
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
  joinDate?: string
  licenseNumber?: string
  emergencyContact?: string
  address?: string
  coverageAreas?: string[]
  idImage?: string
}

interface DriverProfileModalProps {
  driver: Representative | null
  isOpen: boolean
  onClose: () => void
  onSave: (driver: Representative) => void
}

export function DriverProfileModal({ driver, isOpen, onClose, onSave }: DriverProfileModalProps) {
  const { t } = useLanguage()
  const [editedDriver, setEditedDriver] = useState<Representative | null>(driver)
  const [isEditing, setIsEditing] = useState(false)

  if (!driver || !editedDriver) return null

  const handleSave = () => {
    onSave(editedDriver)
    setIsEditing(false)
  }

  const performanceData = [
    { label: "On-time Delivery", value: 94, color: "bg-green-500" },
    { label: "Customer Rating", value: 87, color: "bg-blue-500" },
    { label: "Route Efficiency", value: 91, color: "bg-purple-500" },
    { label: "Safety Score", value: 98, color: "bg-yellow-500" },
  ]

  const recentDeliveries = [
    { id: "D001", customer: "John Doe", address: "123 Main St", status: "completed", time: "2 hours ago" },
    { id: "D002", customer: "Jane Smith", address: "456 Oak Ave", status: "completed", time: "4 hours ago" },
    { id: "D003", customer: "Bob Johnson", address: "789 Pine Rd", status: "completed", time: "6 hours ago" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <h2 className="text-xl font-bold">{driver.name}</h2>
                <p className="text-sm text-gray-600">Driver ID: {driver.id}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t("viewProfile")}</TabsTrigger>
            <TabsTrigger value="performance">{t("performance")}</TabsTrigger>
            <TabsTrigger value="coverage">{t("coverage")}</TabsTrigger>
            <TabsTrigger value="history">{t("movementHistory")}</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedDriver.name}
                          onChange={(e) => setEditedDriver({ ...editedDriver, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{driver.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      {isEditing ? (
                        <Select
                          value={editedDriver.status}
                          onValueChange={(value) => setEditedDriver({ ...editedDriver, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-route">On Route</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="mt-1">{driver.status}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedDriver.email}
                        onChange={(e) => setEditedDriver({ ...editedDriver, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedDriver.phone}
                        onChange={(e) => setEditedDriver({ ...editedDriver, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editedDriver.address || ""}
                        onChange={(e) => setEditedDriver({ ...editedDriver, address: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.address || "Not provided"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">Assigned Vehicle</Label>
                    {isEditing ? (
                      <Input
                        id="vehicle"
                        value={editedDriver.vehicle}
                        onChange={(e) => setEditedDriver({ ...editedDriver, vehicle: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.vehicle}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="license">License Number</Label>
                    {isEditing ? (
                      <Input
                        id="license"
                        value={editedDriver.licenseNumber || ""}
                        onChange={(e) => setEditedDriver({ ...editedDriver, licenseNumber: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.licenseNumber || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergency"
                        value={editedDriver.emergencyContact || ""}
                        onChange={(e) => setEditedDriver({ ...editedDriver, emergencyContact: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{driver.emergencyContact || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <Label>Join Date</Label>
                    <p className="text-sm font-medium mt-1">{driver.joinDate || "January 15, 2024"}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{driver.rating}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Total Deliveries</Label>
                      <p className="text-sm font-medium mt-1">{driver.deliveries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceData.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{metric.label}</span>
                        <span className="font-medium">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">156</p>
                      <p className="text-sm text-green-700">Deliveries</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">2,340</p>
                      <p className="text-sm text-blue-700">Miles Driven</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">98.5%</p>
                      <p className="text-sm text-purple-700">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">4.8</p>
                      <p className="text-sm text-yellow-700">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t("coverageAreas")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {driver.coverageAreas && driver.coverageAreas.length > 0 ? (
                      driver.coverageAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t("noCoverageAssigned")}</p>
                        <p className="text-sm">{t("contactAdmin")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {t("idVerification")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {driver.idImage ? (
                      <div className="relative">
                        <img
                          src={driver.idImage}
                          alt="Driver ID"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t("verified")}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t("noIdUploaded")}</p>
                        <p className="text-sm">{t("verificationPending")}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        {t("startLiveTracking")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">#{delivery.id}</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {delivery.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{delivery.customer}</p>
                        <p className="text-xs text-gray-500">{delivery.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{delivery.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm mb-2">{day}</p>
                      <div className="space-y-1">
                        <div className="text-xs bg-green-100 text-green-800 p-1 rounded">9:00 - 17:00</div>
                        {day === "Sat" || day === "Sun" ? (
                          <div className="text-xs bg-gray-100 text-gray-600 p-1 rounded">Off</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
