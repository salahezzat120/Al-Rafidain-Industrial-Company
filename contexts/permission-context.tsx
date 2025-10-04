"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'
import { getUserPermissions, canAccessPage, getPagePermissionLevel } from '@/lib/permissions'
import type { UserPermissions, PagePermission, PermissionLevel } from '@/types/permissions'

interface PermissionContextType {
  userPermissions: PagePermission[] | null
  loading: boolean
  canAccess: (pageId: string) => boolean
  getPermissionLevel: (pageId: string) => PermissionLevel
  hasPermission: (pageId: string, requiredLevel: PermissionLevel) => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
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
      console.log('Loading permissions for user:', user.id)
      const permissions = await getUserPermissions(user.id)
      console.log('Retrieved permissions:', permissions)
      
      // If no permissions found, give admin users default full access
      if (!permissions && user.role === 'admin') {
        console.log('No permissions found for admin user, granting default access')
        setUserPermissions([
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
        ])
      } else {
        setUserPermissions(permissions?.permissions || null)
      }
    } catch (error) {
      console.error('Error loading user permissions:', error)
      console.error('User ID:', user.id)
      console.error('User object:', user)
      setUserPermissions(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [user?.id])

  const canAccess = (pageId: string): boolean => {
    return canAccessPage(userPermissions, pageId)
  }

  const getPermissionLevel = (pageId: string): PermissionLevel => {
    return getPagePermissionLevel(userPermissions, pageId)
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
