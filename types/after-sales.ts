export interface CustomerInquiry {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  inquiry_type: 'general' | 'technical' | 'billing' | 'warranty' | 'complaint' | 'maintenance'
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  response_time_hours?: number
  customer_satisfaction_rating?: number
  tags: string[]
  attachments?: string[]
}

export interface Complaint {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  complaint_type: 'product_quality' | 'delivery_issue' | 'service_quality' | 'billing_error' | 'communication' | 'other'
  subject: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'investigating' | 'resolved' | 'closed' | 'escalated'
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolution_notes?: string
  compensation_offered?: string
  customer_satisfaction_rating?: number
  escalation_level: number
  related_orders?: string[]
  attachments?: string[]
}

export interface MaintenanceRequest {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  equipment_id?: string
  equipment_name?: string
  request_type: 'preventive' | 'corrective' | 'emergency' | 'warranty' | 'upgrade'
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  assigned_technician?: string
  assigned_technician_name?: string
  scheduled_date?: string
  completed_date?: string
  estimated_duration_hours?: number
  actual_duration_hours?: number
  cost_estimate?: number
  actual_cost?: number
  warranty_covered: boolean
  created_at: string
  updated_at: string
  customer_satisfaction_rating?: number
  service_notes?: string
  parts_used?: string[]
  attachments?: string[]
}

export interface Warranty {
  id: string
  customer_id: string
  customer_name: string
  product_id: string
  product_name: string
  order_id: string
  warranty_type: 'standard' | 'extended' | 'premium'
  start_date: string
  end_date: string
  duration_months: number
  coverage_details: string
  terms_conditions: string
  status: 'active' | 'expired' | 'void' | 'transferred'
  claims_count: number
  last_claim_date?: string
  created_at: string
  updated_at: string
  notes?: string
}

export interface WarrantyClaim {
  id: string
  warranty_id: string
  customer_id: string
  customer_name: string
  claim_type: 'repair' | 'replacement' | 'refund' | 'service'
  description: string
  issue_details: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed'
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolution_notes?: string
  cost_covered: number
  customer_satisfaction_rating?: number
  attachments?: string[]
}

export interface FollowUpService {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_type: 'satisfaction_survey' | 'product_training' | 'maintenance_reminder' | 'upgrade_offer' | 'feedback_collection'
  scheduled_date: string
  completed_date?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  assigned_to?: string
  assigned_to_name?: string
  priority: 'low' | 'medium' | 'high'
  description: string
  outcome?: string
  customer_satisfaction_rating?: number
  follow_up_required: boolean
  next_follow_up_date?: string
  created_at: string
  updated_at: string
  notes?: string
}

export interface AfterSalesMetrics {
  total_inquiries: number
  resolved_inquiries: number
  average_resolution_time_hours: number
  customer_satisfaction_score: number
  total_complaints: number
  resolved_complaints: number
  complaint_escalation_rate: number
  total_maintenance_requests: number
  completed_maintenance_requests: number
  average_maintenance_cost: number
  active_warranties: number
  warranty_claims_count: number
  warranty_claim_approval_rate: number
  scheduled_follow_ups: number
  completed_follow_ups: number
  customer_retention_rate: number
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  phone: string
  role: 'support_agent' | 'senior_agent' | 'team_lead' | 'manager'
  specializations: string[]
  current_workload: number
  max_workload: number
  performance_rating: number
  is_available: boolean
  created_at: string
  updated_at: string
}
