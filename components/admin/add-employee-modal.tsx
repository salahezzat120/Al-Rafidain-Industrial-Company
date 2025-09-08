'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  MapPin, 
  UserCheck, 
  AlertCircle,
  Loader2,
  CheckCircle,
  UserPlus,
  FileText,
  Shield,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, CreateEmployeeData } from '@/types/employees'
import { createEmployee } from '@/lib/employees'

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (employee: Employee) => void
}

export default function AddEmployeeModal({ open, onOpenChange, onAdd }: AddEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState<CreateEmployeeData>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    salary: 0,
    status: 'active',
    avatar_url: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    can_manage_customers: false,
    can_manage_drivers: false,
    can_manage_vehicles: false,
    can_view_analytics: false,
    can_manage_employees: false,
    can_manage_orders: false,
    can_manage_visits: false,
    can_manage_after_sales: false
  })

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic employee details' },
    { id: 2, title: 'Employment Details', description: 'Position and department' },
    { id: 3, title: 'Additional Information', description: 'Emergency contacts and documents' }
  ]

  const progress = (currentStep / steps.length) * 100

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (step === 1) {
      if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required'
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    }

    if (step === 2) {
      if (!formData.position.trim()) newErrors.position = 'Position is required'
      if (!formData.department.trim()) newErrors.department = 'Department is required'
      if (!formData.hire_date) newErrors.hire_date = 'Hire date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      console.log('Form data being submitted:', formData)
      
      const { data: newEmployee, error } = await createEmployee(formData)
      if (error) {
        console.error('Error from createEmployee:', error)
        toast.error(`Failed to create employee: ${error}`)
        return
      }

      if (newEmployee) {
        console.log('Employee created successfully:', newEmployee)
        onAdd(newEmployee)
        onOpenChange(false)
        setCurrentStep(1)
        setFormData({
          employee_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          hire_date: '',
          salary: 0,
          status: 'active',
          avatar_url: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          address: '',
          can_manage_customers: false,
          can_manage_drivers: false,
          can_manage_vehicles: false,
          can_view_analytics: false,
          can_manage_employees: false,
          can_manage_orders: false,
          can_manage_visits: false,
          can_manage_after_sales: false
        })
        setErrors({})
        toast.success('Employee added successfully!')
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateEmployeeId = () => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    setFormData(prev => ({ ...prev, employee_id: `EMP${randomNum}` }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Create a new employee profile with comprehensive information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Enter the employee's basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="employee_id"
                        value={formData.employee_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                        placeholder="EMP001"
                        className={errors.employee_id ? 'border-red-500' : ''}
                      />
                      <Button type="button" variant="outline" onClick={generateEmployeeId}>
                        Generate
                      </Button>
                    </div>
                    {errors.employee_id && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.employee_id}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Enter first name"
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.first_name}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Enter last name"
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.last_name}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="employee@company.com"
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+964-770-123-4567"
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.phone}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complete address"
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Employment Details
                </CardTitle>
                <CardDescription>Enter the employee's work-related information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Senior Developer"
                      className={errors.position ? 'border-red-500' : ''}
                    />
                    {errors.position && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.position}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Customer Service">Customer Service</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.department}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="hire_date"
                        type="date"
                        value={formData.hire_date || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                        className={`pl-10 ${errors.hire_date ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.hire_date && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.hire_date}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value ? Number(e.target.value) : 0 }))}
                        placeholder="2500"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Employment Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' | 'suspended' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="suspended">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-red-600" />
                          Suspended
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Additional Information
                </CardTitle>
                <CardDescription>Emergency contacts and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emergency_contact_phone"
                        value={formData.emergency_contact_phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                        placeholder="+964-770-123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complete address"
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Permissions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_customers"
                        checked={formData.can_manage_customers || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_customers: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_customers" className="text-sm">Manage Customers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_drivers"
                        checked={formData.can_manage_drivers || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_drivers: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_drivers" className="text-sm">Manage Drivers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_vehicles"
                        checked={formData.can_manage_vehicles || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_vehicles: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_vehicles" className="text-sm">Manage Vehicles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_view_analytics"
                        checked={formData.can_view_analytics || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_view_analytics: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_view_analytics" className="text-sm">View Analytics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_employees"
                        checked={formData.can_manage_employees || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_employees: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_employees" className="text-sm">Manage Employees</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_orders"
                        checked={formData.can_manage_orders || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_orders: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_orders" className="text-sm">Manage Orders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_visits"
                        checked={formData.can_manage_visits || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_visits: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_visits" className="text-sm">Manage Visits</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can_manage_after_sales"
                        checked={formData.can_manage_after_sales || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, can_manage_after_sales: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="can_manage_after_sales" className="text-sm">Manage After Sales</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Employee...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Employee
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
