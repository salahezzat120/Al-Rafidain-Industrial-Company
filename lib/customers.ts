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

// Check if customer ID already exists
const customerIdExists = async (customerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', customerId)
      .limit(1)
    
    if (error) {
      console.warn('Error checking customer ID existence:', error)
      return false
    }
    
    return data && data.length > 0
  } catch (err) {
    console.error('Error in customerIdExists:', err)
    return false
  }
}

// Generate unique customer ID
const generateCustomerId = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('customer_id')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.warn('Error fetching last customer ID:', error)
      // Generate a timestamp-based ID as fallback
      return `C${Date.now().toString().slice(-6)}`
    }
    
    if (data && data.length > 0) {
      const lastId = data[0].customer_id
      console.log('Last customer ID:', lastId)
      
      // Handle different ID formats
      if (lastId && lastId.startsWith('C')) {
        const numberPart = lastId.replace('C', '')
        const lastNumber = parseInt(numberPart)
        
        if (!isNaN(lastNumber)) {
          const newId = `C${String(lastNumber + 1).padStart(3, '0')}`
          // Check if this ID already exists (in case of concurrent requests)
          const exists = await customerIdExists(newId)
          if (!exists) {
            return newId
          }
          // If it exists, try the next one
          return `C${String(lastNumber + 2).padStart(3, '0')}`
        }
      }
      
      // If parsing fails, generate timestamp-based ID
      return `C${Date.now().toString().slice(-6)}`
    }
    
    return 'C001'
  } catch (err) {
    console.error('Error in generateCustomerId:', err)
    // Generate a timestamp-based ID as fallback
    return `C${Date.now().toString().slice(-6)}`
  }
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
    
    // Validate data according to database constraints
    if (customerData.rating && (customerData.rating < 0 || customerData.rating > 5)) {
      return { 
        data: null, 
        error: 'Rating must be between 0 and 5' 
      }
    }
    
    if (customerData.status && !['active', 'vip', 'inactive'].includes(customerData.status)) {
      return { 
        data: null, 
        error: 'Status must be one of: active, vip, inactive' 
      }
    }
    
    if (customerData.visit_status && !['visited', 'not_visited'].includes(customerData.visit_status)) {
      return { 
        data: null, 
        error: 'Visit status must be one of: visited, not_visited' 
      }
    }
    
    const newCustomer = {
      customer_id: customerId,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      status: customerData.status || 'active',
      total_orders: customerData.total_orders || 0,
      total_spent: parseFloat((customerData.total_spent || 0.00).toString()),
      last_order_date: customerData.last_order_date || null,
      rating: parseFloat((customerData.rating || 0.00).toString()),
      preferred_delivery_time: customerData.preferred_delivery_time || 'Flexible',
      avatar_url: customerData.avatar_url || generateRandomAvatar(),
      join_date: customerData.join_date || new Date().toISOString().split('T')[0],
      notes: customerData.notes || null,
      latitude: customerData.latitude ? parseFloat(customerData.latitude.toString()) : null,
      longitude: customerData.longitude ? parseFloat(customerData.longitude.toString()) : null,
      visit_status: customerData.visit_status || 'not_visited',
      last_visit_date: customerData.last_visit_date || null,
      visit_notes: customerData.visit_notes || null,
    }

    console.log('Attempting to insert customer:', newCustomer)
    console.log('Customer data types:', {
      total_spent: typeof newCustomer.total_spent,
      rating: typeof newCustomer.rating,
      latitude: typeof newCustomer.latitude,
      longitude: typeof newCustomer.longitude,
      total_orders: typeof newCustomer.total_orders
    })
    
    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      console.error('Customer data that failed:', JSON.stringify(newCustomer, null, 2))
      
      // Handle duplicate key error specifically
      if (error.code === '23505') {
        if (error.message.includes('customers_customer_id_key')) {
          console.log('Duplicate customer_id detected, retrying with new ID...')
          // Retry with a new customer ID
          const newCustomerId = await generateCustomerId()
          newCustomer.customer_id = newCustomerId
          
          const { data: retryData, error: retryError } = await supabase
            .from('customers')
            .insert([newCustomer])
            .select()
            .single()
          
          if (retryError) {
            return { data: null, error: `Failed to create customer after retry: ${retryError.message}` }
          }
          
          return { data: retryData, error: null }
        } else if (error.message.includes('customers_email_key')) {
          return { data: null, error: 'A customer with this email address already exists' }
        }
      }
      
      return { data: null, error: error.message || 'Failed to create customer' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating customer:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Check if email already exists
// Clean up invalid customer IDs (like "CNaN")
export const cleanupInvalidCustomerIds = async (): Promise<{ success: boolean; error?: string; cleaned?: number }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, customer_id')
      .or('customer_id.like.CNaN,customer_id.like.Cnull,customer_id.is.null')
    
    if (error) {
      console.error('Error finding invalid customer IDs:', error)
      return { success: false, error: error.message }
    }
    
    if (!data || data.length === 0) {
      return { success: true, cleaned: 0 }
    }
    
    console.log(`Found ${data.length} customers with invalid IDs:`, data)
    
    // Update each invalid customer ID
    for (const customer of data) {
      const newId = await generateCustomerId()
      const { error: updateError } = await supabase
        .from('customers')
        .update({ customer_id: newId })
        .eq('id', customer.id)
      
      if (updateError) {
        console.error(`Error updating customer ${customer.id}:`, updateError)
      } else {
        console.log(`Updated customer ${customer.id} from ${customer.customer_id} to ${newId}`)
      }
    }
    
    return { success: true, cleaned: data.length }
  } catch (err: any) {
    console.error('Error in cleanupInvalidCustomerIds:', err)
    return { success: false, error: err.message }
  }
}

// Test database connection and table structure
export const testCustomerTable = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, customer_id, name, email, phone, address, status, total_orders, total_spent, last_order_date, rating, preferred_delivery_time, avatar_url, join_date, notes, latitude, longitude, visit_status, last_visit_date, visit_notes, created_at, updated_at')
      .limit(1)
    
    if (error) {
      console.error('Database test error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Database connection successful. Table structure is correct.')
    return { success: true }
  } catch (err: any) {
    console.error('Database test failed:', err)
    return { success: false, error: err.message }
  }
}

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
