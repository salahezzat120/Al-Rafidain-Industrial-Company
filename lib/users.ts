import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  password_hash: string | null
  role: 'admin' | 'supervisor' | 'representative'
  name: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  password_hash: string
  role: 'admin' | 'supervisor' | 'representative'
  name: string
}

export interface UpdateUserData {
  email?: string
  password_hash?: string
  role?: 'admin' | 'supervisor' | 'representative'
  name?: string
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsers:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserById:', error)
    return null
  }
}

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserByEmail:', error)
    return null
  }
}

// Create new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    // Check if email already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createUser:', error)
    throw error
  }
}

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
  try {
    // If email is being updated, check if it already exists
    if (userData.email) {
      const existingUser = await getUserByEmail(userData.email)
      if (existingUser && existingUser.id !== id) {
        throw new Error('User with this email already exists')
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateUser:', error)
    throw error
  }
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    throw error
  }
}

// Check if email exists
export const checkEmailExists = async (email: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('email', email)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking email:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error in checkEmailExists:', error)
    return false
  }
}

// Get users by role
export const getUsersByRole = async (role: 'admin' | 'supervisor' | 'representative'): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsersByRole:', error)
    throw error
  }
}

// Get user statistics
export const getUserStats = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')

    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }

    const stats = {
      total: data?.length || 0,
      admin: data?.filter(user => user.role === 'admin').length || 0,
      supervisor: data?.filter(user => user.role === 'supervisor').length || 0,
      representative: data?.filter(user => user.role === 'representative').length || 0,
    }

    return stats
  } catch (error) {
    console.error('Error in getUserStats:', error)
    throw error
  }
}
