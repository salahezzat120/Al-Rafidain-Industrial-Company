import { supabase } from './supabase'
import type { 
  UserPermissions, 
  CreateUserPermissionData, 
  UpdateUserPermissionData, 
  PagePermission,
  PermissionLevel 
} from '@/types/permissions'

// Get user permissions
export const getUserPermissions = async (userId: string): Promise<UserPermissions | null> => {
  try {
    console.log('Fetching permissions for user ID:', userId)
    
    // First, check if the table exists and is accessible
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_permissions')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('Table access error:', tableError)
      return null
    }

    console.log('Table is accessible, proceeding with user query')
    
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Supabase error fetching user permissions:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // If it's a "not found" error, that's actually normal for new users
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        console.log('No permissions found for user (this is normal for new users)')
        return null
      }
      
      return null
    }

    console.log('Successfully fetched permissions:', data)
    return data
  } catch (error) {
    console.error('Unexpected error in getUserPermissions:', error)
    return null
  }
}

// Create user permissions
export const createUserPermissions = async (permissionData: CreateUserPermissionData): Promise<UserPermissions> => {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .insert([permissionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating user permissions:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createUserPermissions:', error)
    throw error
  }
}

// Update user permissions
export const updateUserPermissions = async (userId: string, permissionData: UpdateUserPermissionData): Promise<UserPermissions> => {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .update(permissionData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user permissions:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateUserPermissions:', error)
    throw error
  }
}

// Delete user permissions
export const deleteUserPermissions = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting user permissions:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteUserPermissions:', error)
    throw error
  }
}

// Check if user has permission for a specific page
export const hasPagePermission = async (userId: string, pageId: string, requiredLevel: PermissionLevel = 'view'): Promise<boolean> => {
  try {
    const permissions = await getUserPermissions(userId)
    if (!permissions) return false

    const pagePermission = permissions.permissions.find(p => p.pageId === pageId)
    if (!pagePermission) return false

    const permissionLevels = ['none', 'view', 'edit', 'admin']
    const userLevel = permissionLevels.indexOf(pagePermission.permission)
    const requiredLevelIndex = permissionLevels.indexOf(requiredLevel)

    return userLevel >= requiredLevelIndex
  } catch (error) {
    console.error('Error checking page permission:', error)
    return false
  }
}

// Get all users with their permissions
export const getUsersWithPermissions = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_permissions (
          permissions
        )
      `)

    if (error) {
      console.error('Error fetching users with permissions:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsersWithPermissions:', error)
    throw error
  }
}

// Check if user can access a page (for navigation)
export const canAccessPage = (userPermissions: PagePermission[] | null, pageId: string): boolean => {
  if (!userPermissions) return false
  
  const pagePermission = userPermissions.find(p => p.pageId === pageId)
  return pagePermission ? pagePermission.permission !== 'none' : false
}

// Get permission level for a page
export const getPagePermissionLevel = (userPermissions: PagePermission[] | null, pageId: string): PermissionLevel => {
  if (!userPermissions) return 'none'
  
  const pagePermission = userPermissions.find(p => p.pageId === pageId)
  return pagePermission ? pagePermission.permission : 'none'
}
