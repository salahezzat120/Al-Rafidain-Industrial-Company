'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  Download,
  Filter,
  Plus,
  Building,
  Briefcase,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  User,
  Shield,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, EmployeeStats } from '@/types/employees'
import { getEmployees, getEmployeeStats, deleteEmployee } from '@/lib/employees'
import AddEmployeeModal from './add-employee-modal'
import EmployeeProfileModal from './employee-profile-modal'
import EmployeePermissionsModal from './employee-permissions-modal'
import AttendanceModal from './attendance-modal'
import PerformanceModal from './performance-modal'

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
    fetchStats()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchQuery, selectedDepartment, selectedStatus])

    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
      const { data, error } = await getEmployees()
        if (error) {
          setError(error)
        toast.error('Failed to fetch employees')
        return
      }
      setEmployees(data || [])
      } catch (err) {
        setError('An unexpected error occurred')
      toast.error('Failed to fetch employees')
      } finally {
        setIsLoading(false)
      }
    }

  const fetchStats = async () => {
    try {
      const { data, error } = await getEmployeeStats()
      if (error) {
        console.error('Failed to fetch stats:', error)
        return
      }
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    if (searchQuery) {
      filtered = filtered.filter(employee =>
        employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(employee => employee.department === selectedDepartment)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(employee => employee.status === selectedStatus)
    }

    setFilteredEmployees(filtered)
  }

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev])
    fetchStats()
    toast.success('Employee added successfully')
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp))
    fetchStats()
    toast.success('Employee updated successfully')
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await deleteEmployee(employeeId)
      if (error) {
        toast.error('Failed to delete employee')
        return
      }
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
      fetchStats()
      toast.success('Employee deleted successfully')
    } catch (err) {
      toast.error('Failed to delete employee')
    }
  }

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowProfileModal(true)
  }

  const handleEditPermissions = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowPermissionsModal(true)
  }

  const handleViewAttendance = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowAttendanceModal(true)
  }

  const handleViewPerformance = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowPerformanceModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4" />
      case 'inactive': return <Clock className="h-4 w-4" />
      case 'suspended': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const departments = Array.from(new Set(employees.map(emp => emp.department)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employee Management</h2>
            <p className="text-muted-foreground">Manage your team members, permissions, and performance</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employee Management</h2>
            <p className="text-muted-foreground">Manage your team members, permissions, and performance</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
            </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">Manage your team members, permissions, and performance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
                {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${stats.averageSalary.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${stats.totalSalary.toFixed(0)}
              </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.departmentStats).length}</div>
              <p className="text-xs text-muted-foreground">
                {Object.entries(stats.departmentStats).map(([dept, count]) => `${dept}: ${count}`).join(', ')}
              </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}%
            </div>
              <p className="text-xs text-muted-foreground">
                {stats.inactiveEmployees} inactive, {stats.suspendedEmployees} suspended
              </p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
      </div>
        </div>
        </CardContent>
      </Card>

      {/* Employees Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar_url} />
                <AvatarFallback>
                  {employee.first_name[0]}{employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
                  <div>
                    <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <Badge className={`mt-1 ${getStatusColor(employee.status)}`}>
                    {getStatusIcon(employee.status)}
                    <span className="ml-1 capitalize">{employee.status}</span>
                  </Badge>
                  </div>
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProfile(employee)}>
                      <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditPermissions(employee)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Permissions
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewAttendance(employee)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Attendance
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewPerformance(employee)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Performance Review
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Employee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  {employee.department}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Hired: {new Date(employee.hire_date).toLocaleDateString()}
                </div>
                {employee.salary && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${employee.salary.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || selectedDepartment !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first employee'
              }
            </p>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddEmployeeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={handleAddEmployee}
      />

      {selectedEmployee && (
        <>
          <EmployeeProfileModal
            employee={selectedEmployee}
            open={showProfileModal}
            onOpenChange={setShowProfileModal}
            onUpdate={handleUpdateEmployee}
          />
          <EmployeePermissionsModal
            employee={selectedEmployee}
            open={showPermissionsModal}
            onOpenChange={setShowPermissionsModal}
          />
          <AttendanceModal
            employee={selectedEmployee}
            open={showAttendanceModal}
            onOpenChange={setShowAttendanceModal}
          />
          <PerformanceModal
            employee={selectedEmployee}
            open={showPerformanceModal}
            onOpenChange={setShowPerformanceModal}
          />
        </>
      )}
    </div>
  )
}
