import { createAlert } from './alerts'
import { supabase } from './supabase'

export async function createSampleAlerts() {
  const sampleAlerts = [
    {
      alert_id: 'ALERT-001',
      alert_type: 'vehicle' as const,
      category: 'critical' as const,
      severity: 'high' as const,
      priority: 'high' as const,
      title: 'Vehicle Maintenance Due',
      message: 'Truck #VH-001 needs service',
      description: 'Vehicle VH-001 has exceeded its maintenance interval and requires immediate service.',
      status: 'active' as const,
      vehicle_id: 'VH-001',
      vehicle_plate: 'VH-001',
      driver_name: 'Ahmed Hassan',
      driver_phone: '+201234567890',
      location: 'Cairo Warehouse',
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      notify_admins: true,
      notify_supervisors: true,
      send_push_notification: true,
      metadata: {
        maintenance_type: 'scheduled',
        last_service_date: '2024-01-15',
        next_service_due: '2024-02-15'
      },
      tags: ['maintenance', 'vehicle', 'urgent'],
      source_system: 'fleet_management',
      created_by: 'system'
    },
    {
      alert_id: 'ALERT-002',
      alert_type: 'delivery' as const,
      category: 'warning' as const,
      severity: 'medium' as const,
      priority: 'medium' as const,
      title: 'Delayed Delivery',
      message: 'Order #12345 is 30 mins behind schedule',
      description: 'Delivery order 12345 is running 30 minutes behind the scheduled delivery time.',
      status: 'active' as const,
      customer_id: 'CUST-001',
      customer_name: 'Al-Rashid Trading Co.',
      customer_address: '123 Main Street, Cairo',
      vehicle_id: 'VH-002',
      vehicle_plate: 'VH-002',
      driver_name: 'Mohamed Ali',
      driver_phone: '+201234567891',
      location: 'Cairo Downtown',
      scheduled_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      actual_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      delay_minutes: 30,
      grace_period_minutes: 15,
      escalation_threshold_minutes: 45,
      notify_admins: true,
      notify_supervisors: false,
      send_push_notification: true,
      metadata: {
        order_id: '12345',
        customer_contact: '+201234567892',
        delivery_notes: 'Fragile items - handle with care'
      },
      tags: ['delivery', 'delay', 'customer'],
      source_system: 'delivery_tracking',
      created_by: 'system'
    },
    {
      alert_id: 'ALERT-003',
      alert_type: 'system' as const,
      category: 'success' as const,
      severity: 'low' as const,
      priority: 'low' as const,
      title: 'Route Optimized',
      message: 'Saved 45 mins on Route A',
      description: 'Route optimization algorithm has successfully reduced travel time by 45 minutes.',
      status: 'active' as const,
      vehicle_id: 'VH-003',
      vehicle_plate: 'VH-003',
      driver_name: 'Omar Khalil',
      driver_phone: '+201234567893',
      location: 'Route A - Alexandria',
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      notify_admins: false,
      notify_supervisors: false,
      send_push_notification: false,
      metadata: {
        route_id: 'ROUTE-A',
        original_duration: '3h 30m',
        optimized_duration: '2h 45m',
        savings: '45 minutes',
        fuel_savings: '15%'
      },
      tags: ['optimization', 'route', 'efficiency'],
      source_system: 'route_optimization',
      created_by: 'system'
    },
    {
      alert_id: 'ALERT-004',
      alert_type: 'warehouse' as const,
      category: 'warning' as const,
      severity: 'medium' as const,
      priority: 'medium' as const,
      title: 'Low Stock Alert',
      message: 'Product #P-001 is running low',
      description: 'Product P-001 (Plastic Plates - Large) has only 50 units remaining, below the minimum threshold of 100 units.',
      status: 'active' as const,
      location: 'Main Warehouse',
      notify_admins: true,
      notify_supervisors: true,
      send_push_notification: true,
      metadata: {
        product_id: 'P-001',
        product_name: 'Plastic Plates - Large',
        current_stock: 50,
        minimum_threshold: 100,
        reorder_quantity: 500,
        supplier: 'Plastic Manufacturing Co.'
      },
      tags: ['inventory', 'low_stock', 'warehouse'],
      source_system: 'warehouse_management',
      created_by: 'system'
    },
    {
      alert_id: 'ALERT-005',
      alert_type: 'visit' as const,
      category: 'critical' as const,
      severity: 'high' as const,
      priority: 'high' as const,
      title: 'Late Visit Alert',
      message: 'Visit to Customer ABC is 45 minutes late',
      description: 'Scheduled visit to Customer ABC is running 45 minutes behind schedule.',
      status: 'active' as const,
      visit_id: 'VISIT-001',
      delegate_id: 'DEL-001',
      delegate_name: 'Sara Ahmed',
      delegate_phone: '+201234567894',
      delegate_email: 'sara.ahmed@company.com',
      customer_id: 'CUST-002',
      customer_name: 'ABC Trading Company',
      customer_address: '456 Business District, Cairo',
      location: 'Cairo Business District',
      scheduled_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      actual_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      delay_minutes: 45,
      grace_period_minutes: 15,
      escalation_threshold_minutes: 30,
      escalation_level: 'escalated' as const,
      escalation_count: 1,
      last_escalated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      escalation_notes: 'Customer has been notified of delay',
      notify_admins: true,
      notify_supervisors: true,
      send_push_notification: true,
      send_email_notification: true,
      metadata: {
        visit_type: 'sales_call',
        customer_contact: '+201234567895',
        visit_duration: '2 hours',
        visit_purpose: 'Product demonstration'
      },
      tags: ['visit', 'late', 'customer', 'escalated'],
      source_system: 'visit_management',
      created_by: 'system'
    }
  ]

  const results = []
  
  for (const alertData of sampleAlerts) {
    try {
      const result = await createAlert(alertData)
      if (result.error) {
        console.error('Error creating sample alert:', result.error)
      } else {
        console.log('✅ Sample alert created:', result.data?.title)
        results.push(result.data)
      }
    } catch (error) {
      console.error('Error creating sample alert:', error)
    }
  }

  return results
}

export async function clearAllAlerts() {
  try {
    if (!supabase) {
      console.error('Database connection not available')
      return
    }

    const { error } = await supabase
      .from('unified_alerts_notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      console.error('Error clearing alerts:', error)
    } else {
      console.log('✅ All alerts cleared')
    }
  } catch (error) {
    console.error('Error clearing alerts:', error)
  }
}
