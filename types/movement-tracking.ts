export interface RepresentativeMovement {
  id: string;
  representative_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  activity_type: 'check_in' | 'check_out' | 'delivery_start' | 'delivery_complete' | 
                'break_start' | 'break_end' | 'location_update' | 'visit_start' | 
                'visit_end' | 'task_start' | 'task_complete' | 'idle';
  description?: string;
  duration_minutes?: number;
  distance_km?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  accuracy_meters?: number;
  battery_level?: number;
  is_charging?: boolean;
  network_type?: string;
  device_info?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface RepresentativeVisit {
  id: string;
  representative_id: string;
  visit_type: 'customer_visit' | 'delivery' | 'pickup' | 'maintenance' | 'inspection' | 'meeting';
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  visit_purpose?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  photos?: any[];
  signatures?: any;
  created_at: string;
  updated_at: string;
}

export interface RepresentativeDailySummary {
  id: string;
  representative_id: string;
  date: string;
  total_distance_km: number;
  total_duration_hours: number;
  total_visits: number;
  completed_visits: number;
  total_deliveries: number;
  completed_deliveries: number;
  check_in_time?: string;
  check_out_time?: string;
  break_duration_minutes: number;
  idle_duration_minutes: number;
  fuel_consumed_liters?: number;
  expenses?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MovementTrackingFilters {
  representative_id?: string;
  start_date?: string;
  end_date?: string;
  activity_type?: string;
  location_name?: string;
}

export interface MovementTrackingStats {
  total_movements: number;
  total_distance_km: number;
  total_duration_hours: number;
  unique_locations: number;
  most_common_activity: string;
  average_speed_kmh: number;
}

export interface CreateMovementData {
  representative_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  activity_type: string;
  description?: string;
  duration_minutes?: number;
  distance_km?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  accuracy_meters?: number;
  battery_level?: number;
  is_charging?: boolean;
  network_type?: string;
  device_info?: any;
  metadata?: any;
}

export interface CreateVisitData {
  representative_id: string;
  visit_type: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  visit_purpose?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  notes?: string;
}

export interface MovementReportData {
  representative_name: string;
  representative_id: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  movements: RepresentativeMovement[];
  visits: RepresentativeVisit[];
  daily_summaries: RepresentativeDailySummary[];
  stats: MovementTrackingStats;
}
