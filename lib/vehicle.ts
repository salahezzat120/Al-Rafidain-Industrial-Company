// Vehicle Fleet Management API Functions
// This file contains all API functions for interacting with the vehicle fleet management database

import { createClient } from '@supabase/supabase-js';
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

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Vehicle CRUD Operations
export async function getVehicles(filters?: VehicleFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Vehicle>> {
  try {
    // Check if Supabase is properly configured
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.log('Supabase not configured, using mock data');
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
    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
  try {
    // Check if Supabase is properly configured
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.log('Supabase not configured, simulating vehicle creation');
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

    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    // Check if Supabase is properly configured
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.log('Supabase not configured, using mock data');
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
    // Check if Supabase is properly configured
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.log('Supabase not configured, using mock stats');
      return mockVehicleData.stats;
    }

    // Get total vehicles
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    // Get active vehicles
    const { count: activeVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get maintenance vehicles
    const { count: maintenanceVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'maintenance');

    // Get low fuel vehicles
    const { count: lowFuelVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .lt('fuel_level_percent', 25);

    // Get total drivers
    const { count: totalDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true });

    // Get active drivers
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

    // Get low fuel vehicles
    const { data: lowFuelVehicles } = await supabase
      .from('vehicles')
      .select('*')
      .lt('fuel_level_percent', 25)
      .order('fuel_level_percent', { ascending: true });

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

// Mock data for development/testing
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
      engine_type: 'Diesel',
      fuel_type: 'Diesel',
      capacity_kg: 1500,
      fuel_capacity_l: 80,
      status: 'active',
      fuel_level_percent: 85,
      mileage_km: 25000,
      current_location: 'Downtown Hub',
      insurance_company: 'Insurance Co.',
      purchase_price: 45000,
      service_interval_km: 10000,
      speed_limit_kmh: 80,
      color: 'White',
      fuel_consumption: 8.5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      vehicle_id: 'XYZ-789',
      license_plate: 'XYZ-789',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2021,
      vehicle_type: 'Van',
      engine_type: 'Diesel',
      fuel_type: 'Diesel',
      capacity_kg: 1200,
      fuel_capacity_l: 70,
      status: 'maintenance',
      fuel_level_percent: 45,
      mileage_km: 18000,
      current_location: 'Service Center',
      insurance_company: 'Insurance Co.',
      purchase_price: 55000,
      service_interval_km: 10000,
      speed_limit_kmh: 80,
      color: 'Blue',
      fuel_consumption: 7.2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
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
