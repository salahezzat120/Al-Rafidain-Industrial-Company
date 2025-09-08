export interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: string
  salary: number
  status: 'active' | 'inactive' | 'suspended'
  avatar_url?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  can_manage_customers?: boolean
  can_manage_drivers?: boolean
  can_manage_vehicles?: boolean
  can_view_analytics?: boolean
  can_manage_employees?: boolean
  can_manage_orders?: boolean
  can_manage_visits?: boolean
  can_manage_after_sales?: boolean
  total_work_days?: number
  total_absent_days?: number
  total_late_days?: number
  last_attendance_date?: string
  performance_rating?: number
  monthly_goals_completed?: number
  monthly_goals_total?: number
  last_performance_review?: string
  created_at: string
  updated_at: string
}

export interface EmployeePermission {
  id: string
  employee_id: string
  task_type: string
  permission_level: 'read' | 'write' | 'admin'
  granted_by?: string
  granted_at: string
  expires_at?: string
  is_active: boolean
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in_time?: string
  check_out_time?: string
  break_start_time?: string
  break_end_time?: string
  total_hours?: number
  overtime_hours: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'vacation'
  notes?: string
  created_at: string
  updated_at: string
}

export interface PerformanceReview {
  id: string
  employee_id: string
  review_period_start: string
  review_period_end: string
  overall_rating?: number
  punctuality_rating?: number
  work_quality_rating?: number
  teamwork_rating?: number
  communication_rating?: number
  goals_achieved: number
  goals_total: number
  strengths?: string
  areas_for_improvement?: string
  manager_notes?: string
  employee_notes?: string
  reviewed_by?: string
  review_date: string
  created_at: string
  updated_at: string
}

export interface CreateEmployeeData {
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: string
  salary: number
  status?: 'active' | 'inactive' | 'suspended'
  avatar_url?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  can_manage_customers?: boolean
  can_manage_drivers?: boolean
  can_manage_vehicles?: boolean
  can_view_analytics?: boolean
  can_manage_employees?: boolean
  can_manage_orders?: boolean
  can_manage_visits?: boolean
  can_manage_after_sales?: boolean
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: string
}

export interface CreatePermissionData {
  employee_id: string
  task_type: string
  permission_level: 'read' | 'write' | 'admin'
  granted_by?: string
  expires_at?: string
  is_active?: boolean
}

export interface UpdatePermissionData extends Partial<CreatePermissionData> {
  id: string
}

export interface CreateAttendanceData {
  employee_id: string
  date: string
  check_in_time?: string
  check_out_time?: string
  break_start_time?: string
  break_end_time?: string
  total_hours?: number
  overtime_hours?: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'vacation'
  notes?: string
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {
  id: string
}

export interface CreatePerformanceReviewData {
  employee_id: string
  review_period_start: string
  review_period_end: string
  overall_rating?: number
  punctuality_rating?: number
  work_quality_rating?: number
  teamwork_rating?: number
  communication_rating?: number
  goals_achieved?: number
  goals_total?: number
  strengths?: string
  areas_for_improvement?: string
  manager_notes?: string
  employee_notes?: string
  reviewed_by?: string
  review_date?: string
}

export interface UpdatePerformanceReviewData extends Partial<CreatePerformanceReviewData> {
  id: string
}

export interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  suspendedEmployees: number
  averageSalary: number
  totalSalary: number
  departmentStats: {
    [department: string]: number
  }
  positionStats: {
    [position: string]: number
  }
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  halfDays: number
  sickLeaveDays: number
  vacationDays: number
  totalHours: number
  overtimeHours: number
  attendanceRate: number
}

export interface PerformanceStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    [rating: string]: number
  }
  goalsAchievementRate: number
  topPerformers: Employee[]
  improvementAreas: string[]
}
