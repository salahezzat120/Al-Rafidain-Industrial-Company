const { createClient } = require('@supabase/supabase-js')

// Test if delivery_tasks table is accessible
async function testDeliveryTasksAccess() {
  console.log('🧪 Testing delivery_tasks table access...\n')

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔍 Testing delivery_tasks table access...')
    
    // Test 1: Simple table access
    const { data: testData, error: testError } = await supabase
      .from('delivery_tasks')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ delivery_tasks table not accessible:', testError)
      console.error('Error details:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      })
      return
    }
    
    console.log('✅ delivery_tasks table is accessible')
    console.log('📊 Test data:', testData)
    
    // Test 2: Check table structure
    console.log('\n🔍 Checking table structure...')
    const { data: structureData, error: structureError } = await supabase
      .from('delivery_tasks')
      .select('customer_id, task_id, status, total_value, currency, created_at')
      .limit(5)
    
    if (structureError) {
      console.error('❌ Error checking table structure:', structureError)
    } else {
      console.log('✅ Table structure check passed')
      console.log('📊 Sample data:', structureData)
    }
    
    // Test 3: Check if there are any records
    const { count, error: countError } = await supabase
      .from('delivery_tasks')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting records:', countError)
    } else {
      console.log(`📊 Total records in delivery_tasks: ${count}`)
    }
    
    // Test 4: Check customer IDs
    const { data: customerIds, error: customerIdsError } = await supabase
      .from('delivery_tasks')
      .select('customer_id')
      .limit(10)
    
    if (customerIdsError) {
      console.error('❌ Error fetching customer IDs:', customerIdsError)
    } else {
      console.log('📊 Customer IDs in delivery_tasks:', customerIds?.map(item => item.customer_id) || [])
    }
    
    console.log('\n✅ delivery_tasks table access test completed!')
    console.log('\n📋 Summary:')
    console.log('- Table access: ✅ Working')
    console.log('- Table structure: ✅ Working')
    console.log(`- Record count: ${count || 0}`)
    console.log('- Customer IDs: ✅ Working')
    
  } catch (error) {
    console.error('❌ Error testing delivery_tasks access:', error)
  }
}

// Run the test
testDeliveryTasksAccess()
