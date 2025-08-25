"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Truck, Fuel, Wrench, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock vehicle data
const vehicles = [
  {
    id: "V001",
    plateNumber: "ABC-123",
    type: "Van",
    model: "Ford Transit",
    year: 2022,
    status: "active",
    driver: "John Smith",
    location: "Downtown Hub",
    mileage: 45230,
    fuelLevel: 85,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
  },
  {
    id: "V002",
    plateNumber: "XYZ-789",
    type: "Truck",
    model: "Mercedes Sprinter",
    year: 2021,
    status: "maintenance",
    driver: "Unassigned",
    location: "Service Center",
    mileage: 67890,
    fuelLevel: 45,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
  },
  {
    id: "V003",
    plateNumber: "DEF-456",
    type: "Motorcycle",
    model: "Honda CB500",
    year: 2023,
    status: "active",
    driver: "Mike Johnson",
    location: "North Zone",
    mileage: 12450,
    fuelLevel: 92,
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "inactive":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function VehiclesTab() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("vehicleFleetManagement")}</h2>
          <p className="text-gray-600">{t("manageMonitorFleet")}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("addVehicle")}
        </Button>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("totalVehicles")}</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("active")}</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("maintenance")}</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Fuel className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t("lowFuel")}</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">{t("allVehicles")}</TabsTrigger>
          <TabsTrigger value="maintenance">{t("maintenanceSchedule")}</TabsTrigger>
          <TabsTrigger value="fuel">{t("fuelManagement")}</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchVehicles")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("vehicle")}</TableHead>
                  <TableHead>{t("driver")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("location")}</TableHead>
                  <TableHead>{t("fuelLevel")}</TableHead>
                  <TableHead>{t("mileage")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500">
                          {vehicle.model} ({vehicle.year})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.driver}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vehicle.status)}>{t(vehicle.status)}</Badge>
                    </TableCell>
                    <TableCell>{vehicle.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{vehicle.fuelLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t("viewDetails")}</DropdownMenuItem>
                          <DropdownMenuItem>{t("editVehicle")}</DropdownMenuItem>
                          <DropdownMenuItem>{t("assignDriver")}</DropdownMenuItem>
                          <DropdownMenuItem>{t("scheduleMaintenance")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("maintenanceSchedule")}</CardTitle>
              <CardDescription>{t("upcomingOverdueMaintenance")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {vehicle.plateNumber} - {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("last")}: {vehicle.lastMaintenance}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {t("next")}: {vehicle.nextMaintenance}
                      </div>
                      <Badge variant="outline">{t("dueInDays", { days: 15 })}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("fuelManagement")}</CardTitle>
              <CardDescription>{t("monitorFuelLevels")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{vehicle.plateNumber}</div>
                      <div className="text-sm text-gray-500">{vehicle.location}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-3 mr-2">
                          <div
                            className={`h-3 rounded-full ${vehicle.fuelLevel < 30 ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{vehicle.fuelLevel}%</span>
                      </div>
                      {vehicle.fuelLevel < 30 && <Badge variant="destructive">{t("lowFuel")}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
