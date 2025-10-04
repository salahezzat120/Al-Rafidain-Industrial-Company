"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'
import type { PagePermission, PermissionLevel } from '@/types/permissions'

// Default permissions for supervisors
const getDefaultSupervisorPermissions = (): PagePermission[] => [
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

interface PermissionContextType {
  userPermissions: PagePermission[] | null
  loading: boolean
  canAccess: (pageId: string) => boolean
  getPermissionLevel: (pageId: string) => PermissionLevel
  hasPermission: (pageId: string, requiredLevel: PermissionLevel) => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProviderSimple({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userPermissions, setUserPermissions] = useState<PagePermission[] | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPermissions = async () => {
    if (!user?.id) {
      setUserPermissions(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Loading permissions for user:', user.id, 'Role:', user.role)
      
      // Simple role-based permissions without database dependency
      let permissions: PagePermission[] = []
      
      if (user.role === 'admin') {
        permissions = [
          { pageId: 'overview', pageName: 'Overview', permission: 'admin' },
          { pageId: 'users', pageName: 'User Management', permission: 'admin' },
          { pageId: 'employees', pageName: 'Employee Management', permission: 'admin' },
          { pageId: 'representatives', pageName: 'Representative Management', permission: 'admin' },
          { pageId: 'customers', pageName: 'Customer Management', permission: 'admin' },
          { pageId: 'warehouse', pageName: 'Warehouse Management', permission: 'admin' },
          { pageId: 'payments', pageName: 'Payment Tracking', permission: 'admin' },
          { pageId: 'attendance', pageName: 'Attendance', permission: 'admin' },
          { pageId: 'chat-support', pageName: 'Chat Support', permission: 'admin' },
          { pageId: 'live-map', pageName: 'Live Map', permission: 'admin' },
          { pageId: 'vehicles', pageName: 'Vehicle Fleet', permission: 'admin' },
          { pageId: 'deliveries', pageName: 'Delivery Tasks', permission: 'admin' },
          { pageId: 'analytics', pageName: 'Analytics', permission: 'admin' },
          { pageId: 'alerts', pageName: 'Alerts & Notifications', permission: 'admin' },
          { pageId: 'visits', pageName: 'Visit Management', permission: 'admin' },
          { pageId: 'messaging', pageName: 'Internal Messaging', permission: 'admin' },
          { pageId: 'after-sales', pageName: 'After Sales Support', permission: 'admin' },
          { pageId: 'settings', pageName: 'System Settings', permission: 'admin' }
        ]
      } else if (user.role === 'supervisor') {
        // Check for saved permissions in localStorage
        const savedPermissions = localStorage.getItem(`supervisor_permissions_${user.id}`)
        
        if (savedPermissions) {
          try {
            const permissionsData = JSON.parse(savedPermissions)
            permissions = permissionsData.permissions || []
          } catch (error) {
            console.error('Error loading saved permissions:', error)
            // Fall back to default permissions
            permissions = getDefaultSupervisorPermissions()
          }
        } else {
          // Use default permissions if none saved
          permissions = getDefaultSupervisorPermissions()
        }
      } else if (user.role === 'representative') {
        permissions = [
          { pageId: 'overview', pageName: 'Overview', permission: 'view' },
          { pageId: 'deliveries', pageName: 'Delivery Tasks', permission: 'edit' },
          { pageId: 'customers', pageName: 'Customer Management', permission: 'view' },
          { pageId: 'live-map', pageName: 'Live Map', permission: 'view' },
          { pageId: 'messaging', pageName: 'Internal Messaging', permission: 'view' }
        ]
      }
      
      console.log('Set permissions for user:', permissions)
      setUserPermissions(permissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
      setUserPermissions(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [user?.id, user?.role])

  const canAccess = (pageId: string): boolean => {
    if (!userPermissions) return false
    
    const pagePermission = userPermissions.find(p => p.pageId === pageId)
    return pagePermission ? pagePermission.permission !== 'none' : false
  }

  const getPermissionLevel = (pageId: string): PermissionLevel => {
    if (!userPermissions) return 'none'
    
    const pagePermission = userPermissions.find(p => p.pageId === pageId)
    return pagePermission ? pagePermission.permission : 'none'
  }

  const hasPermission = (pageId: string, requiredLevel: PermissionLevel): boolean => {
    const userLevel = getPermissionLevel(pageId)
    const permissionLevels = ['none', 'view', 'edit', 'admin']
    const userLevelIndex = permissionLevels.indexOf(userLevel)
    const requiredLevelIndex = permissionLevels.indexOf(requiredLevel)
    
    return userLevelIndex >= requiredLevelIndex
  }

  const refreshPermissions = async () => {
    await loadPermissions()
  }

  const value: PermissionContextType = {
    userPermissions,
    loading,
    canAccess,
    getPermissionLevel,
    hasPermission,
    refreshPermissions
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}
