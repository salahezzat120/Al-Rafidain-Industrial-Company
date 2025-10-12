// Vehicle Fleet Management API Functions
// This file contains all API functions for interacting with the vehicle fleet management database

import { supabase } from '@/lib/supabase';
import type {
  Vehicle,
  Driver,
  VehicleMaintenance,
  FuelRecord,
  VehicleAssignment,
  VehicleTracking,
  CreateVehicleData,
  UpdateVehicleData,
  CreateDriverData,
  UpdateDriverData,
  CreateMaintenanceData,
  CreateFuelRecordData,
  CreateAssignmentData,
  CreateTrackingData,
  VehicleStats,
  VehicleFleetMetrics,
  DashboardData,
  VehicleFilters,
  DriverFilters,
  MaintenanceFilters,
  PaginationParams,
  PaginatedResponse
} from '@/types/vehicle';

// Helper function to map database vehicle to TypeScript interface
function mapDbVehicleToInterface(dbVehicle: any): Vehicle {
  return {
    id: dbVehicle.id.toString(),
    vehicle_id: dbVehicle.vehicle_id,
    license_plate: dbVehicle.license_plate,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    vehicle_type: dbVehicle.vehicle_type,
    engine_type: dbVehicle.engine_type,
    fuel_type: dbVehicle.fuel_type,
    capacity_kg: dbVehicle.capacity_kg,
    fuel_capacity_l: dbVehicle.fuel_capacity, // Map fuel_capacity to fuel_capacity_l
    status: dbVehicle.status?.toLowerCase() as any, // Convert to lowercase
    fuel_level_percent: dbVehicle.current_fuel_level, // Map current_fuel_level to fuel_level_percent
    mileage_km: dbVehicle.mileage, // Map mileage to mileage_km
    current_location: dbVehicle.current_location,
    insurance_company: dbVehicle.insurance_company,
    purchase_price: dbVehicle.purchase_price,
    service_interval_km: dbVehicle.service_interval_km,
    speed_limit_kmh: dbVehicle.speed_limit_kmh,
    color: dbVehicle.color,
    fuel_consumption: dbVehicle.fuel_consumption,
    created_at: dbVehicle.created_at,
    updated_at: dbVehicle.updated_at
  };
}

// Vehicle CRUD Operations
export async function getVehicles(filters?: VehicleFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Vehicle>> {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.log('Supabase client not available, using mock data');
      return {
        data: mockVehicleData.vehicles,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total: mockVehicleData.vehicles.length,
          total_pages: Math.ceil(mockVehicleData.vehicles.length / (pagination?.limit || 10))
        }
      };
    }

    let query = supabase.from('vehicles').select('*');

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.vehicle_type && filters.vehicle_type.length > 0) {
      query = query.in('vehicle_type', filters.vehicle_type);
    }
    if (filters?.make && filters.make.length > 0) {
      query = query.in('make', filters.make);
    }
    if (filters?.year_from) {
      query = query.gte('year', filters.year_from);
    }
    if (filters?.year_to) {
      query = query.lte('year', filters.year_to);
    }
    if (filters?.fuel_level_min) {
      query = query.gte('fuel_level_percent', filters.fuel_level_min);
    }
    if (filters?.fuel_level_max) {
      query = query.lte('fuel_level_percent', filters.fuel_level_max);
    }

    // Apply pagination
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    // Apply sorting
    if (pagination?.sort_by) {
      query = query.order(pagination.sort_by, { ascending: pagination.sort_order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Map database vehicles to TypeScript interface
    const mappedVehicles = (data || []).map(mapDbVehicleToInterface);

    return {
      data: mappedVehicles,
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / (pagination?.limit || 10))
      }
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapDbVehicleToInterface(data) : null;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.log('Supabase client not available, simulating vehicle creation');
      // Create a mock vehicle with the provided data
      const mockVehicle: Vehicle = {
        id: `mock-${Date.now()}`,
        vehicle_id: vehicleData.vehicle_id,
        license_plate: vehicleData.license_plate,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        vehicle_type: vehicleData.vehicle_type,
        engine_type: vehicleData.engine_type,
        fuel_type: vehicleData.fuel_type,
        capacity_kg: vehicleData.capacity_kg,
        fuel_capacity_l: vehicleData.fuel_capacity_l,
        status: vehicleData.status || 'active',
        fuel_level_percent: vehicleData.fuel_level_percent || 85,
        mileage_km: vehicleData.mileage_km || 0,
        current_location: vehicleData.current_location,
        insurance_company: vehicleData.insurance_company,
        purchase_price: vehicleData.purchase_price,
        service_interval_km: vehicleData.service_interval_km,
        speed_limit_kmh: vehicleData.speed_limit_kmh,
        color: vehicleData.color,
        fuel_consumption: vehicleData.fuel_consumption,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockVehicle;
    }

    // Map the data to match database column names
    const dbVehicleData = {
      vehicle_id: vehicleData.vehicle_id,
      license_plate: vehicleData.license_plate,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vehicle_type: vehicleData.vehicle_type,
      engine_type: vehicleData.engine_type,
      fuel_type: vehicleData.fuel_type,
      capacity_kg: vehicleData.capacity_kg,
      fuel_capacity: vehicleData.fuel_capacity_l, // Map fuel_capacity_l to fuel_capacity
      status: vehicleData.status?.toUpperCase() || 'ACTIVE', // Convert to uppercase
      current_fuel_level: vehicleData.fuel_level_percent, // Map fuel_level_percent to current_fuel_level
      mileage: vehicleData.mileage_km, // Map mileage_km to mileage
      current_location: vehicleData.current_location,
      insurance_company: vehicleData.insurance_company,
      purchase_price: vehicleData.purchase_price,
      service_interval_km: vehicleData.service_interval_km,
      speed_limit_kmh: vehicleData.speed_limit_kmh,
      color: vehicleData.color,
      fuel_consumption: vehicleData.fuel_consumption
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(dbVehicleData)
      .select()
      .single();

    if (error) throw error;
    return mapDbVehicleToInterface(data);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
}

export async function updateVehicle(id: string, vehicleData: Partial<CreateVehicleData>): Promise<Vehicle> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicleData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

// Driver CRUD Operations
export async function getDrivers(filters?: DriverFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Driver>> {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.log('Supabase client not available, using mock data');
      return {
        data: mockVehicleData.drivers,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total: mockVehicleData.drivers.length,
          total_pages: Math.ceil(mockVehicleData.drivers.length / (pagination?.limit || 10))
        }
      };
    }

    let query = supabase.from('drivers').select('*');

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.license_type && filters.license_type.length > 0) {
      query = query.in('license_type', filters.license_type);
    }
    if (filters?.hire_date_from) {
      query = query.gte('hire_date', filters.hire_date_from);
    }
    if (filters?.hire_date_to) {
      query = query.lte('hire_date', filters.hire_date_to);
    }

    // Apply pagination
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    // Apply sorting
    if (pagination?.sort_by) {
      query = query.order(pagination.sort_by, { ascending: pagination.sort_order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / (pagination?.limit || 10))
      }
    };
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
}

export async function getDriverById(id: string): Promise<Driver | null> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching driver:', error);
    return null;
  }
}

export async function createDriver(driverData: CreateDriverData): Promise<Driver> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .insert(driverData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
}

export async function updateDriver(id: string, driverData: Partial<CreateDriverData>): Promise<Driver> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
}

export async function deleteDriver(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
}

// Maintenance Operations
export async function getMaintenanceRecords(vehicleId?: string, filters?: MaintenanceFilters): Promise<VehicleMaintenance[]> {
  try {
    let query = supabase.from('vehicle_maintenance').select('*');

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    if (filters?.maintenance_type && filters.maintenance_type.length > 0) {
      query = query.in('maintenance_type', filters.maintenance_type);
    }
    if (filters?.date_from) {
      query = query.gte('maintenance_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('maintenance_date', filters.date_to);
    }
    if (filters?.cost_min) {
      query = query.gte('cost', filters.cost_min);
    }
    if (filters?.cost_max) {
      query = query.lte('cost', filters.cost_max);
    }

    query = query.order('maintenance_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    throw error;
  }
}

export async function createMaintenanceRecord(maintenanceData: CreateMaintenanceData): Promise<VehicleMaintenance> {
  try {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .insert(maintenanceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    throw error;
  }
}

// Fuel Records Operations
export async function getFuelRecords(vehicleId?: string): Promise<FuelRecord[]> {
  try {
    let query = supabase.from('fuel_records').select('*');

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    query = query.order('fuel_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fuel records:', error);
    throw error;
  }
}

export async function createFuelRecord(fuelData: CreateFuelRecordData): Promise<FuelRecord> {
  try {
    const { data, error } = await supabase
      .from('fuel_records')
      .insert(fuelData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating fuel record:', error);
    throw error;
  }
}

// Assignment Operations
export async function getVehicleAssignments(vehicleId?: string, driverId?: string): Promise<VehicleAssignment[]> {
  try {
    let query = supabase.from('vehicle_assignments').select('*');

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }
    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    query = query.order('assignment_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vehicle assignments:', error);
    throw error;
  }
}

export async function createVehicleAssignment(assignmentData: CreateAssignmentData): Promise<VehicleAssignment> {
  try {
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .insert(assignmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating vehicle assignment:', error);
    throw error;
  }
}

// Tracking Operations
export async function getVehicleTracking(vehicleId: string, limit: number = 100): Promise<VehicleTracking[]> {
  try {
    const { data, error } = await supabase
      .from('vehicle_tracking')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vehicle tracking:', error);
    throw error;
  }
}

export async function createTrackingRecord(trackingData: CreateTrackingData): Promise<VehicleTracking> {
  try {
    const { data, error } = await supabase
      .from('vehicle_tracking')
      .insert(trackingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating tracking record:', error);
    throw error;
  }
}

// Statistics and Analytics
export async function getVehicleStats(): Promise<VehicleStats> {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.log('Supabase client not available, using mock stats');
      return mockVehicleData.stats;
    }

    // Get total vehicles
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    // Get active vehicles (status is uppercase in database)
    const { count: activeVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // Get maintenance vehicles (status is uppercase in database)
    const { count: maintenanceVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'MAINTENANCE');

    // Get low fuel vehicles (using correct column name: current_fuel_level)
    const { count: lowFuelVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .lt('current_fuel_level', 25);

    // Get total drivers
    const { count: totalDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true });

    // Get active drivers (status is lowercase in database)
    const { count: activeDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total maintenance cost
    const { data: maintenanceData } = await supabase
      .from('vehicle_maintenance')
      .select('cost');

    const totalMaintenanceCost = maintenanceData?.reduce((sum, record) => sum + (record.cost || 0), 0) || 0;

    // Get total fuel cost
    const { data: fuelData } = await supabase
      .from('fuel_records')
      .select('fuel_cost');

    const totalFuelCost = fuelData?.reduce((sum, record) => sum + record.fuel_cost, 0) || 0;

    // Calculate average fuel consumption
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('fuel_consumption')
      .not('fuel_consumption', 'is', null);

    const averageFuelConsumption = vehicles?.length > 0 
      ? vehicles.reduce((sum, vehicle) => sum + (vehicle.fuel_consumption || 0), 0) / vehicles.length 
      : 0;

    return {
      total_vehicles: totalVehicles || 0,
      active_vehicles: activeVehicles || 0,
      maintenance_vehicles: maintenanceVehicles || 0,
      low_fuel_vehicles: lowFuelVehicles || 0,
      total_drivers: totalDrivers || 0,
      active_drivers: activeDrivers || 0,
      total_maintenance_cost: totalMaintenanceCost,
      total_fuel_cost: totalFuelCost,
      average_fuel_consumption: averageFuelConsumption
    };
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    throw error;
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const stats = await getVehicleStats();

    // Get recent activities
    const { data: recentActivities } = await supabase
      .from('vehicle_maintenance')
      .select(`
        id,
        maintenance_type,
        maintenance_date,
        vehicles!inner(vehicle_id)
      `)
      .order('maintenance_date', { ascending: false })
      .limit(10);

    const activities = recentActivities?.map(activity => ({
      type: 'maintenance' as const,
      description: `${activity.maintenance_type} - ${activity.vehicles?.vehicle_id}`,
      timestamp: activity.maintenance_date,
      vehicle_id: activity.vehicles?.vehicle_id || ''
    })) || [];

    // Get upcoming maintenance
    const { data: upcomingMaintenance } = await supabase
      .from('vehicle_maintenance')
      .select('*')
      .gte('next_maintenance_date', new Date().toISOString().split('T')[0])
      .order('next_maintenance_date', { ascending: true })
      .limit(5);

    // Get low fuel vehicles (using correct column name: current_fuel_level)
    const { data: lowFuelVehicles } = await supabase
      .from('vehicles')
      .select('*')
      .lt('current_fuel_level', 25)
      .order('current_fuel_level', { ascending: true });

    // Get active assignments
    const { data: activeAssignments } = await supabase
      .from('vehicle_assignments')
      .select('*')
      .eq('status', 'active')
      .order('assignment_date', { ascending: false });

    return {
      stats,
      recent_activities: activities,
      upcoming_maintenance: upcomingMaintenance || [],
      low_fuel_vehicles: lowFuelVehicles || [],
      active_assignments: activeAssignments || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Utility Functions
export async function searchVehicles(searchTerm: string): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`vehicle_id.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching vehicles:', error);
    throw error;
  }
}

export async function getVehiclesByStatus(status: string): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vehicles by status:', error);
    throw error;
  }
}

export async function getVehiclesByType(vehicleType: string): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicle_type', vehicleType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vehicles by type:', error);
    throw error;
  }
}

// Mock data for development/testing - Updated to match actual database schema
export const mockVehicleData = {
  vehicles: [
    {
      id: '1',
      vehicle_id: 'ABC-123',
      license_plate: 'ABC-123',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      vehicle_type: 'Truck',
      color: 'White',
      capacity_kg: 1500,
      capacity_m3: 12.5,
      engine_type: 'Diesel',
      engine_size: '2.0L',
      fuel_type: 'Diesel',
      fuel_capacity: 80,
      fuel_consumption: 8.5,
      status: 'ACTIVE',
      current_location: 'Downtown Hub',
      current_driver_id: 1,
      current_fuel_level: 85,
      mileage: 25000,
      last_service_date: '2024-01-15',
      next_service_date: '2024-04-15',
      service_interval_km: 10000,
      last_inspection_date: '2024-01-10',
      next_inspection_date: '2024-07-10',
      insurance_company: 'Al-Rafidain Insurance',
      insurance_policy_number: 'POL-001-2024',
      insurance_expiry_date: '2024-12-31',
      registration_number: 'REG-001-2024',
      registration_expiry_date: '2024-12-31',
      purchase_date: '2022-01-15',
      purchase_price: 45000,
      current_value: 38000,
      depreciation_rate: 15.5,
      gps_enabled: true,
      tracking_device_id: 'GPS-001',
      last_gps_update: '2024-01-25T10:30:00Z',
      speed_limit_kmh: 80,
      notes: 'Primary delivery vehicle for downtown routes',
      specifications: {
        engine_power: '150 HP',
        transmission: 'Manual',
        drivetrain: 'RWD'
      },
      features: {
        air_conditioning: true,
        gps_tracking: true,
        backup_camera: true,
        bluetooth: true
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-25T10:30:00Z',
      created_by: 'System',
      updated_by: 'System',
      make_ar: 'فورد',
      model_ar: 'ترانزيت',
      vehicle_type_ar: 'شاحنة',
      status_ar: 'نشط',
      current_location_ar: 'المركز الرئيسي',
      notes_ar: 'مركبة التسليم الرئيسية لطرق وسط المدينة',
      created_by_ar: 'النظام',
      updated_by_ar: 'النظام'
    },
    {
      id: '2',
      vehicle_id: 'XYZ-789',
      license_plate: 'XYZ-789',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2021,
      vehicle_type: 'Van',
      color: 'Blue',
      capacity_kg: 1200,
      capacity_m3: 10.2,
      engine_type: 'Diesel',
      engine_size: '2.2L',
      fuel_type: 'Diesel',
      fuel_capacity: 70,
      fuel_consumption: 7.2,
      status: 'MAINTENANCE',
      current_location: 'Service Center',
      current_driver_id: 2,
      current_fuel_level: 45,
      mileage: 18000,
      last_service_date: '2024-01-20',
      next_service_date: '2024-04-20',
      service_interval_km: 10000,
      last_inspection_date: '2024-01-05',
      next_inspection_date: '2024-07-05',
      insurance_company: 'Al-Rafidain Insurance',
      insurance_policy_number: 'POL-002-2024',
      insurance_expiry_date: '2024-11-30',
      registration_number: 'REG-002-2024',
      registration_expiry_date: '2024-11-30',
      purchase_date: '2021-03-10',
      purchase_price: 55000,
      current_value: 42000,
      depreciation_rate: 12.8,
      gps_enabled: true,
      tracking_device_id: 'GPS-002',
      last_gps_update: '2024-01-24T14:15:00Z',
      speed_limit_kmh: 80,
      notes: 'Currently undergoing brake system maintenance',
      specifications: {
        engine_power: '163 HP',
        transmission: 'Automatic',
        drivetrain: 'RWD'
      },
      features: {
        air_conditioning: true,
        gps_tracking: true,
        backup_camera: true,
        bluetooth: true,
        cruise_control: true
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-24T14:15:00Z',
      created_by: 'System',
      updated_by: 'System',
      make_ar: 'مرسيدس',
      model_ar: 'سبرينتر',
      vehicle_type_ar: 'فان',
      status_ar: 'صيانة',
      current_location_ar: 'مركز الخدمة',
      notes_ar: 'خضع حالياً لصيانة نظام الفرامل',
      created_by_ar: 'النظام',
      updated_by_ar: 'النظام'
    },
    {
      id: '3',
      vehicle_id: 'DEF-456',
      license_plate: 'DEF-456',
      make: 'Honda',
      model: 'CB500',
      year: 2023,
      vehicle_type: 'Motorcycle',
      color: 'Red',
      capacity_kg: 200,
      capacity_m3: 0.5,
      engine_type: 'Gasoline',
      engine_size: '0.5L',
      fuel_type: 'Gasoline',
      fuel_capacity: 15,
      fuel_consumption: 4.5,
      status: 'ACTIVE',
      current_location: 'North Zone',
      current_driver_id: 3,
      current_fuel_level: 92,
      mileage: 5000,
      last_service_date: '2024-01-10',
      next_service_date: '2024-04-10',
      service_interval_km: 5000,
      last_inspection_date: '2024-01-08',
      next_inspection_date: '2024-07-08',
      insurance_company: 'Al-Rafidain Insurance',
      insurance_policy_number: 'POL-003-2024',
      insurance_expiry_date: '2024-10-15',
      registration_number: 'REG-003-2024',
      registration_expiry_date: '2024-10-15',
      purchase_date: '2023-06-01',
      purchase_price: 8000,
      current_value: 7200,
      depreciation_rate: 10.0,
      gps_enabled: true,
      tracking_device_id: 'GPS-003',
      last_gps_update: '2024-01-25T09:45:00Z',
      speed_limit_kmh: 60,
      notes: 'Quick delivery motorcycle for urgent packages',
      specifications: {
        engine_power: '47 HP',
        transmission: 'Manual',
        drivetrain: 'Chain'
      },
      features: {
        gps_tracking: true,
        bluetooth: true,
        led_lights: true
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-25T09:45:00Z',
      created_by: 'System',
      updated_by: 'System',
      make_ar: 'هوندا',
      model_ar: 'سي بي 500',
      vehicle_type_ar: 'دراجة نارية',
      status_ar: 'نشط',
      current_location_ar: 'المنطقة الشمالية',
      notes_ar: 'دراجة نارية للتسليم السريع للطرود العاجلة',
      created_by_ar: 'النظام',
      updated_by_ar: 'النظام'
    }
  ],
  drivers: [
    {
      id: '1',
      driver_id: 'DRV-001',
      first_name: 'Ahmed',
      last_name: 'Hassan',
      email: 'ahmed.hassan@company.com',
      phone: '+966501234567',
      license_number: 'LIC-001',
      license_type: 'Commercial',
      license_expiry: '2025-12-31',
      status: 'active',
      hire_date: '2023-01-15',
      salary: 5000,
      address: 'Riyadh, Saudi Arabia',
      emergency_contact_name: 'Fatima Hassan',
      emergency_contact_phone: '+966501234568',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  stats: {
    total_vehicles: 3,
    active_vehicles: 2,
    maintenance_vehicles: 1,
    low_fuel_vehicles: 1,
    total_drivers: 3,
    active_drivers: 3,
    total_maintenance_cost: 530,
    total_fuel_cost: 366,
    average_fuel_consumption: 6.73
  }
};
