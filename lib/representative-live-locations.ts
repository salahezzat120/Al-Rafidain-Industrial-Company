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
    // First, get all representatives
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('*')
      .order('name', { ascending: true })

    if (repsError) {
      console.error('Error fetching representatives:', repsError)
      return { data: null, error: repsError.message }
    }

    if (!reps || reps.length === 0) {
      return { data: [], error: null }
    }

    // Get the latest location for each representative using a more efficient approach
    const results: RepresentativeWithLocation[] = []
    
    // Use Promise.all for parallel processing
    const locationPromises = reps.map(async (rep) => {
      try {
        // Get the latest location for this representative
        // This query leverages the idx_live_locations_representative_timestamp index
        const { data: latestLocation, error: locError } = await supabase
          .from('representative_live_locations')
          .select('*')
          .eq('representative_id', rep.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (locError) {
          console.warn(`Error fetching location for representative ${rep.id}:`, locError)
        }

        // Calculate online status (within last 65 seconds - 60s + 5s buffer)
        const isOnline = latestLocation ? 
          ((new Date().getTime() - new Date(latestLocation.timestamp).getTime()) / (1000 * 60) <= 1.08) : 
          false

        return {
          ...rep,
          ...latestLocation,
          representative_name: rep.name,
          representative_phone: rep.phone,
          latitude: latestLocation?.latitude || null,
          longitude: latestLocation?.longitude || null,
          accuracy: latestLocation?.accuracy || null,
          altitude: latestLocation?.altitude || null,
          speed: latestLocation?.speed || null,
          heading: latestLocation?.heading || null,
          timestamp: latestLocation?.timestamp || null,
          battery_level: latestLocation?.battery_level || null,
          is_charging: latestLocation?.is_charging || false,
          network_type: latestLocation?.network_type || null,
          created_at: latestLocation?.created_at || null,
          is_online: isOnline,
          last_seen: latestLocation?.timestamp || null,
        }
      } catch (err) {
        console.error(`Error processing representative ${rep.id}:`, err)
        // Return representative without location data
        return {
          ...rep,
          representative_name: rep.name,
          representative_phone: rep.phone,
          latitude: null,
          longitude: null,
          is_online: false,
          last_seen: null,
        }
      }
    })

    // Wait for all location queries to complete
    const processedResults = await Promise.all(locationPromises)
    
    return { data: processedResults, error: null }
  } catch (err) {
    console.error('Unexpected error in getRepresentativeLiveLocations:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Get latest locations for all representatives using a single optimized query
export async function getLatestRepresentativeLocations(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    // Use a single query with window function to get the latest location for each representative
    // This leverages the database indexes for optimal performance
    const { data: results, error } = await supabase
      .rpc('get_latest_representative_locations')

    if (error) {
      console.error('Error fetching latest representative locations:', error)
      // Fallback to the regular method if RPC doesn't exist
      return await getRepresentativeLiveLocations()
    }

    return { data: results, error: null }
  } catch (err) {
    console.error('Unexpected error in getLatestRepresentativeLocations:', err)
    // Fallback to the regular method
    return await getRepresentativeLiveLocations()
  }
}

// Get representatives with their last known location (including those without recent locations)
export async function getRepresentativesWithLastLocation(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    // Get all representatives first
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('*')
      .order('name', { ascending: true })

    if (repsError) {
      return { data: null, error: repsError.message }
    }

    if (!reps || reps.length === 0) {
      return { data: [], error: null }
    }

    // Get the most recent location for each representative
    // This query uses the idx_live_locations_representative_timestamp index
    const { data: locations, error: locError } = await supabase
      .from('representative_live_locations')
      .select(`
        representative_id,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        timestamp,
        battery_level,
        is_charging,
        network_type,
        created_at
      `)
      .order('timestamp', { ascending: false })

    if (locError) {
      console.warn('Error fetching locations:', locError)
    }

    // Create a map of the latest location for each representative
    const locationMap = new Map()
    locations?.forEach((loc: any) => {
      if (!locationMap.has(loc.representative_id)) {
        locationMap.set(loc.representative_id, loc)
      }
    })

    // Combine representatives with their latest locations
    const results: RepresentativeWithLocation[] = reps.map(rep => {
      const latestLocation = locationMap.get(rep.id)
      const isOnline = latestLocation ? 
        ((new Date().getTime() - new Date(latestLocation.timestamp).getTime()) / (1000 * 60) <= 1.08) : 
        false

      return {
        ...rep,
        ...latestLocation,
        representative_name: rep.name,
        representative_phone: rep.phone,
        latitude: latestLocation?.latitude || null,
        longitude: latestLocation?.longitude || null,
        accuracy: latestLocation?.accuracy || null,
        altitude: latestLocation?.altitude || null,
        speed: latestLocation?.speed || null,
        heading: latestLocation?.heading || null,
        timestamp: latestLocation?.timestamp || null,
        battery_level: latestLocation?.battery_level || null,
        is_charging: latestLocation?.is_charging || false,
        network_type: latestLocation?.network_type || null,
        created_at: latestLocation?.created_at || null,
        is_online: isOnline,
        last_seen: latestLocation?.timestamp || null,
      }
    })

    return { data: results, error: null }
  } catch (err) {
    console.error('Unexpected error in getRepresentativesWithLastLocation:', err)
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

// Mark messages as read for a representative
export async function markMessagesAsRead(representative_id: string): Promise<{ error: string | null }> {
  try {
    // Mark all unread messages from this representative as read
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('representative_id', representative_id)
      .eq('sender_type', 'representative')
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking messages as read:', error);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error marking messages as read:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Fetch all representatives for chat (not just those with messages)
export async function getAllChatRepresentatives(): Promise<{ data: { id: string; name: string; phone: string; is_online?: boolean; last_seen?: string; unread_count?: number; last_message_time?: string | null }[] | null; error: string | null }> {
  try {
    // Fetch all representatives
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('id, name, phone')
    
    if (repsError) return { data: null, error: repsError.message };
    if (!reps || reps.length === 0) return { data: [], error: null };
    
    // Get all chat messages to calculate unread counts and last message time
    const { data: allMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('representative_id, is_read, sender_type, created_at')
      .order('created_at', { ascending: false })
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }
    
    // Calculate unread counts (only messages from representatives that are unread)
    const unreadCounts: { [key: string]: number } = {}
    const lastMessageTimes: { [key: string]: string | null } = {}
    
    if (allMessages) {
      allMessages.forEach((msg: any) => {
        const repId = msg.representative_id
        
        // Count unread messages from representatives only
        if (msg.sender_type === 'representative' && !msg.is_read) {
          unreadCounts[repId] = (unreadCounts[repId] || 0) + 1
        }
        
        // Track last message time for each representative
        if (!lastMessageTimes[repId] || (msg.created_at && new Date(msg.created_at) > new Date(lastMessageTimes[repId] || 0))) {
          lastMessageTimes[repId] = msg.created_at
        }
      })
    }
    
    // Get latest location for online status
    const results = []
    for (const rep of reps) {
      const { data: loc } = await supabase
        .from('representative_live_locations')
        .select('timestamp')
        .eq('representative_id', rep.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      const is_online = loc ? ((new Date().getTime() - new Date(loc.timestamp).getTime()) / (1000 * 60) <= 1.08) : false
      
      results.push({
        ...rep,
        is_online,
        last_seen: loc?.timestamp || null,
        unread_count: unreadCounts[rep.id] || 0,
        last_message_time: lastMessageTimes[rep.id] || null
      })
    }
    
    // Sort: unread messages first, then by last message time (newest first), then alphabetically
    results.sort((a, b) => {
      // First priority: unread count (higher first)
      if ((b.unread_count || 0) !== (a.unread_count || 0)) {
        return (b.unread_count || 0) - (a.unread_count || 0)
      }
      
      // Second priority: last message time (newer first)
      if (a.last_message_time && b.last_message_time) {
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      }
      if (a.last_message_time && !b.last_message_time) return -1
      if (!a.last_message_time && b.last_message_time) return 1
      
      // Third priority: alphabetical by name
      return a.name.localeCompare(b.name)
    })
    
    return { data: results, error: null };
  } catch (err) {
    console.error('Error in getAllChatRepresentatives:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Fetch representatives who have at least one chat message (legacy function for backward compatibility)
export async function getChatRepresentatives(): Promise<{ data: { id: string; name: string; phone: string; is_online?: boolean; last_seen?: string; unread_count?: number }[] | null; error: string | null }> {
  // Use the new function that gets all representatives
  return await getAllChatRepresentatives()
}

// Get representatives with actual online status (simple and reliable)
export async function getRepresentativesWithActualStatus(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_representatives_with_actual_status')

    if (error) {
      console.error('Error fetching representatives with actual status:', error)
      // Fallback to regular method
      return await getRepresentativeLiveLocations()
    }

    // Log actual status for debugging
    if (data) {
      const onlineCount = data.filter(r => r.is_online).length
      const offlineCount = data.length - onlineCount
      console.log(`Actual Status Check - Online: ${onlineCount}, Offline: ${offlineCount}`)
      
      // Log each representative's actual status
      data.forEach(rep => {
        const secondsAgo = rep.seconds_since_last_location ? Math.round(rep.seconds_since_last_location) : 'never'
        const status = rep.is_online ? 'ONLINE' : 'OFFLINE'
        console.log(`${rep.name}: ${status} (last seen: ${secondsAgo}s ago)`)
        
        // Additional debugging info
        if (rep.last_seen) {
          console.log(`  - Last location: ${rep.latitude}, ${rep.longitude}`)
          console.log(`  - Timestamp: ${new Date(rep.last_seen).toLocaleString()}`)
        } else {
          console.log(`  - No location data found`)
        }
      })
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in getRepresentativesWithActualStatus:', err)
    // Fallback to regular method
    return await getRepresentativeLiveLocations()
  }
}

// Get only online representatives (within last 60 seconds)
export async function getOnlineRepresentatives60s(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_online_representatives_60s')

    if (error) {
      console.error('Error fetching online representatives:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in getOnlineRepresentatives60s:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Get only offline representatives (no location within last 60 seconds)
export async function getOfflineRepresentatives60s(): Promise<{
  data: RepresentativeWithLocation[] | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_offline_representatives_60s')

    if (error) {
      console.error('Error fetching offline representatives:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in getOfflineRepresentatives60s:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Update all representative statuses based on actual data (simple and reliable)
export async function updateRepresentativeStatusFromActualData(): Promise<{
  data: any[] | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('update_representative_status_from_actual_data')

    if (error) {
      console.error('Error updating representative statuses from actual data:', error)
      return { data: null, error: error.message }
    }

    // Log status changes
    if (data && data.length > 0) {
      console.log('Representative Status Updates (Based on Actual Data):')
      data.forEach(change => {
        if (change.old_status !== change.new_status) {
          const secondsAgo = Math.round(change.seconds_since_location || 0)
          console.log(`${change.name}: ${change.old_status} → ${change.new_status} (last seen: ${secondsAgo}s ago)`)
        } else {
          const secondsAgo = Math.round(change.seconds_since_location || 0)
          console.log(`${change.name}: ${change.new_status} (no change, last seen: ${secondsAgo}s ago)`)
        }
      })
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in updateRepresentativeStatusFromActualData:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Check if a specific representative is online
export async function isRepresentativeOnline(representativeId: string): Promise<{
  data: boolean | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('is_representative_online', { rep_id: representativeId })

    if (error) {
      console.error('Error checking representative online status:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in isRepresentativeOnline:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Get detailed status for a specific representative
export async function getRepresentativeStatusDetails(representativeId: string): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_representative_status_details', { rep_id: representativeId })

    if (error) {
      console.error('Error getting representative status details:', error)
      return { data: null, error: error.message }
    }

    if (data && data.length > 0) {
      const details = data[0]
      console.log(`Representative ${details.name} Status:`)
      console.log(`  - Online: ${details.is_online}`)
      console.log(`  - Last seen: ${details.last_seen ? new Date(details.last_seen).toLocaleString() : 'Never'}`)
      console.log(`  - Seconds ago: ${Math.round(details.seconds_since_location || 0)}`)
      if (details.latitude && details.longitude) {
        console.log(`  - Location: ${details.latitude}, ${details.longitude}`)
      }
    }

    return { data: data?.[0] || null, error: null }
  } catch (err) {
    console.error('Unexpected error in getRepresentativeStatusDetails:', err)
    return { data: null, error: 'An unexpected error occurred' }
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
