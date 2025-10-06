"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Truck, 
  Fuel, 
  Wrench, 
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Database
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { 
  getVehicles, 
  getDrivers, 
  getVehicleStats, 
  mockVehicleData 
} from "@/lib/vehicle"
import { AddVehicleModal } from "@/components/vehicle/add-vehicle-modal"
import { VehicleDataDisplay } from "@/components/vehicle/vehicle-data-display"
import type { Vehicle, Driver, VehicleStats as VehicleStatsType } from "@/types/vehicle"

export function VehiclesTab() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('all-vehicles')
  const [showDataDisplay, setShowDataDisplay] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [stats, setStats] = useState<VehicleStatsType | null>(null)
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Try to load real data first
      const [vehiclesData, driversData, statsData] = await Promise.all([
        getVehicles().catch(() => ({ data: mockVehicleData.vehicles, pagination: { total: mockVehicleData.vehicles.length } })),
        getDrivers().catch(() => ({ data: mockVehicleData.drivers, pagination: { total: mockVehicleData.drivers.length } })),
        getVehicleStats().catch(() => mockVehicleData.stats)
      ])

      setVehicles(vehiclesData.data || [])
      setDrivers(driversData.data || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to mock data
      setVehicles(mockVehicleData.vehicles)
      setDrivers(mockVehicleData.drivers)
      setStats(mockVehicleData.stats)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles(prev => [newVehicle, ...prev])
    // Update stats
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        total_vehicles: prev.total_vehicles + 1,
        active_vehicles: newVehicle.status === 'active' ? prev.active_vehicles + 1 : prev.active_vehicles
      } : null)
    }
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      repair: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      retired: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading vehicle fleet data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">Vehicle added successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Fleet Management</h2>
          <p className="text-gray-600">Manage and monitor your delivery fleet</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDataDisplay(true)} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            View All Data
          </Button>
          <Button onClick={() => setIsAddVehicleOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_vehicles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.active_vehicles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.maintenance_vehicles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Fuel className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Fuel</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.low_fuel_vehicles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-vehicles">All Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Management</TabsTrigger>
        </TabsList>

        <TabsContent value="all-vehicles" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vehicles..."
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
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fuel Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                    <TableCell>{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.vehicle_type}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={vehicle.fuel_level_percent} className="w-16" />
                        <span className="text-sm text-gray-600">{vehicle.fuel_level_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.current_location || 'Unknown'}</TableCell>
                    <TableCell>{vehicle.mileage_km.toLocaleString()} km</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Vehicle
                          </DropdownMenuItem>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance
            </Button>
          </div>

          <div className="grid gap-4">
            {vehicles.filter(v => v.status === 'maintenance').map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{vehicle.vehicle_id} - {vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-gray-600">Last: 2024-01-15 | Next: 2024-04-15</p>
                    </div>
                    <Badge variant="outline">Due in 3 days</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {vehicles.filter(v => v.status === 'maintenance').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vehicles currently in maintenance</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fuel Management</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Record
            </Button>
          </div>

          <div className="grid gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{vehicle.vehicle_id}</h3>
                      <p className="text-sm text-gray-600">{vehicle.current_location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={vehicle.fuel_level_percent} className="w-20" />
                      <span className="text-sm font-medium">{vehicle.fuel_level_percent}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onAdd={handleAddVehicle}
      />

      {/* Data Display Modal */}
      {showDataDisplay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Complete Vehicle Database</h3>
              <Button 
                variant="ghost" 
                onClick={() => setShowDataDisplay(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <VehicleDataDisplay />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}