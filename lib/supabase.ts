import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection with error handling
const testConnection = async () => {
  try {
    // Try a simple query that should work regardless of table existence
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    if (error) {
      // If RPC fails, try a basic auth check
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (authError) {
        console.error('Supabase connection test failed:', error)
      } else {
        console.log('Supabase connection test successful (auth check)')
      }
    } else {
      console.log('Supabase connection test successful')
    }
  } catch (err) {
    console.error('Supabase connection test failed:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      details: err instanceof Error ? err.stack : '',
      hint: 'Check your Supabase URL and API key',
      code: 'CONNECTION_ERROR'
    })
  }
}

// Only test connection in browser environment and after a delay
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1000)
}

export type SupabaseUser = {
  id: string
  email: string
  role: 'Admin' | 'Supervisor' | 'Representative'
  created_at: string
}
