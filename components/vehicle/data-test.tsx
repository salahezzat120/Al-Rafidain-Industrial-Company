"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Truck,
  MapPin,
  Fuel,
  Wrench
} from "lucide-react"
import { getVehicles, mockVehicleData } from "@/lib/vehicle"

export function DataTest() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 Testing vehicle data loading...')
      const result = await getVehicles()
      console.log('📊 Vehicle data result:', result)
      
      setVehicles(result.data || [])
      
      if (result.data && result.data.length > 0) {
        console.log('✅ Vehicles loaded successfully:', result.data.length)
      } else {
        console.log('⚠️ No vehicles found, using mock data')
        setVehicles(mockVehicleData.vehicles)
      }
    } catch (err) {
      console.error('❌ Error loading vehicles:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setVehicles(mockVehicleData.vehicles)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      MAINTENANCE: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      REPAIR: { color: 'bg-red-100 text-red-800', icon: XCircle },
      RETIRED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
      repair: { color: 'bg-red-100 text-red-800', icon: XCircle },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Data Test</h2>
          <p className="text-gray-600">Test vehicle data loading and display</p>
        </div>
        <Button onClick={loadVehicles} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Data
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              The system is using mock data as fallback. Check the console for more details.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicles ({vehicles.length})
          </CardTitle>
          <CardDescription>
            {vehicles.length > 0 ? 'Vehicle data loaded successfully' : 'No vehicles found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
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
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                    <TableCell>{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.vehicle_type}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={vehicle.current_fuel_level || vehicle.fuel_level_percent || 0} 
                          className="w-16" 
                        />
                        <span className="text-sm text-gray-600">
                          {vehicle.current_fuel_level || vehicle.fuel_level_percent || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.current_location || 'Unknown'}</TableCell>
                    <TableCell>{(vehicle.mileage || vehicle.mileage_km || 0).toLocaleString()} km</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No vehicles found</p>
              <p className="text-sm text-gray-500 mt-2">
                Check your database connection or environment configuration
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'ACTIVE' || v.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Fuel className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Low Fuel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => (v.current_fuel_level || v.fuel_level_percent || 0) < 25).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
