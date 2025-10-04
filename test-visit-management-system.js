// Test script for Visit Management System
// This script tests the database setup and functionality

const { createClient } = require('@supabase/supabase-js')

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVisitManagementSystem() {
  console.log('🧪 Testing Visit Management System...')
  
  try {
    // Test 1: Check if visits table exists
    console.log('\n1. Testing visits table...')
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .limit(1)
    
    if (visitsError) {
      console.error('❌ Visits table error:', visitsError.message)
      return false
    }
    console.log('✅ Visits table accessible')
    
    // Test 2: Check if delegates table exists
    console.log('\n2. Testing delegates table...')
    const { data: delegates, error: delegatesError } = await supabase
      .from('delegates')
      .select('*')
      .limit(1)
    
    if (delegatesError) {
      console.error('❌ Delegates table error:', delegatesError.message)
      return false
    }
    console.log('✅ Delegates table accessible')
    
    // Test 3: Check if representatives table exists
    console.log('\n3. Testing representatives table...')
    const { data: representatives, error: representativesError } = await supabase
      .from('representatives')
      .select('*')
      .limit(1)
    
    if (representativesError) {
      console.error('❌ Representatives table error:', representativesError.message)
      return false
    }
    console.log('✅ Representatives table accessible')
    
    // Test 4: Check if visit_alerts table exists
    console.log('\n4. Testing visit_alerts table...')
    const { data: alerts, error: alertsError } = await supabase
      .from('visit_alerts')
      .select('*')
      .limit(1)
    
    if (alertsError) {
      console.error('❌ Visit alerts table error:', alertsError.message)
      return false
    }
    console.log('✅ Visit alerts table accessible')
    
    // Test 5: Check if internal_messages table exists
    console.log('\n5. Testing internal_messages table...')
    const { data: messages, error: messagesError } = await supabase
      .from('internal_messages')
      .select('*')
      .limit(1)
    
    if (messagesError) {
      console.error('❌ Internal messages table error:', messagesError.message)
      return false
    }
    console.log('✅ Internal messages table accessible')
    
    // Test 6: Check if chat_messages table exists
    console.log('\n6. Testing chat_messages table...')
    const { data: chatMessages, error: chatMessagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1)
    
    if (chatMessagesError) {
      console.error('❌ Chat messages table error:', chatMessagesError.message)
      return false
    }
    console.log('✅ Chat messages table accessible')
    
    // Test 7: Test creating a sample visit
    console.log('\n7. Testing visit creation...')
    const sampleVisit = {
      delegate_id: 'test-delegate-1',
      delegate_name: 'Test Delegate',
      customer_id: 'test-customer-1',
      customer_name: 'Test Customer',
      customer_address: '123 Test Street',
      scheduled_start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      scheduled_end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      visit_type: 'delivery',
      priority: 'medium',
      notes: 'Test visit for system validation',
      allowed_duration_minutes: 60
    }
    
    const { data: newVisit, error: createError } = await supabase
      .from('visits')
      .insert([sampleVisit])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Visit creation error:', createError.message)
      return false
    }
    console.log('✅ Visit created successfully:', newVisit.id)
    
    // Test 8: Test updating visit status
    console.log('\n8. Testing visit status update...')
    const { data: updatedVisit, error: updateError } = await supabase
      .from('visits')
      .update({ status: 'in_progress', actual_start_time: new Date().toISOString() })
      .eq('id', newVisit.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Visit update error:', updateError.message)
      return false
    }
    console.log('✅ Visit status updated successfully')
    
    // Test 9: Test creating a visit alert
    console.log('\n9. Testing visit alert creation...')
    const sampleAlert = {
      visit_id: newVisit.id,
      delegate_id: 'test-delegate-1',
      alert_type: 'late_arrival',
      severity: 'high',
      message: 'Test alert for system validation',
      is_read: false,
      admin_notified: false
    }
    
    const { data: newAlert, error: alertError } = await supabase
      .from('visit_alerts')
      .insert([sampleAlert])
      .select()
      .single()
    
    if (alertError) {
      console.error('❌ Alert creation error:', alertError.message)
      return false
    }
    console.log('✅ Visit alert created successfully:', newAlert.id)
    
    // Test 10: Clean up test data
    console.log('\n10. Cleaning up test data...')
    await supabase.from('visit_alerts').delete().eq('id', newAlert.id)
    await supabase.from('visits').delete().eq('id', newVisit.id)
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 All tests passed! Visit Management System is working correctly.')
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

// Run the test
if (require.main === module) {
  testVisitManagementSystem()
    .then(success => {
      if (success) {
        console.log('\n✅ Visit Management System is fully functional!')
        process.exit(0)
      } else {
        console.log('\n❌ Visit Management System has issues that need to be resolved.')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error)
      process.exit(1)
    })
}

module.exports = { testVisitManagementSystem }
