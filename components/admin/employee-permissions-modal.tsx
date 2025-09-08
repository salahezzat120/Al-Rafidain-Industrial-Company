'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  User,
  Key,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, EmployeePermission, CreatePermissionData, UpdatePermissionData } from '@/types/employees'
import { getEmployeePermissions, createPermission, updatePermission, deletePermission } from '@/lib/employees'

interface EmployeePermissionsModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeePermissionsModal({ employee, open, onOpenChange }: EmployeePermissionsModalProps) {
  const [permissions, setPermissions] = useState<EmployeePermission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingPermission, setEditingPermission] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newPermission, setNewPermission] = useState<CreatePermissionData>({
    employee_id: employee.id,
    task_type: '',
    permission_level: 'read',
    expires_at: '',
    is_active: true
  })

  const taskTypes = [
    'customer_management',
    'order_management',
    'employee_management',
    'sales_reporting',
    'financial_reporting',
    'delivery_tracking',
    'inventory_management',
    'user_management',
    'system_settings',
    'reports_analytics'
  ]

  useEffect(() => {
    if (open) {
      fetchPermissions()
    }
  }, [open, employee.id])

  const fetchPermissions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await getEmployeePermissions(employee.id)
      if (error) {
        setError(error)
        toast.error('Failed to fetch permissions')
        return
      }
      setPermissions(data || [])
    } catch (err) {
      setError('An unexpected error occurred')
      toast.error('Failed to fetch permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPermission = async () => {
    if (!newPermission.task_type) {
      toast.error('Please select a task type')
      return
    }

    setIsSaving(true)
    try {
      const { data, error } = await createPermission(newPermission)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setPermissions(prev => [data, ...prev])
        setNewPermission({
          employee_id: employee.id,
          task_type: '',
          permission_level: 'read',
          expires_at: '',
          is_active: true
        })
        toast.success('Permission added successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePermission = async (permission: EmployeePermission) => {
    setIsSaving(true)
    try {
      const updateData: UpdatePermissionData = {
        id: permission.id,
        task_type: permission.task_type,
        permission_level: permission.permission_level,
        expires_at: permission.expires_at,
        is_active: permission.is_active
      }

      const { data, error } = await updatePermission(updateData)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setPermissions(prev => prev.map(p => p.id === permission.id ? data : p))
        setEditingPermission(null)
        toast.success('Permission updated successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    try {
      const { error } = await deletePermission(permissionId)
      if (error) {
        toast.error(error)
        return
      }

      setPermissions(prev => prev.filter(p => p.id !== permissionId))
      toast.success('Permission deleted successfully!')
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'write': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPermissionLevelIcon = (level: string) => {
    switch (level) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'write': return <Edit className="h-4 w-4" />
      case 'read': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const formatTaskType = (taskType: string) => {
    return taskType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions - {employee.first_name} {employee.last_name}
          </DialogTitle>
          <DialogDescription>
            Assign and manage task-specific permissions for this employee
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add New Permission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add New Permission
            </CardTitle>
            <CardDescription>Grant access to specific tasks and functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type *</Label>
                <Select value={newPermission.task_type} onValueChange={(value) => setNewPermission(prev => ({ ...prev, task_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map(taskType => (
                      <SelectItem key={taskType} value={taskType}>
                        {formatTaskType(taskType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission_level">Permission Level *</Label>
                <Select value={newPermission.permission_level} onValueChange={(value) => setNewPermission(prev => ({ ...prev, permission_level: value as 'read' | 'write' | 'admin' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        Read Only
                      </div>
                    </SelectItem>
                    <SelectItem value="write">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4 text-blue-600" />
                        Read & Write
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        Full Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiry Date</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={newPermission.expires_at}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleAddPermission} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Permission
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Current Permissions
            </CardTitle>
            <CardDescription>
              {permissions.length} permission{permissions.length !== 1 ? 's' : ''} assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No permissions assigned</h3>
                <p className="text-muted-foreground">Add permissions to grant access to specific tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{formatTaskType(permission.task_type)}</h4>
                        <Badge className={getPermissionLevelColor(permission.permission_level)}>
                          {getPermissionLevelIcon(permission.permission_level)}
                          <span className="ml-1 capitalize">{permission.permission_level}</span>
                        </Badge>
                        {permission.expires_at && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expires: {new Date(permission.expires_at).toLocaleDateString()}
                          </Badge>
                        )}
                        {!permission.is_active && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Granted on {new Date(permission.granted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingPermission === permission.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePermission(permission)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPermission(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPermission(permission.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePermission(permission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Levels Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Permission Levels Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Read Only</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can view data but cannot make changes
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Read & Write</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can view and modify data
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Full Admin</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete access including user management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
