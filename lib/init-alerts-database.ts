// Initialize alerts database - creates table if it doesn't exist
import { supabase } from './supabase'

export async function initializeAlertsDatabase(): Promise<boolean> {
  try {
    console.log('Initializing alerts database...')
    
    // Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Table does not exist or connection failed:', error)
      console.log('Please run the SQL script: create-unified-alerts-notifications-table.sql')
      return false
    }
    
    console.log('✅ Alerts database table exists and is accessible')
    return true
    
  } catch (error) {
    console.error('Database initialization failed:', error)
    return false
  }
}

export async function createSampleAlerts(): Promise<boolean> {
  try {
    console.log('Creating sample alerts...')
    
    const sampleAlerts = [
      {
        alert_id: 'SAMPLE_001',
        alert_type: 'system',
        category: 'warning',
        severity: 'medium',
        priority: 'medium',
        title: 'System Test Alert',
        message: 'This is a sample system alert for testing',
        description: 'Sample alert for database testing',
        status: 'active',
        is_read: false,
        is_resolved: false,
        notify_admins: true,
        send_push_notification: true,
        tags: ['sample', 'system'],
        source_system: 'sample_script',
        created_by: 'admin'
      },
      {
        alert_id: 'SAMPLE_002',
        alert_type: 'late_visit',
        category: 'warning',
        severity: 'high',
        priority: 'high',
        title: 'Late Visit Alert - Visit #V123',
        message: 'Agent Ahmed Ibrahim is 15 minutes late for Visit #V123 at Nile Supplies',
        description: 'Visit is running behind schedule with no arrival confirmation',
        status: 'active',
        is_read: false,
        is_resolved: false,
        visit_id: 'V123',
        delegate_id: 'REP-001',
        delegate_name: 'Ahmed Ibrahim',
        delegate_phone: '+201022505987',
        customer_name: 'Nile Supplies',
        customer_address: '123 Business District, Cairo',
        location: 'Nile Supplies Office',
        scheduled_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        delay_minutes: 15,
        escalation_level: 'escalated',
        notify_admins: true,
        notify_supervisors: true,
        send_push_notification: true,
        send_email_notification: true,
        tags: ['visit', 'late', 'escalated'],
        source_system: 'visit_management',
        created_by: 'late_visit_monitor'
      },
      {
        alert_id: 'SAMPLE_003',
        alert_type: 'vehicle',
        category: 'critical',
        severity: 'critical',
        priority: 'critical',
        title: 'Vehicle ABC-123 Low Fuel',
        message: 'Vehicle ABC-123 has only 15% fuel remaining',
        description: 'Critical fuel level alert requiring immediate attention',
        status: 'active',
        is_read: false,
        is_resolved: false,
        vehicle_id: 'ABC-123',
        vehicle_plate: 'ABC-123',
        driver_name: 'John Smith',
        driver_phone: '+1234567890',
        location: 'Highway 101',
        notify_admins: true,
        notify_supervisors: true,
        send_push_notification: true,
        send_email_notification: true,
        tags: ['vehicle', 'fuel', 'critical'],
        source_system: 'vehicle_tracking',
        created_by: 'system'
      }
    ]
    
    const { error } = await supabase
      .from('unified_alerts_notifications')
      .insert(sampleAlerts)
    
    if (error) {
      console.error('Error creating sample alerts:', error)
      return false
    }
    
    console.log('✅ Sample alerts created successfully')
    return true
    
  } catch (error) {
    console.error('Error creating sample alerts:', error)
    return false
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('unified_alerts_notifications')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
