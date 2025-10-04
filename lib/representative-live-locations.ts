import { supabase } from '@/lib/supabase'
import {
  RepresentativeLiveLocation,
  RepresentativeWithLocation,
  AttendanceWithRepresentative,
  ChatMessage,
  CreateChatMessageData
} from '@/types/representative-live-locations'

// Get all representatives, with their latest location (if any)
export async function getRepresentativeLiveLocations(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    // 1. Get all representatives
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('*')

    if (repsError) {
      return { data: null, error: repsError.message }
    }

    // 2. For each rep, get their latest location (if any)
    const results: RepresentativeWithLocation[] = []
    for (const rep of reps) {
      const { data: loc, error: locError } = await supabase
        .from('representative_live_locations')
        .select('*')
        .eq('representative_id', rep.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()
      results.push({
        ...rep,
        ...loc,
        representative_name: rep.name,
        representative_phone: rep.phone,
        is_online: loc ? ((new Date().getTime() - new Date(loc.timestamp).getTime()) / (1000 * 60) <= 5) : false,
        last_seen: loc ? loc.timestamp : null,
        latitude: loc ? loc.latitude : null,
        longitude: loc ? loc.longitude : null,
      })
    }
    return { data: results, error: null }
  } catch (err) {
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export async function createRepresentativeLiveLocation(
  locationData: RepresentativeLiveLocation
): Promise<{ data: RepresentativeLiveLocation | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('representative_live_locations')
      .insert([locationData])
      .select()
      .single()

    if (error) {
      console.error('Error creating representative live location:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating representative live location:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export async function updateRepresentativeLiveLocation(
  id: string,
  updates: RepresentativeLiveLocation
): Promise<{ data: RepresentativeLiveLocation | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('representative_live_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating representative live location:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating representative live location:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export async function deleteRepresentativeLiveLocation(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('representative_live_locations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting representative live location:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting representative live location:', err)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getRepresentativeLiveLocationStats(): Promise<{
  data: {
    total_representatives: number
    online_representatives: number
    offline_representatives: number
    last_updated: string | null
  } | null
  error: string | null
}> {
  try {
    const { data: locations, error: locationsError } = await getRepresentativeLiveLocations()

    if (locationsError) {
      return { data: null, error: locationsError }
    }

    const onlineCount = locations?.filter(loc => loc.is_online).length || 0
    const totalCount = locations?.length || 0
    const lastUpdated = locations?.length ?
      new Date(Math.max(...locations.map(loc => new Date(loc.timestamp).getTime()))).toISOString() :
      null

    return {
      data: {
        total_representatives: totalCount,
        online_representatives: onlineCount,
        offline_representatives: totalCount - onlineCount,
        last_updated: lastUpdated
      },
      error: null
    }
  } catch (err) {
    console.error('Unexpected error getting representative live location stats:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Fetch attendance records with representative info
export async function getAttendanceRecords(): Promise<{
  data: AttendanceWithRepresentative[] | null;
  error: string | null;
}> {
  try {
    // First try the new representative_attendance table
    const { data: newData, error: newError } = await supabase
      .from('representative_attendance')
      .select(`
        *,
        representatives!representative_attendance_representative_id_fkey (name, phone)
      `)
      .order('check_in_time', { ascending: false });

    if (!newError && newData) {
      // Map representative info from the new table
      const mapped = (newData || []).map((row: any) => ({
        ...row,
        representative_name: row.representatives?.name || '',
        representative_phone: row.representatives?.phone || ''
      }));
      return { data: mapped, error: null };
    }

    // Fallback: try the old attendance table with manual join
    console.log('⚠️ representative_attendance table not found, trying fallback approach');
    
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .order('check_in_time', { ascending: false });

    if (attendanceError) {
      return { data: null, error: attendanceError.message };
    }

    // Get representatives data separately
    const { data: representativesData, error: representativesError } = await supabase
      .from('representatives')
      .select('id, name, phone');

    if (representativesError) {
      console.error('Error fetching representatives:', representativesError);
      return { data: null, error: 'Failed to fetch representative information' };
    }

    // Manually join the data
    const mapped = (attendanceData || []).map((row: any) => {
      const representative = representativesData?.find(rep => rep.id === row.representative_id);
      return {
        ...row,
        representative_name: representative?.name || '',
        representative_phone: representative?.phone || ''
      };
    });

    return { data: mapped, error: null };
  } catch (err) {
    console.error('Error in getAttendanceRecords:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Fetch chat messages for a representative
export async function getChatMessages(representative_id: string): Promise<{ data: ChatMessage[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('representative_id', representative_id)
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Send a new chat message
export async function sendChatMessage(message: CreateChatMessageData): Promise<{ data: ChatMessage | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Fetch representatives who have at least one chat message
export async function getChatRepresentatives(): Promise<{ data: { id: string; name: string; phone: string; is_online?: boolean; last_seen?: string; unread_count?: number }[] | null; error: string | null }> {
  try {
    // 1. Get all unique representative_ids from chat_messages
    const { data: chatIds, error: chatError } = await supabase
      .from('chat_messages')
      .select('representative_id')
    if (chatError) return { data: null, error: chatError.message };
    const uniqueIds = Array.from(new Set((chatIds || []).map((row: any) => row.representative_id)));
    if (uniqueIds.length === 0) return { data: [], error: null };
    
    // 2. Fetch those representatives with phone numbers
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('id, name, phone')
      .in('id', uniqueIds)
    if (repsError) return { data: null, error: repsError.message };
    
    // 3. Get latest location for online status
    const results = []
    for (const rep of reps || []) {
      const { data: loc } = await supabase
        .from('representative_live_locations')
        .select('timestamp')
        .eq('representative_id', rep.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      const is_online = loc ? ((new Date().getTime() - new Date(loc.timestamp).getTime()) / (1000 * 60) <= 5) : false
      
      results.push({
        ...rep,
        is_online,
        last_seen: loc?.timestamp || null,
        unread_count: 0 // TODO: Implement unread count logic
      })
    }
    
    return { data: results, error: null };
  } catch (err) {
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Log call attempt for tracking
export async function logCallAttempt(representative_id: string, phone_number: string, call_type: 'outgoing' | 'incoming' = 'outgoing'): Promise<{ data: any | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        representative_id,
        phone_number,
        call_type,
        initiated_at: new Date().toISOString(),
        status: 'initiated'
      })
      .select()
      .single()
    
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: 'An unexpected error occurred' }
  }
}
