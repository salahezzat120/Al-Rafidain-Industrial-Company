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

    return { data, error: null }
  })
}

// Generate unique representative ID
const generateRepresentativeId = async (): Promise<string> => {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
  return randomNum;
}

export const addRepresentative = async (representativeData: {
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
  coverage_areas?: string[]
}): Promise<{ data: any | null; error: string | null }> => {
  return safeSupabaseQuery(async () => {
    const representativeId = await generateRepresentativeId();
    const { data, error } = await supabase
      .from('representatives')
      .insert([{ ...representativeData, representative_id: representativeId }])

    if (error) {
      console.error('Error adding representative:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message || 'Unknown error occurred' }
    }

    return { data, error: null }
  })
}