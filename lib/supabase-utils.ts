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

export const getRepresentatives = async (): Promise<{ data: any[] | null; error: string | null }> => {
  return safeSupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching representatives:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message || 'Unknown error occurred' }
    }

    console.log('Successfully fetched representatives:', data)
    return { data, error: null }
  })
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

// Generate unique representative ID
export const generateRepresentativeId = async (): Promise<string> => {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `REP-${randomNum}`;
}

export const addRepresentative = async (representativeData: {
  id?: string,
  name: string,
  email: string,
  phone: string,
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
    // Return the first item since we're inserting a single record
    return { data: data?.[0] || data, error: null };
  });
};