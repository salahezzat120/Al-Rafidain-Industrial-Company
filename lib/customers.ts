import { supabase } from './supabase'

// Generate random avatar URL using the Avatar Placeholder API
export const generateRandomAvatar = (): string => {
  // Generate a random seed to ensure different avatars
  const randomSeed = Math.random().toString(36).substring(2, 15)
  const timestamp = Date.now()
  return `https://avatar.iran.liara.run/public?seed=${randomSeed}&t=${timestamp}`
}

export interface Customer {
  id?: string
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
  join_date?: string
  notes?: string
  // GPS/Geolocation fields
  latitude?: number
  longitude?: number
  // Visit tracking fields
  visit_status: 'visited' | 'not_visited'
  last_visit_date?: string
  visit_notes?: string
  created_at?: string
  updated_at?: string
}

export interface CreateCustomerData {
  name: string
  email: string
  phone: string
  address: string
  status?: 'active' | 'vip' | 'inactive'
  total_orders?: number
  total_spent?: number
  last_order_date?: string | null
  rating?: number
  preferred_delivery_time?: string
  avatar_url?: string | null
  join_date?: string
  notes?: string | null
  latitude?: number | null
  longitude?: number | null
  visit_status?: 'visited' | 'not_visited'
  last_visit_date?: string | null
  visit_notes?: string | null
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
  last_visit_date?: string | null
}

// Generate unique customer ID
const generateCustomerId = async (): Promise<string> => {
  const { data } = await supabase
    .from('customers')
    .select('customer_id')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (data && data.length > 0) {
    const lastId = data[0].customer_id
    const lastNumber = parseInt(lastId.replace('C', ''))
    return `C${String(lastNumber + 1).padStart(3, '0')}`
  }
  
  return 'C001'
}

// Create a new customer
export const createCustomer = async (customerData: CreateCustomerData): Promise<{ data: Customer | null; error: string | null }> => {
  try {
    // First check if customers table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('customers')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      return { 
        data: null, 
        error: 'Customers table does not exist. Please run the SQL script from database-customers-table.sql in your Supabase dashboard.' 
      }
    }

    const customerId = await generateCustomerId()
    
    const newCustomer = {
      customer_id: customerId,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      status: customerData.status || 'active',
      total_orders: customerData.total_orders || 0,
      total_spent: customerData.total_spent || 0.00,
      last_order_date: customerData.last_order_date || null,
      rating: customerData.rating || 0.00,
      preferred_delivery_time: customerData.preferred_delivery_time || 'Flexible',
      avatar_url: customerData.avatar_url || generateRandomAvatar(),
      join_date: customerData.join_date || new Date().toISOString().split('T')[0],
      notes: customerData.notes || null,
      latitude: customerData.latitude || null,
      longitude: customerData.longitude || null,
      visit_status: customerData.visit_status || 'not_visited',
      last_visit_date: customerData.last_visit_date || null,
      visit_notes: customerData.visit_notes || null,
    }

    console.log('Attempting to insert customer:', newCustomer)
    
    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message || 'Failed to create customer' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<{ exists: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('email')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking email:', error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
  } catch (err: any) {
    console.error('Unexpected error checking email:', err)
    return { exists: false, error: err.message || 'An unexpected error occurred' }
  }
}

// Get all customers
export const getCustomers = async (): Promise<{ data: Customer[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error.message }
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
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Update customer
export const updateCustomer = async (customerData: UpdateCustomerData): Promise<{ data: Customer | null; error: string | null }> => {
  try {
    const { id, ...updateData } = customerData

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return { data: null, error: error.message }
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
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting customer:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Search customers
export const searchCustomers = async (searchTerm: string): Promise<{ data: Customer[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,customer_id.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching customers:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error searching customers:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}
