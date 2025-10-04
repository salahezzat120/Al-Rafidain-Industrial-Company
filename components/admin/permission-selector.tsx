"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Edit, Shield, X } from "lucide-react"
import { AVAILABLE_PAGES } from "@/types/permissions"
import type { PagePermission, PermissionLevel } from "@/types/permissions"

interface PermissionSelectorProps {
  permissions: PagePermission[]
  onPermissionsChange: (permissions: PagePermission[]) => void
  disabled?: boolean
}

export function PermissionSelector({ permissions, onPermissionsChange, disabled = false }: PermissionSelectorProps) {
  const getPermissionIcon = (level: PermissionLevel) => {
    switch (level) {
      case 'none':
        return <X className="h-4 w-4 text-gray-400" />
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'edit':
        return <Edit className="h-4 w-4 text-green-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <X className="h-4 w-4 text-gray-400" />
    }
  }

  const getPermissionColor = (level: PermissionLevel) => {
    switch (level) {
      case 'none':
        return 'bg-gray-100 text-gray-600'
      case 'view':
        return 'bg-blue-100 text-blue-700'
      case 'edit':
        return 'bg-green-100 text-green-700'
      case 'admin':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const updatePagePermission = (pageId: string, permission: PermissionLevel) => {
    const updatedPermissions = permissions.map(p => 
      p.pageId === pageId 
        ? { ...p, permission }
        : p
    )
    
    // If page doesn't exist, add it
    if (!permissions.find(p => p.pageId === pageId)) {
      const page = AVAILABLE_PAGES.find(p => p.id === pageId)
      if (page) {
        updatedPermissions.push({
          pageId,
          pageName: page.name,
          permission
        })
      }
    }
    
    onPermissionsChange(updatedPermissions)
  }

  const getCurrentPermission = (pageId: string): PermissionLevel => {
    const permission = permissions.find(p => p.pageId === pageId)
    return permission ? permission.permission : 'none'
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Permissions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set what pages this user can view, edit, or have admin access to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_PAGES.map((page) => {
          const currentPermission = getCurrentPermission(page.id)
          
          return (
            <Card key={page.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getPermissionIcon(currentPermission)}
                  <div>
                    <h4 className="font-medium text-gray-900">{page.name}</h4>
                    <p className="text-sm text-gray-500">{page.description}</p>
                  </div>
                </div>
                <Badge className={getPermissionColor(currentPermission)}>
                  {currentPermission.charAt(0).toUpperCase() + currentPermission.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`permission-${page.id}`} className="text-sm">
                  Access Level
                </Label>
                <Select
                  value={currentPermission}
                  onValueChange={(value: PermissionLevel) => updatePagePermission(page.id, value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center space-x-2">
                        <X className="h-4 w-4 text-gray-400" />
                        <span>No Access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="view">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>View Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center space-x-2">
                        <Edit className="h-4 w-4 text-green-500" />
                        <span>View & Edit</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span>Full Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Permission Levels Explained:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4 text-gray-400" />
            <span><strong>No Access:</strong> Cannot see or access this page</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span><strong>View Only:</strong> Can view but cannot make changes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Edit className="h-4 w-4 text-green-500" />
            <span><strong>View & Edit:</strong> Can view and modify content</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-red-500" />
            <span><strong>Full Admin:</strong> Complete control including user management</span>
          </div>
        </div>
      </div>
    </div>
  )
}
