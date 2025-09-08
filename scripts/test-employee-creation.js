const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmployeeCreation() {
  console.log('Testing employee creation...')
  
  // Test data that matches your database schema
  const testEmployee = {
    employee_id: 'TEST001',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: '+964-770-123-4567',
    position: 'Test Position',
    department: 'IT',
    hire_date: '2024-01-01',
    salary: 2500.00, // Use decimal format
    status: 'active',
    avatar_url: '',
    address: 'Test Address',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_phone: '+964-770-987-6543',
    can_manage_customers: false,
    can_manage_drivers: false,
    can_manage_vehicles: false,
    can_view_analytics: false,
    can_manage_employees: false,
    can_manage_orders: false,
    can_manage_visits: false,
    can_manage_after_sales: false
  }

  try {
    console.log('Attempting to insert test employee:', testEmployee)
    
    const { data, error } = await supabase
      .from('employees')
      .insert([testEmployee])
      .select()
      .single()

    if (error) {
      console.error('Error creating test employee:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check if it's a constraint violation
      if (error.code === '23505') {
        console.log('This is a unique constraint violation. The employee_id or email might already exist.')
      }
      
      return
    }

    console.log('Test employee created successfully:', data)
    
    // Clean up - delete the test employee
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', data.id)
    
    if (deleteError) {
      console.error('Error deleting test employee:', deleteError)
    } else {
      console.log('Test employee deleted successfully')
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Check table structure
async function checkTableStructure() {
  console.log('Checking employees table structure...')
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error checking table:', error)
      return
    }
    
    console.log('Table exists and is accessible')
    console.log('Sample record structure:', data[0] || 'No records found')
    
  } catch (err) {
    console.error('Unexpected error checking table:', err)
  }
}

async function main() {
  await checkTableStructure()
  await testEmployeeCreation()
}

main()
