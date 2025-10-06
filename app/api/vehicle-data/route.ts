import { NextResponse } from 'next/server'
import { 
  getVehicles, 
  getDrivers, 
  getMaintenanceRecords, 
  getFuelRecords, 
  getVehicleAssignments, 
  getVehicleTracking,
  getVehicleStats 
} from '@/lib/vehicle'

export async function GET() {
  try {
    const [
      vehiclesResponse,
      driversResponse,
      maintenance,
      fuelRecords,
      assignments,
      tracking,
      stats
    ] = await Promise.all([
      getVehicles().catch(() => ({ data: [], pagination: { total: 0 } })),
      getDrivers().catch(() => ({ data: [], pagination: { total: 0 } })),
      getMaintenanceRecords().catch(() => []),
      getFuelRecords().catch(() => []),
      getVehicleAssignments().catch(() => []),
      getVehicleTracking('').catch(() => []),
      getVehicleStats().catch(() => null)
    ])

    return NextResponse.json({
      success: true,
      data: {
        vehicles: vehiclesResponse.data || [],
        drivers: driversResponse.data || [],
        maintenance: maintenance || [],
        fuelRecords: fuelRecords || [],
        assignments: assignments || [],
        tracking: tracking || [],
        stats: stats
      },
      counts: {
        vehicles: vehiclesResponse.data?.length || 0,
        drivers: driversResponse.data?.length || 0,
        maintenance: maintenance?.length || 0,
        fuelRecords: fuelRecords?.length || 0,
        assignments: assignments?.length || 0,
        tracking: tracking?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching vehicle data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicle data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
