import { supabase } from '@/lib/supabase';
import { MovementReportData, RepresentativeMovement, RepresentativeVisit } from '@/types/movement-tracking';

export interface MovementDataFilters {
  representative_id?: string;
  start_date: string;
  end_date: string;
}

export async function getMovementData(filters: MovementDataFilters): Promise<{
  data: MovementReportData | null;
  error: string | null;
}> {
  try {
    // Get representative info
    const { data: representative, error: repError } = await supabase
      .from('representatives')
      .select('id, name')
      .eq('id', filters.representative_id)
      .single();

    if (repError) {
      return { data: null, error: `Representative not found: ${repError.message}` };
    }

    // Get movements from representative_live_locations
    const { data: movements, error: movementsError } = await supabase
      .from('representative_live_locations')
      .select('*')
      .eq('representative_id', filters.representative_id)
      .gte('created_at', filters.start_date)
      .lte('created_at', filters.end_date)
      .order('created_at', { ascending: false });

    if (movementsError) {
      console.warn('Error fetching movements:', movementsError);
    }

    // Get visits from visit_management_single (if table exists)
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management_single')
      .select('*')
      .eq('delegate_id', filters.representative_id)
      .gte('created_at', filters.start_date)
      .lte('created_at', filters.end_date)
      .order('created_at', { ascending: false });

    if (visitsError) {
      console.warn('Error fetching visits:', visitsError);
    }

    // Transform movements data
    const transformedMovements: RepresentativeMovement[] = (movements || []).map(movement => ({
      id: movement.id,
      representative_id: movement.representative_id,
      activity_type: 'location_update',
      description: `Location update at ${movement.latitude}, ${movement.longitude}`,
      location_name: movement.current_location || 'Unknown Location',
      latitude: movement.latitude,
      longitude: movement.longitude,
      distance_km: 0, // Calculate if needed
      duration_minutes: 0,
      speed_kmh: movement.speed || 0,
      accuracy_meters: movement.accuracy || 0,
      battery_level: movement.battery_level?.toString() || '',
      network_type: movement.network_type || '',
      created_at: movement.created_at,
      updated_at: movement.updated_at
    }));

    // Transform visits data
    const transformedVisits: RepresentativeVisit[] = (visits || []).map(visit => ({
      id: visit.id,
      representative_id: visit.delegate_id,
      visit_type: visit.visit_type || 'customer_visit',
      customer_name: visit.customer_name || '',
      customer_address: visit.customer_address || '',
      customer_phone: visit.customer_phone || '',
      visit_purpose: visit.notes || '',
      scheduled_start_time: visit.scheduled_start_time,
      scheduled_end_time: visit.scheduled_end_time,
      actual_start_time: visit.actual_start_time,
      actual_end_time: visit.actual_end_time,
      status: visit.status || 'scheduled',
      notes: visit.notes || '',
      created_at: visit.created_at,
      updated_at: visit.updated_at
    }));

    // Calculate statistics
    const totalMovements = transformedMovements.length;
    const totalDistance = transformedMovements.reduce((sum, m) => sum + (m.distance_km || 0), 0);
    const totalDuration = transformedMovements.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / 60; // Convert to hours
    const uniqueLocations = new Set(transformedMovements.map(m => `${m.latitude},${m.longitude}`)).size;
    const averageSpeed = totalMovements > 0 ? transformedMovements.reduce((sum, m) => sum + (m.speed_kmh || 0), 0) / totalMovements : 0;

    const reportData: MovementReportData = {
      representative_id: representative.id,
      representative_name: representative.name,
      movements: transformedMovements,
      visits: transformedVisits,
      daily_summaries: [], // Could be calculated from movements and visits
      stats: {
        total_movements: totalMovements,
        total_distance_km: totalDistance,
        total_duration_hours: totalDuration,
        unique_locations: uniqueLocations,
        most_common_activity: 'location_update',
        average_speed_kmh: averageSpeed
      }
    };

    return { data: reportData, error: null };
  } catch (error) {
    console.error('Error in getMovementData:', error);
    return { data: null, error: 'An unexpected error occurred while fetching movement data' };
  }
}

export async function getAllRepresentativesMovementData(filters: Omit<MovementDataFilters, 'representative_id'>): Promise<{
  data: MovementReportData[] | null;
  error: string | null;
}> {
  try {
    // Get all representatives
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('id, name')
      .order('name', { ascending: true });

    if (repsError) {
      return { data: null, error: `Error fetching representatives: ${repsError.message}` };
    }

    if (!representatives || representatives.length === 0) {
      return { data: [], error: null };
    }

    // Get movement data for each representative
    const results = await Promise.all(
      representatives.map(async (rep) => {
        const result = await getMovementData({
          ...filters,
          representative_id: rep.id
        });
        return result.data;
      })
    );

    const validResults = results.filter((data): data is MovementReportData => data !== null);

    return { data: validResults, error: null };
  } catch (error) {
    console.error('Error in getAllRepresentativesMovementData:', error);
    return { data: null, error: 'An unexpected error occurred while fetching all movement data' };
  }
}
