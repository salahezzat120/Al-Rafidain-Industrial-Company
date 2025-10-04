import { supabase } from './supabase'

export interface Customer {
  id: string
  customer_id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'vip' | 'inactive'
  total_orders: number
  total_spent: number
  last_order_date?: string
  rating: number
  preferred_delivery_time: string
  avatar_url?: string
  join_date: string
  notes?: string
  latitude?: number
  longitude?: number
  visit_status: 'visited' | 'not_visited'
  last_visit_date?: string
  visit_notes?: string
  created_at: string
  updated_at: string
}

export interface CreateCustomerData {
  customer_id: string
  name: string
  email: string
  phone: string
  address: string
  status?: 'active' | 'vip' | 'inactive'
  total_orders?: number
  total_spent?: number
  last_order_date?: string
  rating?: number
  preferred_delivery_time?: string
  avatar_url?: string
  join_date?: string
  notes?: string
  latitude?: number
  longitude?: number
  visit_status?: 'visited' | 'not_visited'
  last_visit_date?: string
  visit_notes?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
}

// Get all customers
export const getCustomers = async (): Promise<{ data: Customer[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error.message || 'Failed to fetch customers' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching customers:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Get customer by ID
export const getCustomerById = async (id: string): Promise<{ data: Customer | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return { data: null, error: error.message || 'Failed to fetch customer' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Create customer
export const createCustomer = async (customerData: CreateCustomerData): Promise<{ data: Customer | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return { data: null, error: error.message || 'Failed to create customer' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Update customer
export const updateCustomer = async (id: string, updates: UpdateCustomerData): Promise<{ data: Customer | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return { data: null, error: error.message || 'Failed to update customer' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Delete customer
export const deleteCustomer = async (id: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting customer:', error)
      return { error: error.message || 'Failed to delete customer' }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting customer:', err)
    return { error: 'An unexpected error occurred' }
  }
}