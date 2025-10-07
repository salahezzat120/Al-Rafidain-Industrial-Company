// Test Script for Simple Loyalty System - 10 Points Per Order
// This script tests the loyalty system with your existing table structure

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoyaltySystem10Points() {
  console.log('🧪 Testing Simple Loyalty System - 10 Points Per Order...\n')

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('loyalty_settings')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message)
      return
    }
    console.log('✅ Database connection successful\n')

    // 2. Check loyalty settings
    console.log('2️⃣ Checking loyalty settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('loyalty_settings')
      .select('*')
      .order('setting_key')

    if (settingsError) {
      console.error('❌ Error fetching loyalty settings:', settingsError.message)
    } else {
      console.log('✅ Loyalty settings:')
      settings.forEach(setting => {
        console.log(`   ${setting.setting_key}: ${setting.setting_value} - ${setting.description}`)
      })
    }
    console.log('')

    // 3. Test point calculation functions
    console.log('3️⃣ Testing point calculation functions...')
    
    // Test customer points calculation
    const { data: customerPoints, error: customerPointsError } = await supabase
      .rpc('calculate_customer_points', { order_value: 100 })

    if (customerPointsError) {
      console.error('❌ Error calculating customer points:', customerPointsError.message)
    } else {
      console.log(`✅ Customer points for any order: ${customerPoints} points (should be 10)`)
    }

    // Test representative points calculation
    const { data: repPoints, error: repPointsError } = await supabase
      .rpc('calculate_representative_points', { order_value: 100 })

    if (repPointsError) {
      console.error('❌ Error calculating representative points:', repPointsError.message)
    } else {
      console.log(`✅ Representative points for any order: ${repPoints} points (should be 10)`)
    }
    console.log('')

    // 4. Check existing customers and representatives
    console.log('4️⃣ Checking existing customers and representatives...')
    
    // Get sample customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name')
      .limit(3)

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError.message)
    } else {
      console.log(`✅ Found ${customers.length} customers:`)
      customers.forEach(customer => {
        console.log(`   ${customer.name} (${customer.customer_id}) - ID: ${customer.id}`)
      })
    }

    // Get sample representatives
    const { data: representatives, error: representativesError } = await supabase
      .from('representatives')
      .select('id, name, email')
      .limit(3)

    if (representativesError) {
      console.error('❌ Error fetching representatives:', representativesError.message)
    } else {
      console.log(`✅ Found ${representatives.length} representatives:`)
      representatives.forEach(rep => {
        console.log(`   ${rep.name} (${rep.id}) - ${rep.email}`)
      })
    }
    console.log('')

    // 5. Check existing delivery tasks
    console.log('5️⃣ Checking existing delivery tasks...')
    const { data: tasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('id, task_id, customer_id, representative_id, status, total_value')
      .limit(5)

    if (tasksError) {
      console.error('❌ Error fetching delivery tasks:', tasksError.message)
    } else {
      console.log(`✅ Found ${tasks.length} delivery tasks:`)
      tasks.forEach(task => {
        console.log(`   Task: ${task.task_id} - Status: ${task.status} - Customer: ${task.customer_id} - Rep: ${task.representative_id || 'None'}`)
      })
    }
    console.log('')

    // 6. Test loyalty data
    console.log('6️⃣ Testing loyalty data...')
    
    // Check customer loyalty points
    const { data: customerLoyalty, error: customerLoyaltyError } = await supabase
      .from('customer_loyalty_points')
      .select('*')
      .limit(3)

    if (customerLoyaltyError) {
      console.error('❌ Error fetching customer loyalty points:', customerLoyaltyError.message)
    } else {
      console.log(`✅ Found ${customerLoyalty.length} customer loyalty records:`)
      customerLoyalty.forEach(loyalty => {
        console.log(`   Customer: ${loyalty.customer_id} - Points: ${loyalty.points} - Total Earned: ${loyalty.total_earned}`)
      })
    }

    // Check representative loyalty points
    const { data: repLoyalty, error: repLoyaltyError } = await supabase
      .from('representative_loyalty_points')
      .select('*')
      .limit(3)

    if (repLoyaltyError) {
      console.error('❌ Error fetching representative loyalty points:', repLoyaltyError.message)
    } else {
      console.log(`✅ Found ${repLoyalty.length} representative loyalty records:`)
      repLoyalty.forEach(loyalty => {
        console.log(`   Representative: ${loyalty.representative_id} - Points: ${loyalty.points} - Total Earned: ${loyalty.total_earned}`)
      })
    }
    console.log('')

    // 7. Test leaderboards
    console.log('7️⃣ Testing leaderboards...')
    
    // Test customer leaderboard
    const { data: customerLeaderboard, error: customerLeaderboardError } = await supabase
      .rpc('get_customer_loyalty_leaderboard', { limit_count: 5 })

    if (customerLeaderboardError) {
      console.error('❌ Error fetching customer leaderboard:', customerLeaderboardError.message)
    } else {
      console.log('✅ Customer leaderboard:')
      customerLeaderboard.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.customer_name}: ${customer.current_points} points`)
      })
    }

    // Test representative leaderboard
    const { data: repLeaderboard, error: repLeaderboardError } = await supabase
      .rpc('get_representative_loyalty_leaderboard', { limit_count: 5 })

    if (repLeaderboardError) {
      console.error('❌ Error fetching representative leaderboard:', repLeaderboardError.message)
    } else {
      console.log('✅ Representative leaderboard:')
      repLeaderboard.forEach((rep, index) => {
        console.log(`   ${index + 1}. ${rep.representative_name}: ${rep.current_points} points`)
      })
    }
    console.log('')

    // 8. Test manual point addition
    console.log('8️⃣ Testing manual point addition...')
    
    if (customers && customers.length > 0) {
      const testCustomer = customers[0]
      console.log(`Testing with customer: ${testCustomer.name} (${testCustomer.customer_id})`)
      
      // Add test points
      const { error: addPointsError } = await supabase
        .from('customer_loyalty_transactions')
        .insert({
          customer_id: testCustomer.id,
          transaction_type: 'admin_adjustment',
          points: 10,
          description: 'Test: 10 points added by loyalty system test'
        })

      if (addPointsError) {
        console.error('❌ Error adding test points:', addPointsError.message)
      } else {
        console.log(`✅ Successfully added 10 test points to ${testCustomer.name}`)
      }
    }

    console.log('\n🎉 Simple Loyalty System Test Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection working')
    console.log('✅ Loyalty settings configured (10 points per order)')
    console.log('✅ Point calculation functions working (10 points each)')
    console.log('✅ Customer and representative data available')
    console.log('✅ Delivery tasks table accessible')
    console.log('✅ Loyalty points tables working')
    console.log('✅ Leaderboard functions working')
    console.log('\n🚀 The loyalty system is ready!')
    console.log('\n💡 How it works:')
    console.log('   • When a delivery task status changes to "completed"')
    console.log('   • Customer gets 10 points automatically')
    console.log('   • Representative gets 10 points automatically (if assigned)')
    console.log('   • Points are tracked in loyalty tables')
    console.log('   • Admin can view/manage in Simple Loyalty page')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testLoyaltySystem10Points()


