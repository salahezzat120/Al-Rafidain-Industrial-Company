import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhdxceccjihhskfzijlb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHhjZWNjamloaHNrZnppamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDQ3NDEsImV4cCI6MjA3MTcyMDc0MX0.0IedEaesL7hr9BdRgKENvBNQ9XzTIJ0isfksRU_3nvc'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
supabase.from('users').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error)
  } else {
    console.log('Supabase connection test successful')
  }
})

export type SupabaseUser = {
  id: string
  email: string
  role: 'Admin' | 'Supervisor' | 'Driver'
  created_at: string
}
