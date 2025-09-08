const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPaymentCreation() {
  console.log('Testing payment creation...')
  
  // Test data for payment creation
  const testPayment = {
    payment_id: 'TEST001',
    customer_id: '550e8400-e29b-41d4-a716-446655440000',
    order_id: 'ORD-TEST-001',
    amount: 1000.00,
    due_amount: 1000.00,
    paid_amount: 0.00,
    payment_method: 'cash',
    due_date: '2024-12-31',
    payment_reference: 'TEST-REF-001',
    notes: 'Test payment for validation'
  }

  try {
    console.log('Attempting to insert test payment:', testPayment)
    
    const { data, error } = await supabase
      .from('payments')
      .insert([testPayment])
      .select()
      .single()

    if (error) {
      console.error('Error creating test payment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check if it's a constraint violation
      if (error.code === '23505') {
        console.log('This is a unique constraint violation. The payment_id might already exist.')
      }
      
      return
    }

    console.log('Test payment created successfully:', data)
    
    // Clean up - delete the test payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', data.id)
    
    if (deleteError) {
      console.error('Error deleting test payment:', deleteError)
    } else {
      console.log('Test payment deleted successfully')
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Check table structure
async function checkTableStructure() {
  console.log('Checking payments table structure...')
  
  try {
    const { data, error } = await supabase
      .from('payments')
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
  await testPaymentCreation()
}

main()
