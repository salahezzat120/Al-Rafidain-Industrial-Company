"use client"

import React from 'react'
import { usePermissions } from '@/contexts/permission-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertCircle } from 'lucide-react'
import type { PermissionLevel } from '@/types/permissions'

interface PermissionGuardProps {
  pageId: string
  requiredLevel?: PermissionLevel
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  pageId, 
  requiredLevel = 'view', 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission(pageId, requiredLevel)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Contact your administrator to request access to this page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
