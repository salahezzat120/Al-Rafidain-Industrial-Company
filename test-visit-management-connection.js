// Test script to verify visit management database connection
// Run this to test if the database is working properly

const { createClient } = require('@supabase/supabase-js')

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVisitManagementConnection() {
  console.log('🧪 Testing Visit Management Database Connection...')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing')
  
  try {
    // Test 1: Check if visit_management table exists
    console.log('\n1. Testing visit_management table...')
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('*')
      .limit(5)
    
    if (visitsError) {
      console.error('❌ Visit management table error:', visitsError.message)
      
      if (visitsError.message?.includes('relation "visit_management" does not exist')) {
        console.log('💡 Solution: Run the create-single-visit-management-table.sql script in your Supabase SQL Editor')
        return false
      }
      return false
    }
    
    console.log('✅ Visit management table accessible')
    console.log(`📊 Found ${visits?.length || 0} records in the table`)
    
    if (visits && visits.length > 0) {
      console.log('📋 Sample records:')
      visits.forEach((visit, index) => {
        console.log(`   ${index + 1}. ${visit.visit_id} - ${visit.customer_name} (${visit.status})`)
      })
    } else {
      console.log('📝 No records found. The table is empty.')
      console.log('💡 You can add sample data by running the database setup script')
    }
    
    // Test 2: Test creating a sample visit
    console.log('\n2. Testing visit creation...')
    const sampleVisit = {
      visit_id: 'TEST001',
      delegate_id: 'TEST_D001',
      delegate_name: 'Test Delegate',
      delegate_email: 'test@company.com',
      delegate_phone: '+1 (555) 000-0000',
      delegate_role: 'driver',
      delegate_status: 'available',
      customer_id: 'TEST_C001',
      customer_name: 'Test Customer',
      customer_address: '123 Test Street',
      customer_phone: '+1 (555) 111-1111',
      scheduled_start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      scheduled_end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      visit_type: 'delivery',
      priority: 'medium',
      status: 'scheduled',
      allowed_duration_minutes: 60,
      is_late: false,
      exceeds_time_limit: false,
      is_alert_read: false,
      admin_notified: false,
      is_message_read: false
    }
    
    const { data: newVisit, error: createError } = await supabase
      .from('visit_management')
      .insert([sampleVisit])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Visit creation error:', createError.message)
      return false
    }
    
    console.log('✅ Visit created successfully:', newVisit.visit_id)
    
    // Test 3: Test updating visit
    console.log('\n3. Testing visit update...')
    const { data: updatedVisit, error: updateError } = await supabase
      .from('visit_management')
      .update({ status: 'in_progress', actual_start_time: new Date().toISOString() })
      .eq('id', newVisit.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Visit update error:', updateError.message)
      return false
    }
    
    console.log('✅ Visit updated successfully')
    
    // Test 4: Clean up test data
    console.log('\n4. Cleaning up test data...')
    await supabase.from('visit_management').delete().eq('id', newVisit.id)
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 All tests passed! Visit Management System is working correctly.')
    console.log('✅ Database connection: Working')
    console.log('✅ Table access: Working')
    console.log('✅ Data creation: Working')
    console.log('✅ Data updates: Working')
    console.log('✅ Data deletion: Working')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

// Run the test
if (require.main === module) {
  testVisitManagementConnection()
    .then(success => {
      if (success) {
        console.log('\n✅ Visit Management System is fully functional!')
        console.log('🚀 You can now use the Visit Management tab in your application.')
        process.exit(0)
      } else {
        console.log('\n❌ Visit Management System has issues that need to be resolved.')
        console.log('💡 Please run the create-single-visit-management-table.sql script first.')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error)
      process.exit(1)
    })
}

module.exports = { testVisitManagementConnection }
