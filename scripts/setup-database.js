// Database setup script for Al-Rafidain Industrial Company
// This script helps set up the database tables if they don't exist

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhdxceccjihhskfzijlb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHhjZWNjamloaHNrZnppamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDQ3NDEsImV4cCI6MjA3MTcyMDc0MX0.0IedEaesL7hr9BdRgKENvBNQ9XzTIJ0isfksRU_3nvc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

async function checkTables() {
  console.log('\nChecking database tables...')
  
  const tables = [
    'users',
    'visits',
    'visit_alerts',
    'messages',
    'customer_inquiries',
    'complaints',
    'maintenance_requests',
    'warranties',
    'warranty_claims',
    'follow_up_services',
    'support_agents'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' does not exist or is not accessible`)
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message)
    }
  }
}

async function main() {
  console.log('🚀 Al-Rafidain Industrial Company - Database Setup')
  console.log('================================================')
  
  const connected = await testConnection()
  
  if (connected) {
    await checkTables()
    
    console.log('\n📋 Next Steps:')
    console.log('1. If tables are missing, run the SQL schema from database-schema.sql')
    console.log('2. Make sure RLS policies are enabled')
    console.log('3. Check your Supabase project settings')
    console.log('4. Verify your API keys are correct')
  } else {
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your Supabase URL and API key')
    console.log('2. Verify your Supabase project is active')
    console.log('3. Check your internet connection')
    console.log('4. Ensure your Supabase project allows connections from your IP')
  }
}

main().catch(console.error)
