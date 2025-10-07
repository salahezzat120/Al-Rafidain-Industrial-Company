"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Truck, 
  User, 
  Wrench, 
  Fuel, 
  MapPin, 
  Calendar,
  DollarSign,
  Gauge,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { 
  getVehicles, 
  getDrivers, 
  getMaintenanceRecords, 
  getFuelRecords, 
  getVehicleAssignments, 
  getVehicleTracking,
  getVehicleStats
} from "@/lib/vehicle"
import type { 
  Vehicle, 
  Driver, 
  VehicleMaintenance, 
  FuelRecord, 
  VehicleAssignment, 
  VehicleTracking,
  VehicleStats as VehicleStatsType
} from "@/types/vehicle"

export function VehicleDataDisplay() {
  const [activeTab, setActiveTab] = useState('vehicles')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [maintenance, setMaintenance] = useState<VehicleMaintenance[]>([])
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([])
  const [tracking, setTracking] = useState<VehicleTracking[]>([])
  const [stats, setStats] = useState<VehicleStatsType | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [
        vehiclesData,
        driversData,
        maintenanceData,
        fuelData,
        assignmentsData,
        trackingData,
        statsData
      ] = await Promise.all([
        getVehicles().catch(() => ({ data: [], pagination: { total: 0 } })),
        getDrivers().catch(() => ({ data: [], pagination: { total: 0 } })),
        getMaintenanceRecords().catch(() => []),
        getFuelRecords().catch(() => []),
        getVehicleAssignments().catch(() => []),
        getVehicleTracking('').catch(() => []),
        getVehicleStats().catch(() => null)
      ])

      setVehicles(vehiclesData.data || [])
      setDrivers(driversData.data || [])
      setMaintenance(maintenanceData || [])
      setFuelRecords(fuelData || [])
      setAssignments(assignmentsData || [])
      setTracking(trackingData || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      repair: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      retired: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDrivers = drivers.filter(driver =>
    driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMaintenance = maintenance.filter(record =>
    record.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.service_provider?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFuelRecords = fuelRecords.filter(record =>
    record.fuel_station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.fuel_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Database Data</h2>
          <p className="text-gray-600">Complete view of all vehicle fleet data</p>
        </div>
        <Button onClick={loadAllData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_vehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_drivers}</p>
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
                  <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_maintenance_cost)}</p>
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
                  <p className="text-sm font-medium text-gray-600">Fuel Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_fuel_cost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search all data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Records</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicles ({filteredVehicles.length})
              </CardTitle>
              <CardDescription>All vehicles in the fleet</CardDescription>
            </CardHeader>
            <CardContent>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Drivers ({filteredDrivers.length})
              </CardTitle>
              <CardDescription>All drivers in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>License Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.driver_id}</TableCell>
                      <TableCell>{driver.first_name} {driver.last_name}</TableCell>
                      <TableCell>{driver.email || 'N/A'}</TableCell>
                      <TableCell>{driver.phone || 'N/A'}</TableCell>
                      <TableCell>{driver.license_number}</TableCell>
                      <TableCell>{driver.license_type}</TableCell>
                      <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      <TableCell>{driver.hire_date ? formatDate(driver.hire_date) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Records ({filteredMaintenance.length})
              </CardTitle>
              <CardDescription>All maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Next Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Provider</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaintenance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.vehicle_id}</TableCell>
                      <TableCell>{record.maintenance_type}</TableCell>
                      <TableCell>{record.description || 'N/A'}</TableCell>
                      <TableCell>{formatDate(record.maintenance_date)}</TableCell>
                      <TableCell>{record.next_maintenance_date ? formatDate(record.next_maintenance_date) : 'N/A'}</TableCell>
                      <TableCell>{record.cost ? formatCurrency(record.cost) : 'N/A'}</TableCell>
                      <TableCell>{record.mileage_at_maintenance ? record.mileage_at_maintenance.toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>{record.service_provider || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Records Tab */}
        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Records ({filteredFuelRecords.length})
              </CardTitle>
              <CardDescription>All fuel transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount (L)</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFuelRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.vehicle_id}</TableCell>
                      <TableCell>{formatDate(record.fuel_date)}</TableCell>
                      <TableCell>{record.fuel_amount_l}L</TableCell>
                      <TableCell>{formatCurrency(record.fuel_cost)}</TableCell>
                      <TableCell>{record.fuel_station || 'N/A'}</TableCell>
                      <TableCell>{record.odometer_reading ? record.odometer_reading.toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>{record.fuel_type || 'N/A'}</TableCell>
                      <TableCell>{record.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Vehicle Assignments ({assignments.length})
              </CardTitle>
              <CardDescription>Vehicle-driver assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Assignment Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.vehicle_id}</TableCell>
                      <TableCell>{assignment.driver_id}</TableCell>
                      <TableCell>{formatDate(assignment.assignment_date)}</TableCell>
                      <TableCell>{assignment.return_date ? formatDate(assignment.return_date) : 'Active'}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>{assignment.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Vehicle Tracking ({tracking.length})
              </CardTitle>
              <CardDescription>Real-time vehicle locations and data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Heading</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracking.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium">{track.vehicle_id}</TableCell>
                      <TableCell>{track.location_name || 'Unknown'}</TableCell>
                      <TableCell>
                        {track.latitude && track.longitude 
                          ? `${track.latitude.toFixed(6)}, ${track.longitude.toFixed(6)}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>{track.speed_kmh ? `${track.speed_kmh} km/h` : 'N/A'}</TableCell>
                      <TableCell>{track.heading_degrees ? `${track.heading_degrees}°` : 'N/A'}</TableCell>
                      <TableCell>{formatDate(track.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
