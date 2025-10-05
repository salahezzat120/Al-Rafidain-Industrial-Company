// Setup script to create the unified alerts table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAlertsDatabase() {
  try {
    console.log('Setting up alerts database...')
    
    // First, check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'unified_alerts_notifications')
    
    if (tablesError) {
      console.error('Error checking table existence:', tablesError)
      return false
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Table already exists')
    } else {
      console.log('❌ Table does not exist. Please run the SQL script first.')
      console.log('Run: create-unified-alerts-notifications-table.sql')
      return false
    }
    
    // Test inserting a sample alert
    const { data: insertData, error: insertError } = await supabase
      .from('unified_alerts_notifications')
      .insert({
        alert_id: `SETUP_TEST_${Date.now()}`,
        alert_type: 'system',
        category: 'info',
        severity: 'low',
        priority: 'low',
        title: 'Database Setup Test',
        message: 'This is a test alert to verify database setup',
        description: 'Setup verification alert',
        status: 'active',
        is_read: false,
        is_resolved: false,
        notify_admins: true,
        send_push_notification: false,
        send_email_notification: false,
        tags: ['setup', 'test'],
        source_system: 'setup_script',
        created_by: 'setup_script'
      })
      .select()
    
    if (insertError) {
      console.error('Error inserting test alert:', insertError)
      return false
    }
    
    console.log('✅ Test alert inserted successfully')
    
    // Test reading alerts
    const { data: alerts, error: readError } = await supabase
      .from('unified_alerts_notifications')
      .select('*')
      .eq('alert_id', `SETUP_TEST_${Date.now()}`)
    
    if (readError) {
      console.error('Error reading test alert:', readError)
      return false
    }
    
    console.log('✅ Test alert read successfully:', alerts?.length || 0)
    
    // Clean up test alert
    const { error: deleteError } = await supabase
      .from('unified_alerts_notifications')
      .delete()
      .eq('alert_id', `SETUP_TEST_${Date.now()}`)
    
    if (deleteError) {
      console.error('Error cleaning up test alert:', deleteError)
    } else {
      console.log('✅ Test alert cleaned up')
    }
    
    console.log('🎉 Database setup completed successfully!')
    return true
    
  } catch (error) {
    console.error('Setup failed:', error)
    return false
  }
}

setupAlertsDatabase()
