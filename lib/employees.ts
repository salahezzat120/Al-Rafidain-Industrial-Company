import { supabase } from './supabase'
import type {
  Employee,
  EmployeePermission,
  Attendance,
  PerformanceReview,
  CreateEmployeeData,
  UpdateEmployeeData,
  CreatePermissionData,
  UpdatePermissionData,
  CreateAttendanceData,
  UpdateAttendanceData,
  CreatePerformanceReviewData,
  UpdatePerformanceReviewData,
  EmployeeStats,
  AttendanceStats,
  PerformanceStats
} from '../types/employees'

// Employee CRUD operations
export const createEmployee = async (employeeData: CreateEmployeeData): Promise<{ data: Employee | null; error: string | null }> => {
  try {
    console.log('Creating employee with data:', employeeData)
    
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating employee:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message || 'Failed to create employee' }
    }

    console.log('Employee created successfully:', data)
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating employee:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getEmployees = async (): Promise<{ data: Employee[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return { data: null, error: error.message || 'Failed to fetch employees' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching employees:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getEmployeeById = async (id: string): Promise<{ data: Employee | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching employee:', error)
      return { data: null, error: error.message || 'Failed to fetch employee' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching employee:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updateEmployee = async (employeeData: UpdateEmployeeData): Promise<{ data: Employee | null; error: string | null }> => {
  try {
    const { id, ...updateData } = employeeData
    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      return { data: null, error: error.message || 'Failed to update employee' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating employee:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const deleteEmployee = async (id: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting employee:', error)
      return { error: error.message || 'Failed to delete employee' }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting employee:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Permission management
export const getEmployeePermissions = async (employeeId: string): Promise<{ data: EmployeePermission[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employee_permissions')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_active', true)
      .order('granted_at', { ascending: false })

    if (error) {
      console.error('Error fetching employee permissions:', error)
      return { data: null, error: error.message || 'Failed to fetch permissions' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching permissions:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const createPermission = async (permissionData: CreatePermissionData): Promise<{ data: EmployeePermission | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employee_permissions')
      .insert([permissionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating permission:', error)
      return { data: null, error: error.message || 'Failed to create permission' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating permission:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updatePermission = async (permissionData: UpdatePermissionData): Promise<{ data: EmployeePermission | null; error: string | null }> => {
  try {
    const { id, ...updateData } = permissionData
    const { data, error } = await supabase
      .from('employee_permissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating permission:', error)
      return { data: null, error: error.message || 'Failed to update permission' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating permission:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const deletePermission = async (id: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('employee_permissions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting permission:', error)
      return { error: error.message || 'Failed to delete permission' }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting permission:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Attendance management
export const getEmployeeAttendance = async (employeeId: string, startDate?: string, endDate?: string): Promise<{ data: Attendance[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
      return { data: null, error: error.message || 'Failed to fetch attendance' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching attendance:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const createAttendance = async (attendanceData: CreateAttendanceData): Promise<{ data: Attendance | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single()

    if (error) {
      console.error('Error creating attendance:', error)
      return { data: null, error: error.message || 'Failed to create attendance' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating attendance:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updateAttendance = async (attendanceData: UpdateAttendanceData): Promise<{ data: Attendance | null; error: string | null }> => {
  try {
    const { id, ...updateData } = attendanceData
    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating attendance:', error)
      return { data: null, error: error.message || 'Failed to update attendance' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating attendance:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Performance review management
export const getEmployeePerformanceReviews = async (employeeId: string): Promise<{ data: PerformanceReview[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('employee_id', employeeId)
      .order('review_date', { ascending: false })

    if (error) {
      console.error('Error fetching performance reviews:', error)
      return { data: null, error: error.message || 'Failed to fetch performance reviews' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching performance reviews:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const createPerformanceReview = async (reviewData: CreatePerformanceReviewData): Promise<{ data: PerformanceReview | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert([reviewData])
      .select()
      .single()

    if (error) {
      console.error('Error creating performance review:', error)
      return { data: null, error: error.message || 'Failed to create performance review' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating performance review:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updatePerformanceReview = async (reviewData: UpdatePerformanceReviewData): Promise<{ data: PerformanceReview | null; error: string | null }> => {
  try {
    const { id, ...updateData } = reviewData
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating performance review:', error)
      return { data: null, error: error.message || 'Failed to update performance review' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating performance review:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Statistics and analytics
export const getEmployeeStats = async (): Promise<{ data: EmployeeStats | null; error: string | null }> => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')

    if (error) {
      console.error('Error fetching employees for stats:', error)
      return { data: null, error: error.message || 'Failed to fetch employee statistics' }
    }

    if (!employees) {
      return { data: null, error: 'No employees found' }
    }

    const stats: EmployeeStats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.status === 'active').length,
      inactiveEmployees: employees.filter(emp => emp.status === 'inactive').length,
      suspendedEmployees: employees.filter(emp => emp.status === 'suspended').length,
      averageSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length,
      totalSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0),
      departmentStats: employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1
        return acc
      }, {} as { [department: string]: number }),
      positionStats: employees.reduce((acc, emp) => {
        acc[emp.position] = (acc[emp.position] || 0) + 1
        return acc
      }, {} as { [position: string]: number })
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Unexpected error calculating employee stats:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getAttendanceStats = async (employeeId: string, startDate?: string, endDate?: string): Promise<{ data: AttendanceStats | null; error: string | null }> => {
  try {
    const { data: attendance, error } = await getEmployeeAttendance(employeeId, startDate, endDate)
    
    if (error) {
      return { data: null, error }
    }

    if (!attendance) {
      return { data: null, error: 'No attendance data found' }
    }

    const stats: AttendanceStats = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      halfDays: attendance.filter(a => a.status === 'half_day').length,
      sickLeaveDays: attendance.filter(a => a.status === 'sick_leave').length,
      vacationDays: attendance.filter(a => a.status === 'vacation').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0),
      overtimeHours: attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0),
      attendanceRate: attendance.length > 0 ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100 : 0
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Unexpected error calculating attendance stats:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getPerformanceStats = async (employeeId: string): Promise<{ data: PerformanceStats | null; error: string | null }> => {
  try {
    const { data: reviews, error } = await getEmployeePerformanceReviews(employeeId)
    
    if (error) {
      return { data: null, error }
    }

    if (!reviews || reviews.length === 0) {
      return { data: null, error: 'No performance reviews found' }
    }

    const stats: PerformanceStats = {
      averageRating: reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution: reviews.reduce((acc, r) => {
        const rating = Math.round(r.overall_rating || 0).toString()
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      }, {} as { [rating: string]: number }),
      goalsAchievementRate: reviews.reduce((sum, r) => sum + (r.goals_achieved / r.goals_total), 0) / reviews.length * 100,
      topPerformers: [], // This would need to be calculated across all employees
      improvementAreas: reviews.flatMap(r => r.areas_for_improvement?.split(', ') || []).filter(Boolean)
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Unexpected error calculating performance stats:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Search functionality
export const searchEmployees = async (query: string): Promise<{ data: Employee[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,employee_id.ilike.%${query}%,position.ilike.%${query}%,department.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching employees:', error)
      return { data: null, error: error.message || 'Failed to search employees' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error searching employees:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Representatives functionality (alias for employees with representative role)
export const getRepresentatives = async (): Promise<{ data: Employee[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'representative')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching representatives:', error)
      return { data: null, error: error.message || 'Failed to fetch representatives' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching representatives:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}
