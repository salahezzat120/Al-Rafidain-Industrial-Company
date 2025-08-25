import type { User, UserRole } from "@/types/auth"
import { supabase, type SupabaseUser } from "@/lib/supabase"

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Attempting to authenticate user:', email)
    console.log('Using password:', password)
    
    // First, let's check if any users exist in the table
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('email, role')
    
    console.log('All users in database:', { allUsers, allUsersError })
    
    // Query the users table in Supabase (without .single() to see what we get)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('email', email)
      .eq('password_hash', password) // Direct comparison with plain text password

    console.log('Supabase authentication response:', { data, error })
    console.log('Data is array:', Array.isArray(data))
    console.log('Data length:', data?.length)

    if (error) {
      console.error('Supabase login error:', error)
      
      // Handle specific Supabase errors
      if (error.code === 'PGRST116') {
        console.error('No rows returned - invalid credentials')
      }
      
      return null
    }

    if (data && data.length > 0) {
      console.log('Raw data received:', JSON.stringify(data, null, 2))
      
      // Handle array response (Supabase returns array by default)
      const userData = Array.isArray(data) ? data[0] : data
      
      console.log('Processing user data:', JSON.stringify(userData, null, 2))
      console.log('Data type:', typeof userData)
      console.log('Data properties:', Object.keys(userData))
      
      // Check individual fields
      console.log('ID:', userData.id, 'Type:', typeof userData.id)
      console.log('Email:', userData.email, 'Type:', typeof userData.email)
      console.log('Role:', userData.role, 'Type:', typeof userData.role)
      console.log('Created_at:', userData.created_at, 'Type:', typeof userData.created_at)
      
      // More flexible validation - check what fields actually exist
      const requiredFields = ['id', 'email', 'role']
      const missingFields = requiredFields.filter(field => !userData[field])
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        console.error('Available fields:', Object.keys(userData))
        console.error('Full data object:', userData)
        return null
      }
      
      // Convert Supabase user to our User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: getDisplayName(userData.email, userData.role),
        role: userData.role.toLowerCase() as UserRole,
        avatar: getAvatarByRole(userData.role.toLowerCase() as UserRole)
      }
      
      console.log('Successfully converted user:', user)
      return user
    }

    console.log('No user data returned')
    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Helper function to generate display name from email and role
const getDisplayName = (email: string, role: string): string => {
  // Add null/undefined checks
  if (!email || typeof email !== 'string') {
    console.error('Invalid email provided to getDisplayName:', email)
    return 'Unknown User'
  }
  
  if (!role || typeof role !== 'string') {
    console.error('Invalid role provided to getDisplayName:', role)
    return email.split('@')[0] || 'Unknown User'
  }
  
  const emailPrefix = email.split('@')[0] || 'Unknown'
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  return `${emailPrefix} (${capitalizedRole})`
}

// Helper function to get avatar based on role
const getAvatarByRole = (role: UserRole): string => {
  if (!role || typeof role !== 'string') {
    console.error('Invalid role provided to getAvatarByRole:', role)
    return '/placeholder-user.jpg'
  }
  
  switch (role.toLowerCase()) {
    case 'admin':
      return '/admin-avatar.png'
    case 'supervisor':
      return '/supervisor-avatar.png'
    case 'driver':
      return '/driver-avatar.png'
    default:
      console.warn('Unknown role provided to getAvatarByRole:', role)
      return '/placeholder-user.jpg'
  }
}

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole)
}
