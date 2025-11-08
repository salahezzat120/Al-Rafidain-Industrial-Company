import { supabase } from '@/lib/supabase';

export interface Visit {
  id: string;
  representative_id: string;
  customer_name: string;
  customer_address: string;
  customer_phone?: string;
  visit_type: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'late';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  successRate: number;
  averageDuration: number;
}

/**
 * Fetch visits for a specific representative
 */
export async function getRepresentativeVisits(representativeId: string): Promise<{ data: Visit[]; error: string | null }> {
  try {
    console.log('🔍 Fetching visits for representative:', representativeId);

    // Try to fetch from visit_management table first (primary table)
    let { data: visitData, error: visitError } = await supabase
      .from('visit_management')
      .select('*')
      .eq('delegate_id', representativeId)
      .order('created_at', { ascending: false });

    if (visitError) {
      console.log('⚠️ visit_management table error:', visitError.message);
      console.log('🔄 Trying representative_visits table as fallback...');
      
      // Fallback to representative_visits table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('representative_visits')
        .select('*')
        .eq('representative_id', representativeId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.log('⚠️ representative_visits table error:', fallbackError.message);
        console.log('🔄 Trying visits table as final fallback...');
        
        // Final fallback to visits table
        const { data: finalFallbackData, error: finalFallbackError } = await supabase
          .from('visits')
          .select('*')
          .eq('delegate_id', representativeId)
          .order('created_at', { ascending: false });

        if (finalFallbackError) {
          console.log('⚠️ visits table error:', finalFallbackError.message);
          console.log('📝 No visit tables found. Please set up visit tables first.');
          console.log('📋 See VISIT_TABLES_SETUP_INSTRUCTIONS.md for setup instructions.');
          
          // Return empty data with helpful message
          return { 
            data: [], 
            error: 'Visit tables not found. Please set up the database tables first. See VISIT_TABLES_SETUP_INSTRUCTIONS.md for instructions.' 
          };
        }

        if (finalFallbackData) {
          // Transform visits table data to match our interface
          visitData = finalFallbackData.map(visit => ({
            id: visit.id,
            representative_id: visit.delegate_id,
            customer_name: visit.customer_name,
            customer_address: visit.customer_address,
            customer_phone: visit.customer_phone || 'N/A',
            visit_type: visit.visit_type,
            scheduled_start_time: visit.scheduled_start_time,
            scheduled_end_time: visit.scheduled_end_time,
            actual_start_time: visit.actual_start_time,
            actual_end_time: visit.actual_end_time,
            status: visit.status,
            notes: visit.notes,
            created_at: visit.created_at,
            updated_at: visit.updated_at
          }));
        }
      } else if (fallbackData) {
        // Transform representative_visits table data to match our interface
        visitData = fallbackData.map(visit => ({
          id: visit.id,
          representative_id: visit.representative_id,
          customer_name: visit.customer_name,
          customer_address: visit.customer_address,
          customer_phone: visit.customer_phone || 'N/A',
          visit_type: visit.visit_type,
          scheduled_start_time: visit.scheduled_start_time,
          scheduled_end_time: visit.scheduled_end_time,
          actual_start_time: visit.actual_start_time,
          actual_end_time: visit.actual_end_time,
          status: visit.status,
          notes: visit.notes,
          created_at: visit.created_at,
          updated_at: visit.updated_at
        }));
      }
    } else if (visitData) {
      // Transform visit_management table data to match our interface
      visitData = visitData.map(visit => ({
        id: visit.id,
        representative_id: visit.delegate_id,
        customer_name: visit.customer_name,
        customer_address: visit.customer_address,
        customer_phone: visit.customer_phone || 'N/A',
        visit_type: visit.visit_type,
        scheduled_start_time: visit.scheduled_start_time,
        scheduled_end_time: visit.scheduled_end_time,
        actual_start_time: visit.actual_start_time,
        actual_end_time: visit.actual_end_time,
        status: visit.status,
        notes: visit.notes,
        created_at: visit.created_at,
        updated_at: visit.updated_at
      }));
    }

    console.log('✅ Successfully fetched visits:', visitData?.length || 0);
    return { data: visitData || [], error: null };

  } catch (error) {
    console.error('❌ Exception in getRepresentativeVisits:', error);
    return { data: [], error: 'Failed to fetch visits. Please check database connection.' };
  }
}

/**
 * Calculate visit statistics
 */
export function calculateVisitStats(visits: Visit[]): VisitStats {
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'completed').length;
  const cancelledVisits = visits.filter(v => v.status === 'cancelled').length;
  const noShowVisits = visits.filter(v => v.status === 'no_show').length;
  const successRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

  // Calculate average duration for completed visits
  const completedWithDuration = visits.filter(v => 
    v.status === 'completed' && v.actual_start_time && v.actual_end_time
  );
  
  let averageDuration = 0;
  if (completedWithDuration.length > 0) {
    const totalDuration = completedWithDuration.reduce((sum, visit) => {
      const start = new Date(visit.actual_start_time!);
      const end = new Date(visit.actual_end_time!);
      return sum + (end.getTime() - start.getTime());
    }, 0);
    averageDuration = totalDuration / completedWithDuration.length / (1000 * 60); // Convert to minutes
  }

  return {
    totalVisits,
    completedVisits,
    cancelledVisits,
    noShowVisits,
    successRate,
    averageDuration
  };
}

/**
 * Create a new visit
 */
export async function createVisit(visitData: Partial<Visit>): Promise<{ data: Visit | null; error: string | null }> {
  try {
    console.log('📝 Creating new visit:', visitData);

    // Try to insert into representative_visits table first
    const { data, error } = await supabase
      .from('representative_visits')
      .insert([visitData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating visit:', error);
      return { data: null, error: error.message };
    }

    console.log('✅ Successfully created visit:', data?.id);
    return { data, error: null };

  } catch (error) {
    console.error('❌ Exception in createVisit:', error);
    return { data: null, error: 'Failed to create visit' };
  }
}

/**
 * Update an existing visit
 */
export async function updateVisit(visitId: string, updates: Partial<Visit>): Promise<{ data: Visit | null; error: string | null }> {
  try {
    console.log('📝 Updating visit:', visitId, updates);

    const { data, error } = await supabase
      .from('representative_visits')
      .update(updates)
      .eq('id', visitId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating visit:', error);
      return { data: null, error: error.message };
    }

    console.log('✅ Successfully updated visit:', data?.id);
    return { data, error: null };

  } catch (error) {
    console.error('❌ Exception in updateVisit:', error);
    return { data: null, error: 'Failed to update visit' };
  }
}

/**
 * Get all visits across all representatives (for admin view)
 */
export async function getAllVisits(): Promise<{ data: Visit[]; error: string | null }> {
  try {
    console.log('🔍 Fetching all visits...');

    // Try to fetch from visit_management table first (primary table)
    let { data: visitData, error: visitError } = await supabase
      .from('visit_management')
      .select('*')
      .order('created_at', { ascending: false });

    if (visitError) {
      console.log('⚠️ visit_management table error:', visitError.message);
      console.log('🔄 Trying representative_visits table as fallback...');
      
      // Fallback to representative_visits table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('representative_visits')
        .select('*')
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.log('⚠️ representative_visits table error:', fallbackError.message);
        console.log('🔄 Trying visits table as final fallback...');
        
        // Final fallback to visits table
        const { data: finalFallbackData, error: finalFallbackError } = await supabase
          .from('visits')
          .select('*')
          .order('created_at', { ascending: false });

        if (finalFallbackError) {
          console.error('❌ Error fetching all visits:', finalFallbackError);
          return { data: [], error: finalFallbackError.message };
        }

        if (finalFallbackData) {
          // Transform visits table data to match our interface
          visitData = finalFallbackData.map(visit => ({
            id: visit.id,
            representative_id: visit.delegate_id,
            customer_name: visit.customer_name,
            customer_address: visit.customer_address,
            customer_phone: visit.customer_phone || 'N/A',
            visit_type: visit.visit_type,
            scheduled_start_time: visit.scheduled_start_time,
            scheduled_end_time: visit.scheduled_end_time,
            actual_start_time: visit.actual_start_time,
            actual_end_time: visit.actual_end_time,
            status: visit.status,
            notes: visit.notes,
            created_at: visit.created_at,
            updated_at: visit.updated_at
          }));
        }
      } else if (fallbackData) {
        // Transform representative_visits table data to match our interface
        visitData = fallbackData.map(visit => ({
          id: visit.id,
          representative_id: visit.representative_id,
          customer_name: visit.customer_name,
          customer_address: visit.customer_address,
          customer_phone: visit.customer_phone || 'N/A',
          visit_type: visit.visit_type,
          scheduled_start_time: visit.scheduled_start_time,
          scheduled_end_time: visit.scheduled_end_time,
          actual_start_time: visit.actual_start_time,
          actual_end_time: visit.actual_end_time,
          status: visit.status,
          notes: visit.notes,
          created_at: visit.created_at,
          updated_at: visit.updated_at
        }));
      }
    } else if (visitData) {
      // Transform visit_management table data to match our interface
      visitData = visitData.map(visit => ({
        id: visit.id,
        representative_id: visit.delegate_id,
        customer_name: visit.customer_name,
        customer_address: visit.customer_address,
        customer_phone: visit.customer_phone || 'N/A',
        visit_type: visit.visit_type,
        scheduled_start_time: visit.scheduled_start_time,
        scheduled_end_time: visit.scheduled_end_time,
        actual_start_time: visit.actual_start_time,
        actual_end_time: visit.actual_end_time,
        status: visit.status,
        notes: visit.notes,
        created_at: visit.created_at,
        updated_at: visit.updated_at
      }));
    }

    console.log('✅ Successfully fetched all visits:', visitData?.length || 0);
    return { data: visitData || [], error: null };

  } catch (error) {
    console.error('❌ Exception in getAllVisits:', error);
    return { data: [], error: 'Failed to fetch visits' };
  }
}