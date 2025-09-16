export interface Visit {
  id: string
  delegate_id: string
  delegate_name: string
  customer_id: string
  customer_name: string
  customer_address: string
  scheduled_start_time: string
  scheduled_end_time: string
  actual_start_time?: string
  actual_end_time?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'late'
  visit_type: 'delivery' | 'pickup' | 'inspection' | 'maintenance' | 'meeting'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  created_at: string
  updated_at: string
  allowed_duration_minutes: number
  is_late: boolean
  exceeds_time_limit: boolean
}

export interface Delegate {
  id: string
  name: string
  email: string
  phone: string
  role: 'representative' | 'supervisor' | 'technician' | 'sales_rep'
  status: 'available' | 'busy' | 'offline' | 'on_visit'
  current_location?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface VisitAlert {
  id: string
  visit_id: string
  delegate_id: string
  alert_type: 'late_arrival' | 'time_exceeded' | 'no_show' | 'early_completion'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  is_read: boolean
  created_at: string
  admin_notified: boolean
}

export interface InternalMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  recipient_id: string
  recipient_name: string
  recipient_role: string
  subject: string
  message: string
  message_type: 'text' | 'system_alert' | 'visit_update' | 'urgent'
  is_read: boolean
  created_at: string
  read_at?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  message: string
  message_type: 'user' | 'bot'
  timestamp: string
  is_read: boolean
}
