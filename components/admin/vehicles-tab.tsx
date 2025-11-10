"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { EditVehicleModal } from "@/components/vehicle/edit-vehicle-modal"
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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false)
  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false)

  type MaintenanceRecord = {
    id: string
    vehicle_id: string
    type: string
    scheduled_date: string
    notes?: string
  }
  type FuelRecord = {
    id: string
    vehicle_id: string
    liters: number
    cost: number
    date: string
    location?: string
  }
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [newMaintenance, setNewMaintenance] = useState<MaintenanceRecord>({
    id: '',
    vehicle_id: '',
    type: 'service',
    scheduled_date: new Date().toISOString().slice(0, 10),
    notes: ''
  })
  const [newFuel, setNewFuel] = useState<FuelRecord>({
    id: '',
    vehicle_id: '',
    liters: 0,
    cost: 0,
    date: new Date().toISOString().slice(0, 10),
    location: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    console.log('🚗 Loading vehicle data...')
    try {
      // Try to load real data first
      const [vehiclesData, driversData, statsData] = await Promise.all([
        getVehicles().catch((err) => {
          console.log('⚠️ Vehicles API failed, using mock data:', err)
          return { data: mockVehicleData.vehicles, pagination: { total: mockVehicleData.vehicles.length } }
        }),
        getDrivers().catch((err) => {
          console.log('⚠️ Drivers API failed, using mock data:', err)
          return { data: mockVehicleData.drivers, pagination: { total: mockVehicleData.drivers.length } }
        }),
        getVehicleStats().catch((err) => {
          console.log('⚠️ Stats API failed, using mock data:', err)
          return mockVehicleData.stats
        })
      ])

      console.log('✅ Data loaded successfully:', {
        vehicles: vehiclesData.data?.length || 0,
        drivers: driversData.data?.length || 0,
        stats: !!statsData
      })

      setVehicles(vehiclesData.data || [])
      setDrivers(driversData.data || [])
      setStats(statsData)
    } catch (error) {
      console.error('❌ Error loading data:', error)
      // Fallback to mock data
      console.log('🔄 Using fallback mock data')
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

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsViewDetailsOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsEditVehicleOpen(true)
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteVehicle = async () => {
    if (!selectedVehicle) return

    try {
      // Here you would call your delete API
      // await deleteVehicle(selectedVehicle.id)
      
      // For now, just remove from local state
      setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id))
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_vehicles: prev.total_vehicles - 1,
          active_vehicles: selectedVehicle.status === 'active' ? prev.active_vehicles - 1 : prev.active_vehicles
        } : null)
      }

      console.log('Vehicle deleted:', selectedVehicle.vehicle_id)
      setIsDeleteConfirmOpen(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Error deleting vehicle:', error)
    }
  }

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    console.log('Updating vehicle in state:', updatedVehicle);
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v))
    setIsEditVehicleOpen(false)
    setSelectedVehicle(null)
    console.log('Vehicle updated successfully');
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      MAINTENANCE: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      REPAIR: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      RETIRED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      // Fallback for lowercase statuses
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      repair: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      retired: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    )
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMaintenanceSave = () => {
    if (!newMaintenance.vehicle_id) return
    const record: MaintenanceRecord = {
      ...newMaintenance,
      id: `mnt_${Date.now()}`
    }
    setMaintenanceRecords(prev => [record, ...prev])
    setIsAddMaintenanceOpen(false)
    setNewMaintenance({
      id: '',
      vehicle_id: '',
      type: 'service',
      scheduled_date: new Date().toISOString().slice(0, 10),
      notes: ''
    })
  }

  const handleAddFuelSave = () => {
    if (!newFuel.vehicle_id || newFuel.liters <= 0) return
    const record: FuelRecord = {
      ...newFuel,
      id: `fuel_${Date.now()}`
    }
    setFuelRecords(prev => [record, ...prev])
    setIsAddFuelOpen(false)
    setNewFuel({
      id: '',
      vehicle_id: '',
      liters: 0,
      cost: 0,
      date: new Date().toISOString().slice(0, 10),
      location: ''
    })
  }

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
          <Button onClick={() => window.open('/debug', '_blank')} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Debug Data
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredVehicles.length > 0) {
                    handleViewDetails(filteredVehicles[0])
                  }
                }}
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
                        <Progress value={vehicle.current_fuel_level || vehicle.fuel_level_percent || 0} className="w-16" />
                        <span className="text-sm text-gray-600">{vehicle.current_fuel_level || vehicle.fuel_level_percent || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.current_location || 'Unknown'}</TableCell>
                    <TableCell>{(vehicle.mileage || vehicle.mileage_km || 0).toLocaleString()} km</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(vehicle)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVehicle(vehicle)}
                            className="text-red-600"
                          >
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
            <Button onClick={() => setIsAddMaintenanceOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance
            </Button>
          </div>

          <div className="grid gap-4">
            {/* Newly added maintenance records */}
            {maintenanceRecords.map((rec) => {
              const v = vehicles.find(v => v.vehicle_id === rec.vehicle_id)
              return (
                <Card key={rec.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{rec.vehicle_id} - {v ? `${v.make} ${v.model}` : ''}</h3>
                        <p className="text-sm text-gray-600">Type: {rec.type} | Scheduled: {rec.scheduled_date}</p>
                        {rec.notes && <p className="text-sm text-gray-600">Notes: {rec.notes}</p>}
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

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
            <Button onClick={() => setIsAddFuelOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Record
            </Button>
          </div>

          <div className="grid gap-4">
            {/* Newly added fuel records */}
            {fuelRecords.map((rec) => {
              const v = vehicles.find(v => v.vehicle_id === rec.vehicle_id)
              return (
                <Card key={rec.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{rec.vehicle_id} {v ? `- ${v.make} ${v.model}` : ''}</h3>
                        <p className="text-sm text-gray-600">{rec.date} • {rec.liters} L • ${rec.cost.toFixed(2)} {rec.location ? `• ${rec.location}` : ''}</p>
                      </div>
                      <Badge variant="outline">Recorded</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

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

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        isOpen={isEditVehicleOpen}
        onClose={() => setIsEditVehicleOpen(false)}
        onUpdate={handleUpdateVehicle}
        vehicle={selectedVehicle}
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

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Details - {selectedVehicle?.vehicle_id}
            </DialogTitle>
            <DialogDescription>
              Complete information about this vehicle
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle ID</label>
                    <p className="text-lg font-semibold">{selectedVehicle.vehicle_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Plate</label>
                    <p className="text-lg font-semibold">{selectedVehicle.license_plate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Make & Model</label>
                    <p className="text-lg">{selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year</label>
                    <p className="text-lg">{selectedVehicle.year}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                    <p className="text-lg">{selectedVehicle.vehicle_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Engine Type</label>
                    <p className="text-lg">{selectedVehicle.engine_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fuel Type</label>
                    <p className="text-lg">{selectedVehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacity</label>
                  <p className="text-lg">{selectedVehicle.capacity_kg || 0} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fuel Capacity</label>
                  <p className="text-lg">{selectedVehicle.fuel_capacity_l || 0} L</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Fuel Level</label>
                  <div className="mt-1">
                    <Progress value={selectedVehicle.fuel_level_percent || 0} className="h-2" />
                    <p className="text-sm text-gray-600 mt-1">{selectedVehicle.fuel_level_percent || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mileage</label>
                  <p className="text-lg">{(selectedVehicle.mileage_km || 0).toLocaleString()} km</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Location</label>
                  <p className="text-lg">{selectedVehicle.current_location || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Insurance Company</label>
                  <p className="text-lg">{selectedVehicle.insurance_company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                  <p className="text-lg">${(selectedVehicle.purchase_price || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Interval</label>
                  <p className="text-lg">{(selectedVehicle.service_interval_km || 0).toLocaleString()} km</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Speed Limit</label>
                  <p className="text-lg">{selectedVehicle.speed_limit_kmh || 0} km/h</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fuel Consumption</label>
                  <p className="text-lg">{selectedVehicle.fuel_consumption || 'N/A'} L/100km</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDetailsOpen(false)
              handleEditVehicle(selectedVehicle!)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Maintenance Modal */}
      <Dialog open={isAddMaintenanceOpen} onOpenChange={setIsAddMaintenanceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Maintenance</DialogTitle>
            <DialogDescription>Schedule a maintenance task for a vehicle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={newMaintenance.vehicle_id}
                onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, vehicle_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.vehicle_id}>
                      {v.vehicle_id} - {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newMaintenance.type}
                onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={newMaintenance.scheduled_date}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, scheduled_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes"
                value={newMaintenance.notes}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMaintenanceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMaintenanceSave} disabled={!newMaintenance.vehicle_id}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fuel Record Modal */}
      <Dialog open={isAddFuelOpen} onOpenChange={setIsAddFuelOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Fuel Record</DialogTitle>
            <DialogDescription>Log a fuel purchase for a vehicle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={newFuel.vehicle_id}
                onValueChange={(v) => setNewFuel(prev => ({ ...prev, vehicle_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.vehicle_id}>
                      {v.vehicle_id} - {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Liters</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFuel.liters}
                  onChange={(e) => setNewFuel(prev => ({ ...prev, liters: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cost (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFuel.cost}
                  onChange={(e) => setNewFuel(prev => ({ ...prev, cost: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newFuel.date}
                  onChange={(e) => setNewFuel(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Optional"
                  value={newFuel.location}
                  onChange={(e) => setNewFuel(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFuelOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFuelSave} disabled={!newFuel.vehicle_id || newFuel.liters <= 0}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Vehicle
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">{selectedVehicle.vehicle_id}</p>
                    <p className="text-sm text-red-700">{selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.license_plate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteVehicle}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}