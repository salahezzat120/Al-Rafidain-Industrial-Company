// Vehicle Fleet Management Types
// This file contains all TypeScript type definitions for the vehicle fleet management system

export interface Vehicle {
  id: string;
  vehicle_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  engine_type?: string;
  fuel_type?: string;
  capacity_kg?: number;
  fuel_capacity_l?: number;
  status: VehicleStatus;
  fuel_level_percent: number;
  mileage_km: number;
  current_location?: string;
  insurance_company?: string;
  purchase_price?: number;
  service_interval_km?: number;
  speed_limit_kmh?: number;
  color?: string;
  fuel_consumption?: number;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  driver_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  license_number: string;
  license_type: string;
  license_expiry?: string;
  status: DriverStatus;
  hire_date?: string;
  salary?: number;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  maintenance_type: MaintenanceType;
  description?: string;
  maintenance_date: string;
  next_maintenance_date?: string;
  cost?: number;
  mileage_at_maintenance?: number;
  service_provider?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FuelRecord {
  id: string;
  vehicle_id: string;
  fuel_date: string;
  fuel_amount_l: number;
  fuel_cost: number;
  fuel_station?: string;
  odometer_reading?: number;
  fuel_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  driver_id: string;
  assignment_date: string;
  return_date?: string;
  status: AssignmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleTracking {
  id: string;
  vehicle_id: string;
  latitude?: number;
  longitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  timestamp: string;
  location_name?: string;
  created_at: string;
}

// Enums
export type VehicleType = 
  | 'Truck' 
  | 'Van' 
  | 'Car' 
  | 'Motorcycle' 
  | 'Bus' 
  | 'Trailer';

export type VehicleStatus = 
  | 'active' 
  | 'inactive' 
  | 'maintenance' 
  | 'repair' 
  | 'retired';

export type DriverStatus = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'terminated';

export type MaintenanceType = 
  | 'Oil Change' 
  | 'Brake Service' 
  | 'Tire Rotation' 
  | 'Engine Service' 
  | 'Transmission Service' 
  | 'Electrical Service' 
  | 'Body Repair' 
  | 'Other';

export type AssignmentStatus = 
  | 'active' 
  | 'completed' 
  | 'cancelled';

// API Request/Response Types
export interface CreateVehicleData {
  vehicle_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  engine_type?: string;
  fuel_type?: string;
  capacity_kg?: number;
  fuel_capacity_l?: number;
  status?: VehicleStatus;
  fuel_level_percent?: number;
  mileage_km?: number;
  current_location?: string;
  insurance_company?: string;
  purchase_price?: number;
  service_interval_km?: number;
  speed_limit_kmh?: number;
  color?: string;
  fuel_consumption?: number;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  id: string;
}

export interface CreateDriverData {
  driver_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  license_number: string;
  license_type: string;
  license_expiry?: string;
  status?: DriverStatus;
  hire_date?: string;
  salary?: number;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface UpdateDriverData extends Partial<CreateDriverData> {
  id: string;
}

export interface CreateMaintenanceData {
  vehicle_id: string;
  maintenance_type: MaintenanceType;
  description?: string;
  maintenance_date: string;
  next_maintenance_date?: string;
  cost?: number;
  mileage_at_maintenance?: number;
  service_provider?: string;
  notes?: string;
}

export interface CreateFuelRecordData {
  vehicle_id: string;
  fuel_date: string;
  fuel_amount_l: number;
  fuel_cost: number;
  fuel_station?: string;
  odometer_reading?: number;
  fuel_type?: string;
  notes?: string;
}

export interface CreateAssignmentData {
  vehicle_id: string;
  driver_id: string;
  assignment_date: string;
  return_date?: string;
  status?: AssignmentStatus;
  notes?: string;
}

export interface CreateTrackingData {
  vehicle_id: string;
  latitude?: number;
  longitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  location_name?: string;
}

// Statistics Types
export interface VehicleStats {
  total_vehicles: number;
  active_vehicles: number;
  maintenance_vehicles: number;
  low_fuel_vehicles: number;
  total_drivers: number;
  active_drivers: number;
  total_maintenance_cost: number;
  total_fuel_cost: number;
  average_fuel_consumption: number;
}

export interface VehicleFleetMetrics {
  fleet_utilization: number;
  maintenance_schedule: VehicleMaintenance[];
  fuel_efficiency: number;
  driver_performance: {
    driver_id: string;
    driver_name: string;
    total_deliveries: number;
    average_rating: number;
  }[];
  cost_analysis: {
    fuel_cost: number;
    maintenance_cost: number;
    insurance_cost: number;
    total_cost: number;
  };
}

// Search and Filter Types
export interface VehicleFilters {
  status?: VehicleStatus[];
  vehicle_type?: VehicleType[];
  make?: string[];
  year_from?: number;
  year_to?: number;
  fuel_level_min?: number;
  fuel_level_max?: number;
}

export interface DriverFilters {
  status?: DriverStatus[];
  license_type?: string[];
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface MaintenanceFilters {
  vehicle_id?: string;
  maintenance_type?: MaintenanceType[];
  date_from?: string;
  date_to?: string;
  cost_min?: number;
  cost_max?: number;
}

// Dashboard Types
export interface DashboardData {
  stats: VehicleStats;
  recent_activities: {
    type: 'maintenance' | 'fuel' | 'assignment' | 'tracking';
    description: string;
    timestamp: string;
    vehicle_id: string;
  }[];
  upcoming_maintenance: VehicleMaintenance[];
  low_fuel_vehicles: Vehicle[];
  active_assignments: VehicleAssignment[];
}

// Form Types
export interface VehicleFormData {
  vehicle_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  engine_type: string;
  fuel_type: string;
  capacity_kg: number;
  fuel_capacity_l: number;
  status: VehicleStatus;
  fuel_level_percent: number;
  mileage_km: number;
  current_location: string;
  insurance_company: string;
  purchase_price: number;
  service_interval_km: number;
  speed_limit_kmh: number;
  color: string;
  fuel_consumption: number;
}

export interface DriverFormData {
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  status: DriverStatus;
  hire_date: string;
  salary: number;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

// Error Types
export interface VehicleError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: VehicleError;
  success: boolean;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
