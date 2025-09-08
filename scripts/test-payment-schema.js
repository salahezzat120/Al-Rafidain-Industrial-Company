const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableSchema() {
  console.log('Checking payments table schema...')
  
  try {
    // Try to get table information
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('Error checking table schema:', error)
      return
    }
    
    console.log('Table schema check passed')
    
    // Try a minimal insert to test constraints
    const minimalPayment = {
      customer_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 100,
      due_amount: 100,
      payment_method: 'cash',
      due_date: '2024-12-31'
    }
    
    console.log('Testing minimal payment insert:', minimalPayment)
    
    const { data: insertData, error: insertError } = await supabase
      .from('payments')
      .insert([minimalPayment])
      .select()
      .single()
    
    if (insertError) {
      console.error('Minimal insert error:', insertError)
      console.error('Error code:', insertError.code)
      console.error('Error message:', insertError.message)
      console.error('Error details:', insertError.details)
      console.error('Error hint:', insertError.hint)
    } else {
      console.log('Minimal insert successful:', insertData)
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.error('Error deleting test payment:', deleteError)
      } else {
        console.log('Test payment deleted successfully')
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkTableSchema()
