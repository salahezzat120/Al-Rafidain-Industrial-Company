// Test database connection and table existence
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test table structure
    const { data: alerts, error: alertsError } = await supabase
      .from('unified_alerts_notifications')
      .select('*')
      .limit(5)
    
    if (alertsError) {
      console.error('Table query error:', alertsError)
      return false
    }
    
    console.log('✅ Table exists and is accessible')
    console.log('Sample data:', alerts)
    
    return true
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}

testDatabaseConnection()
