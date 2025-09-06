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
