import { supabase } from './supabase'

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

export const handleSupabaseError = (error: any): SupabaseError => {
  if (!error) {
    return { message: 'Unknown error occurred' }
  }

  // Handle different types of errors
  if (error.message) {
    return {
      message: error.message,
      details: error.details || '',
      hint: error.hint || '',
      code: error.code || ''
    }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return {
    message: 'An unexpected error occurred',
    details: JSON.stringify(error),
    code: 'UNKNOWN_ERROR'
  }
}

export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: SupabaseError }> => {
  try {
    // Try to get the current session
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        success: false,
        error: handleSupabaseError(error)
      }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: handleSupabaseError(err)
    }
  }
}

export const createSupabaseClient = () => {
  return supabase
}

// Helper function to safely execute Supabase queries
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: SupabaseError | null }> => {
  try {
    const result = await queryFn()
    
    if (result.error) {
      return {
        data: null,
        error: handleSupabaseError(result.error)
      }
    }

    return {
      data: result.data,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: handleSupabaseError(err)
    }
  }
}

export const getRepresentatives = async (): Promise<{ data: any[]; error: string | null }> => {
  try {
    console.log('🔍 Fetching representatives from supabase-utils...')
    
    // Get representatives first
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('*')
      .in('status', ['active', 'on-route'])
      .order('name', { ascending: true })

    if (repsError) {
      console.error('❌ Error fetching representatives:', repsError)
      return { data: [], error: repsError.message || 'Failed to fetch representatives' }
    }

    if (!representatives || representatives.length === 0) {
      console.log('✅ No representatives found')
      return { data: [], error: null }
    }

    console.log('✅ Successfully fetched representatives:', representatives.length)

    // Try to get vehicle assignments if possible
    try {
      const { data: vehicleAssignments, error: assignmentsError } = await supabase
        .from('vehicle_assignments')
        .select(`
          *,
          vehicles (
            vehicle_id,
            make,
            model,
            license_plate,
            status
          )
        `)
        .eq('status', 'active')

      if (!assignmentsError && vehicleAssignments) {
        console.log('✅ Found vehicle assignments:', vehicleAssignments.length)
        
        // Create a map of representative_id to vehicle
        const vehicleMap = new Map()
        vehicleAssignments.forEach(assignment => {
          if (assignment.representative_id && assignment.vehicles) {
            vehicleMap.set(assignment.representative_id, assignment.vehicles)
          }
        })

        // Process representatives with vehicle information
        const processedData = representatives.map(rep => {
          const vehicle = vehicleMap.get(rep.id)
          if (vehicle) {
            rep.vehicle_display = `${vehicle.vehicle_id} - ${vehicle.make} ${vehicle.model}`
            rep.vehicle_details = {
              id: vehicle.vehicle_id,
              make: vehicle.make,
              model: vehicle.model,
              license_plate: vehicle.license_plate,
              status: vehicle.status
            }
          } else {
            // No vehicle assigned
            rep.vehicle_display = null
            rep.vehicle_details = null
          }
          return rep
        })

        console.log('✅ Successfully processed representatives with vehicle assignments')
        return { data: processedData, error: null }
      } else {
        console.log('⚠️ No vehicle assignments found, using basic representative data')
      }
    } catch (vehicleError) {
      console.log('⚠️ Could not fetch vehicle assignments:', vehicleError)
    }

    // Fallback: return representatives without vehicle information
    const processedData = representatives.map(rep => {
      rep.vehicle_display = rep.vehicle || null
      rep.vehicle_details = null
      return rep
    })

    console.log('✅ Returning representatives with basic vehicle info')
    return { data: processedData, error: null }
  } catch (err) {
    console.error('❌ Exception in getRepresentatives:', err)
    return { data: [], error: 'Failed to fetch representatives' }
  }
}

// Test function to check if representatives table exists and is accessible
export const testRepresentativesTable = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('representatives')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Table test error:', error)
      return { success: false, error: error.message }
    }

    console.log('Table test successful:', data)
    return { success: true }
  } catch (err) {
    console.error('Table test exception:', err)
    return { success: false, error: 'Table does not exist or is not accessible' }
  }
}

// Test function to try a simple insert
export const testSimpleInsert = async (): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const testData = {
      id: 'TEST-12345678',
      name: 'Test Representative',
      email: 'test@example.com',
      phone: '+1 (555) 123-4567',
      password: 'changeme123',
      status: 'active',
      coverage_areas: ['Test Area'],
      transportation_type: 'foot'
    };

    console.log('Testing simple insert with data:', testData);

    const { data, error } = await supabase
      .from('representatives')
      .insert([testData])
      .select();

    if (error) {
      console.error('Simple insert test error:', error)
      return { success: false, error: error.message }
    }

    console.log('Simple insert test successful:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Simple insert test exception:', err)
    return { success: false, error: 'Insert test failed' }
  }
}

// Authenticate representative
export const authenticateRepresentative = async (email: string, representativeId: string): Promise<any> => {
  try {
    console.log('Authenticating representative:', { email, representativeId })
    
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .eq('email', email)
      .eq('id', representativeId)
      .single();

    if (error) {
      console.error('Representative authentication error:', error);
      return null;
    }

    if (!data) {
      console.log('No representative found with these credentials');
      return null;
    }

    console.log('Representative authenticated successfully:', data);
    return data;
  } catch (error) {
    console.error('Representative authentication exception:', error);
    return null;
  }
}

// Generate unique representative ID
export const generateRepresentativeId = async (): Promise<string> => {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `REP-${randomNum}`;
}

// Add representative to users table for authentication
export const addRepresentativeToUsers = async (representativeData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Adding representative to users table:', representativeData)
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: representativeData.id,
        email: representativeData.email,
        password_hash: null, // No password for representatives (they use ID for authentication)
        role: 'representative',
        name: representativeData.name
      })
      .select()

    if (error) {
      console.error('Error adding representative to users table:', error)
      return { success: false, error: error.message }
    }

    console.log('Successfully added representative to users table:', data)
    return { success: true }
  } catch (error) {
    console.error('Exception adding representative to users table:', error)
    return { success: false, error: 'Failed to add representative to users table' }
  }
}

export const addRepresentative = async (representativeData: {
  id?: string,
  name: string,
  email: string,
  phone: string,
  password?: string,
  status?: string,
  location?: string,
  rating?: number,
  deliveries?: number,
  vehicle?: string,
  avatar_url?: string,
  join_date?: string,
  license_number?: string,
  emergency_contact?: string,
  address?: string,
  coverage_areas?: string[],
  transportation?: string
}): Promise<{ data: any | null; error: string | null }> => {
  return safeSupabaseQuery(async () => {
    const representativeId = representativeData.id || await generateRepresentativeId();
    
    // Map the data to match the representatives table schema
    const repData = {
      id: representativeId,
      name: representativeData.name,
      email: representativeData.email,
      phone: representativeData.phone,
      address: representativeData.address || null,
      license_number: representativeData.license_number || null,
      emergency_contact: representativeData.emergency_contact || null,
      vehicle: representativeData.vehicle || null,
      status: representativeData.status || 'active',
      coverage_areas: representativeData.coverage_areas || [],
      transportation_type: representativeData.transportation || 'foot',
      avatar_url: representativeData.avatar_url || null
    };

    console.log('Attempting to insert representative data:', repData);
    console.log('Data types:', {
      id: typeof repData.id,
      name: typeof repData.name,
      email: typeof repData.email,
      phone: typeof repData.phone,
      coverage_areas: typeof repData.coverage_areas,
      coverage_areas_value: repData.coverage_areas
    });

    // Try a simple insert first without .single() to see if that's the issue
    const { data, error } = await supabase
      .from('representatives')
      .insert([repData])
      .select();

    if (error) {
      console.error('Error adding representative:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error hint:', error.hint);
      console.error('Error details field:', error.details);
      return { data: null, error: error.message || 'Unknown error occurred' };
    }

    console.log('Successfully added representative:', data);
    
    // Also add to users table for authentication
    const userResult = await addRepresentativeToUsers(repData);
    if (!userResult.success) {
      console.error('Failed to add representative to users table:', userResult.error);
      // Don't fail the whole operation, just log the error
    }
    
    // Return the first item since we're inserting a single record
    return { data: data?.[0] || data, error: null };
  });
};