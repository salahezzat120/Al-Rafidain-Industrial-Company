"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Star, Truck, Filter, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DriverProfileModal } from "./driver-profile-modal"
import { AddDriverModal } from "./add-driver-modal"
import { useLanguage } from "@/contexts/language-context"

const mockDrivers = [
  {
    id: "1",
    name: "Mike Johnson",
    email: "mike.johnson@delivery.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    location: "Downtown District",
    rating: 4.8,
    deliveries: 156,
    vehicle: "VH-001",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "January 15, 2024",
    licenseNumber: "DL123456789",
    emergencyContact: "Jane Johnson - (555) 987-6543",
    address: "123 Main St, City, State 12345",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah.wilson@delivery.com",
    phone: "+1 (555) 234-5678",
    status: "on-route",
    location: "North Zone",
    rating: 4.9,
    deliveries: 203,
    vehicle: "VH-007",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "December 3, 2023",
    licenseNumber: "DL987654321",
    emergencyContact: "Tom Wilson - (555) 876-5432",
    address: "456 Oak Ave, City, State 12345",
  },
  {
    id: "3",
    name: "David Chen",
    email: "david.chen@delivery.com",
    phone: "+1 (555) 345-6789",
    status: "offline",
    location: "East District",
    rating: 4.6,
    deliveries: 89,
    vehicle: "VH-012",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "March 20, 2024",
    licenseNumber: "DL456789123",
    emergencyContact: "Lisa Chen - (555) 765-4321",
    address: "789 Pine Rd, City, State 12345",
  },
  {
    id: "4",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@delivery.com",
    phone: "+1 (555) 456-7890",
    status: "active",
    location: "West Zone",
    rating: 4.7,
    deliveries: 134,
    vehicle: "VH-018",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "February 8, 2024",
    licenseNumber: "DL789123456",
    emergencyContact: "Carlos Rodriguez - (555) 654-3210",
    address: "321 Elm St, City, State 12345",
  },
]

export function DriversTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [drivers, setDrivers] = useState(mockDrivers)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { t } = useLanguage()

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

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewProfile = (driver: any) => {
    setSelectedDriver(driver)
    setIsProfileModalOpen(true)
  }

  const handleSaveDriver = (updatedDriver: any) => {
    setDrivers((prev) => prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)))
    setIsProfileModalOpen(false)
  }

  const handleAddDriver = (newDriver: any) => {
    setDrivers((prev) => [...prev, newDriver])
  }

  const getStatusStats = () => {
    const active = drivers.filter((d) => d.status === "active").length
    const onRoute = drivers.filter((d) => d.status === "on-route").length
    const offline = drivers.filter((d) => d.status === "offline").length
    const avgRating = drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length

    return { active, onRoute, offline, avgRating: avgRating.toFixed(1) }
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("driverManagement")}</h2>
          <p className="text-gray-600">{t("manageDeliveryTeam")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("driver")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("activeDrivers")}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("onRoute")}</p>
                <p className="text-xl font-bold">{stats.onRoute}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("avgRating")}</p>
                <p className="text-xl font-bold">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("offline")}</p>
                <p className="text-xl font-bold">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchDrivers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t("filter")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                  <AvatarFallback>
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-500">ID: {driver.id}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Mail className="h-3 w-3" />
                      {driver.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </div>
                  </div>

                  <div>
                    <Badge className={getStatusColor(driver.status)}>
                      {driver.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {driver.location}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{driver.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {driver.deliveries} {t("deliveries")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {t("vehicle")}: {driver.vehicle}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(driver)}>
                          {t("viewProfile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>{t("assignTask")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("sendMessage")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">{t("suspend")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <DriverProfileModal
        driver={selectedDriver}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveDriver}
      />

      <AddDriverModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddDriver} />
    </div>
  )
}
