"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Edit, Shield, X, Settings, UserCheck, RefreshCw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getUsers, getUsersByRole } from "@/lib/users"
import type { User } from "@/lib/users"
import type { PagePermission, PermissionLevel } from "@/types/permissions"

interface SupervisorPermissionsProps {
  onPermissionsChange?: (userId: string, permissions: PagePermission[]) => void
}

export function SupervisorPermissions({ onPermissionsChange }: SupervisorPermissionsProps) {
  const { t, isRTL } = useLanguage()
  const [supervisors, setSupervisors] = useState<User[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState<User | null>(null)
  const [supervisorPermissions, setSupervisorPermissions] = useState<PagePermission[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Available pages for supervisor control
  const availablePages = [
    { id: 'overview', name: 'Overview', description: 'Dashboard overview' },
    { id: 'employees', name: 'Employee Management', description: 'Manage company employees' },
    { id: 'representatives', name: 'Representative Management', description: 'Manage delivery representatives' },
    { id: 'customers', name: 'Customer Management', description: 'Manage customer information' },
    { id: 'warehouse', name: 'Warehouse Management', description: 'Manage inventory and warehouses' },
    { id: 'payments', name: 'Payment Tracking', description: 'Track payments and transactions' },
    { id: 'attendance', name: 'Attendance', description: 'Employee attendance tracking' },
    { id: 'chat-support', name: 'Chat Support', description: 'Customer support chat' },
    { id: 'live-map', name: 'Live Map', description: 'Real-time delivery tracking' },
    { id: 'vehicles', name: 'Vehicle Fleet', description: 'Manage delivery vehicles' },
    { id: 'deliveries', name: 'Delivery Tasks', description: 'Manage delivery tasks' },
    { id: 'analytics', name: 'Analytics', description: 'System analytics and reports' },
    { id: 'alerts', name: 'Alerts & Notifications', description: 'System alerts and notifications' },
    { id: 'visits', name: 'Visit Management', description: 'Customer visit management' },
    { id: 'messaging', name: 'Internal Messaging', description: 'Internal communication' },
    { id: 'after-sales', name: 'After Sales Support', description: 'Post-sale customer support' }
  ]

  useEffect(() => {
    loadSupervisors()
  }, [])

  const loadSupervisors = async () => {
    setLoading(true)
    try {
      // Directly fetch supervisors by role for better reliability
      const supervisorUsers = await getUsersByRole('supervisor')
      console.log('Loaded supervisors:', supervisorUsers.length, supervisorUsers)
      setSupervisors(supervisorUsers)
      
      if (supervisorUsers.length === 0) {
        console.warn('No supervisors found in database. Make sure supervisors have role="supervisor"')
      }
    } catch (error) {
      console.error('Error loading supervisors:', error)
      setMessage({ type: 'error', text: 'Failed to load supervisors' })
    } finally {
      setLoading(false)
    }
  }

  const getPermissionIcon = (level: PermissionLevel) => {
    switch (level) {
      case 'none':
        return <X className="h-4 w-4 text-gray-400" />
      case 'edit':
        return <Edit className="h-4 w-4 text-green-500" />
      default:
        return <X className="h-4 w-4 text-gray-400" />
    }
  }

  const getPermissionColor = (level: PermissionLevel) => {
    switch (level) {
      case 'none':
        return 'bg-gray-100 text-gray-600'
      case 'edit':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleEditPermissions = (supervisor: User) => {
    setSelectedSupervisor(supervisor)
    
    // Try to load existing permissions from localStorage
    const savedPermissions = localStorage.getItem(`supervisor_permissions_${supervisor.id}`)
    
    if (savedPermissions) {
      try {
        const permissionsData = JSON.parse(savedPermissions)
        setSupervisorPermissions(permissionsData.permissions || [])
      } catch (error) {
        console.error('Error loading saved permissions:', error)
        // Fall back to default permissions
        setSupervisorPermissions(getDefaultPermissions())
      }
    } else {
      // Initialize with default permissions for supervisors
      setSupervisorPermissions(getDefaultPermissions())
    }
    
    setIsModalOpen(true)
  }

  const getDefaultPermissions = (): PagePermission[] => [
    { pageId: 'overview', pageName: 'Overview', permission: 'edit' },
    { pageId: 'employees', pageName: 'Employee Management', permission: 'edit' },
    { pageId: 'representatives', pageName: 'Representative Management', permission: 'edit' },
    { pageId: 'customers', pageName: 'Customer Management', permission: 'edit' },
    { pageId: 'warehouse', pageName: 'Warehouse Management', permission: 'edit' },
    { pageId: 'deliveries', pageName: 'Delivery Tasks', permission: 'edit' },
    { pageId: 'vehicles', pageName: 'Vehicle Fleet', permission: 'edit' },
    { pageId: 'analytics', pageName: 'Analytics', permission: 'edit' },
    { pageId: 'attendance', pageName: 'Attendance', permission: 'edit' }
  ]

  const updatePagePermission = (pageId: string, permission: PermissionLevel) => {
    const updatedPermissions = supervisorPermissions.map(p => 
      p.pageId === pageId 
        ? { ...p, permission }
        : p
    )
    
    // If page doesn't exist, add it
    if (!supervisorPermissions.find(p => p.pageId === pageId)) {
      const page = availablePages.find(p => p.id === pageId)
      if (page) {
        updatedPermissions.push({
          pageId,
          pageName: page.name,
          permission
        })
      }
    }
    
    setSupervisorPermissions(updatedPermissions)
  }

  const getCurrentPermission = (pageId: string): PermissionLevel => {
    const permission = supervisorPermissions.find(p => p.pageId === pageId)
    return permission ? permission.permission : 'none'
  }

  const handleSavePermissions = async () => {
    if (!selectedSupervisor) return

    try {
      // Save permissions to localStorage for now (in production, save to database)
      const permissionsData = {
        userId: selectedSupervisor.id,
        permissions: supervisorPermissions,
        updatedAt: new Date().toISOString()
      }
      
      // Store in localStorage
      localStorage.setItem(`supervisor_permissions_${selectedSupervisor.id}`, JSON.stringify(permissionsData))
      
      setMessage({ 
        type: 'success', 
        text: isRTL ? 
          `تم حفظ الصلاحيات بنجاح لـ ${selectedSupervisor.name}` : 
          `Permissions saved successfully for ${selectedSupervisor.name}` 
      })
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false)
        setSelectedSupervisor(null)
        setSupervisorPermissions([])
        setMessage(null)
      }, 1500)

      // Call the callback if provided
      if (onPermissionsChange) {
        onPermissionsChange(selectedSupervisor.id, supervisorPermissions)
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      setMessage({ 
        type: 'error', 
        text: isRTL ? 
          'فشل في حفظ الصلاحيات. يرجى المحاولة مرة أخرى.' : 
          'Failed to save permissions. Please try again.' 
      })
    }
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right flex flex-col items-end' : ''}>
          <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? "التحكم في صلاحيات المشرفين" : "Supervisor Permission Control"}
          </h3>
          <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? "التحكم في الصفحات التي يمكن لكل مشرف الوصول إليها. المسؤولون لديهم وصول كامل لجميع الصفحات." : "Control which pages each supervisor can access. Admins always have full access to all pages."}
          </p>
          {!loading && supervisors.length > 0 && (
            <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? `تم العثور على ${supervisors.length} مشرف` : `${supervisors.length} supervisor${supervisors.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSupervisors}
          disabled={loading}
          className={isRTL ? 'flex-row-reverse' : ''}
        >
          <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
          {isRTL ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : supervisors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isRTL ? "لا يوجد مشرفين" : "No Supervisors Found"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isRTL ? 
              "لم يتم العثور على أي مشرفين في النظام. تأكد من أن المستخدمين لديهم دور 'supervisor'." :
              "No supervisors found in the system. Make sure users have the 'supervisor' role."
            }
          </p>
          <Button
            variant="outline"
            onClick={loadSupervisors}
            className={isRTL ? 'flex-row-reverse' : ''}
          >
            <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? "إعادة التحميل" : "Refresh"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supervisors.map((supervisor) => (
            <Card key={supervisor.id} className="relative">
              <CardHeader className="pb-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <CardTitle className="text-lg">{supervisor.name}</CardTitle>
                      <CardDescription className="text-sm">{supervisor.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {isRTL ? "مشرف" : "Supervisor"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? "تم الإنشاء:" : "Created:"} {new Date(supervisor.created_at).toLocaleDateString()}
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{isRTL ? "نشط" : "Active"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPermissions(supervisor)}
                    className={`w-full ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "إدارة الصلاحيات" : "Manage Permissions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permission Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isRTL ? `إدارة الصلاحيات لـ ${selectedSupervisor?.name}` : `Manage Permissions for ${selectedSupervisor?.name}`}
            </DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
              {isRTL ? "تحديد الصفحات التي يمكن لهذا المشرف الوصول إليها ومستوى الوصول المتاح له." : "Set which pages this supervisor can access and what level of access they have."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePages.map((page) => {
                const currentPermission = getCurrentPermission(page.id)
                
                return (
                  <Card key={page.id} className="p-4">
                    <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        {getPermissionIcon(currentPermission)}
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <h4 className="font-medium text-gray-900">{page.name}</h4>
                          <p className="text-sm text-gray-500">{page.description}</p>
                        </div>
                      </div>
                      <Badge className={getPermissionColor(currentPermission)}>
                        {isRTL ? 
                          (currentPermission === 'none' ? 'لا يوجد وصول' : 
                           currentPermission === 'edit' ? 'تعديل' : currentPermission) :
                          (currentPermission.charAt(0).toUpperCase() + currentPermission.slice(1))
                        }
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? "مستوى الوصول" : "Access Level"}
                      </label>
                      <Select
                        value={currentPermission}
                        onValueChange={(value: PermissionLevel) => updatePagePermission(page.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                              <X className="h-4 w-4 text-gray-400" />
                              <span>{isRTL ? "لا يوجد وصول" : "No Access"}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="edit">
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                              <Edit className="h-4 w-4 text-green-500" />
                              <span>{isRTL ? "تعديل" : "Edit"}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                )
              })}
            </div>

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} pt-4`}>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedSupervisor(null)
                  setSupervisorPermissions([])
                  setMessage(null)
                }}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleSavePermissions}
              >
                {isRTL ? "حفظ الصلاحيات" : "Save Permissions"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
