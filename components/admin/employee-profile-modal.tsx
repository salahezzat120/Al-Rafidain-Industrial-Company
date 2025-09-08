'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Edit,
  Save,
  X,
  Clock,
  Shield,
  BarChart3,
  FileText,
  UserPlus,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, UpdateEmployeeData } from '@/types/employees'
import { updateEmployee } from '@/lib/employees'

interface EmployeeProfileModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (employee: Employee) => void
}

export default function EmployeeProfileModal({ employee, open, onOpenChange, onUpdate }: EmployeeProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState<Employee>(employee)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setEditedEmployee(employee)
  }, [employee])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!editedEmployee.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!editedEmployee.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!editedEmployee.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(editedEmployee.email)) newErrors.email = 'Email is invalid'
    if (!editedEmployee.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!editedEmployee.position.trim()) newErrors.position = 'Position is required'
    if (!editedEmployee.department.trim()) newErrors.department = 'Department is required'
    if (!editedEmployee.hire_date) newErrors.hire_date = 'Hire date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const updateData: UpdateEmployeeData = {
        id: editedEmployee.id,
        employee_id: editedEmployee.employee_id,
        first_name: editedEmployee.first_name,
        last_name: editedEmployee.last_name,
        email: editedEmployee.email,
        phone: editedEmployee.phone,
        position: editedEmployee.position,
        department: editedEmployee.department,
        hire_date: editedEmployee.hire_date,
        salary: editedEmployee.salary,
        status: editedEmployee.status,
        avatar_url: editedEmployee.avatar_url,
        emergency_contact_name: editedEmployee.emergency_contact_name,
        emergency_contact_phone: editedEmployee.emergency_contact_phone,
        address: editedEmployee.address,
        date_of_birth: editedEmployee.date_of_birth,
        gender: editedEmployee.gender,
        nationality: editedEmployee.nationality,
        passport_number: editedEmployee.passport_number,
        work_permit_expiry: editedEmployee.work_permit_expiry
      }

      const { data: updatedEmployee, error } = await updateEmployee(updateData)
      if (error) {
        toast.error(error)
        return
      }

      if (updatedEmployee) {
        onUpdate(updatedEmployee)
        setIsEditing(false)
        toast.success('Employee updated successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedEmployee(employee)
    setIsEditing(false)
    setErrors({})
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Profile
              </DialogTitle>
              <DialogDescription>
                View and manage employee information
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={editedEmployee.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {editedEmployee.first_name[0]}{editedEmployee.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {editedEmployee.first_name} {editedEmployee.last_name}
                    </h3>
                    <p className="text-muted-foreground">{editedEmployee.position}</p>
                    <Badge className={`mt-2 ${getStatusColor(editedEmployee.status)}`}>
                      {getStatusIcon(editedEmployee.status)}
                      <span className="ml-1 capitalize">{editedEmployee.status}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={editedEmployee.employee_id}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, employee_id: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={editedEmployee.avatar_url || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, avatar_url: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={editedEmployee.first_name}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
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
                      value={editedEmployee.last_name}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
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
                        value={editedEmployee.email}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
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
                        value={editedEmployee.phone}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={editedEmployee.date_of_birth || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={editedEmployee.gender || ''} 
                      onValueChange={(value) => setEditedEmployee(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={editedEmployee.nationality || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, nationality: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={editedEmployee.address || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={editedEmployee.position}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, position: e.target.value }))}
                      disabled={!isEditing}
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
                    <Select 
                      value={editedEmployee.department} 
                      onValueChange={(value) => setEditedEmployee(prev => ({ ...prev, department: value }))}
                      disabled={!isEditing}
                    >
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
                        value={editedEmployee.hire_date}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, hire_date: e.target.value }))}
                        disabled={!isEditing}
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
                        value={editedEmployee.salary || 0}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, salary: e.target.value ? Number(e.target.value) : 0 }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Employment Status</Label>
                  <Select 
                    value={editedEmployee.status} 
                    onValueChange={(value) => setEditedEmployee(prev => ({ ...prev, status: value as 'active' | 'inactive' | 'suspended' }))}
                    disabled={!isEditing}
                  >
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
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      value={editedEmployee.passport_number || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, passport_number: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_permit_expiry">Work Permit Expiry</Label>
                    <Input
                      id="work_permit_expiry"
                      type="date"
                      value={editedEmployee.work_permit_expiry || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, work_permit_expiry: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-red-600" />
                  Emergency Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={editedEmployee.emergency_contact_name || ''}
                      onChange={(e) => setEditedEmployee(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emergency_contact_phone"
                        value={editedEmployee.emergency_contact_phone || ''}
                        onChange={(e) => setEditedEmployee(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
