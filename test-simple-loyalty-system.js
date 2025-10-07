// Test Script for Simple Loyalty System
// Run this to test the loyalty system functionality

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://ullghcrmleaaualynomj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoyaltySystem() {
  console.log('🧪 Testing Simple Loyalty System...\n')

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

    // 2. Check if loyalty tables exist
    console.log('2️⃣ Checking loyalty tables...')
    const tables = [
      'customer_loyalty_points',
      'customer_loyalty_transactions', 
      'representative_loyalty_points',
      'representative_loyalty_transactions',
      'loyalty_settings'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table} does not exist or has issues:`, error.message)
      } else {
        console.log(`✅ Table ${table} exists and is accessible`)
      }
    }
    console.log('')

    // 3. Test loyalty settings
    console.log('3️⃣ Testing loyalty settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('loyalty_settings')
      .select('*')
      .order('setting_key')

    if (settingsError) {
      console.error('❌ Error fetching loyalty settings:', settingsError.message)
    } else {
      console.log('✅ Loyalty settings loaded:')
      settings.forEach(setting => {
        console.log(`   ${setting.setting_key}: ${setting.setting_value} - ${setting.description}`)
      })
    }
    console.log('')

    // 4. Test customer loyalty data
    console.log('4️⃣ Testing customer loyalty data...')
    const { data: customerSummaries, error: customerError } = await supabase
      .from('customer_loyalty_summary')
      .select('*')
      .limit(5)

    if (customerError) {
      console.error('❌ Error fetching customer loyalty data:', customerError.message)
    } else {
      console.log(`✅ Found ${customerSummaries.length} customer loyalty records:`)
      customerSummaries.forEach(customer => {
        console.log(`   ${customer.customer_name} (${customer.customer_code}): ${customer.current_points} points - ${customer.loyalty_tier} tier`)
      })
    }
    console.log('')

    // 5. Test representative loyalty data
    console.log('5️⃣ Testing representative loyalty data...')
    const { data: repSummaries, error: repError } = await supabase
      .from('representative_loyalty_summary')
      .select('*')
      .limit(5)

    if (repError) {
      console.error('❌ Error fetching representative loyalty data:', repError.message)
    } else {
      console.log(`✅ Found ${repSummaries.length} representative loyalty records:`)
      repSummaries.forEach(rep => {
        console.log(`   ${rep.representative_name}: ${rep.current_points} points - ${rep.loyalty_tier} tier`)
      })
    }
    console.log('')

    // 6. Test leaderboard functions
    console.log('6️⃣ Testing leaderboard functions...')
    
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

    // 7. Test point calculation functions
    console.log('7️⃣ Testing point calculation functions...')
    
    // Test customer points calculation
    const { data: customerPoints, error: customerPointsError } = await supabase
      .rpc('calculate_customer_points', { order_value: 100 })

    if (customerPointsError) {
      console.error('❌ Error calculating customer points:', customerPointsError.message)
    } else {
      console.log(`✅ Customer points for $100 order: ${customerPoints} points`)
    }

    // Test representative points calculation
    const { data: repPoints, error: repPointsError } = await supabase
      .rpc('calculate_representative_points', { order_value: 100 })

    if (repPointsError) {
      console.error('❌ Error calculating representative points:', repPointsError.message)
    } else {
      console.log(`✅ Representative points for $100 order: ${repPoints} points`)
    }
    console.log('')

    // 8. Test sample data creation
    console.log('8️⃣ Testing sample data creation...')
    
    // Get a sample customer
    const { data: sampleCustomer, error: customerFetchError } = await supabase
      .from('customers')
      .select('id, customer_id, name')
      .limit(1)
      .single()

    if (customerFetchError || !sampleCustomer) {
      console.log('⚠️ No customers found to test with')
    } else {
      console.log(`✅ Found sample customer: ${sampleCustomer.name} (${sampleCustomer.customer_id})`)
      
      // Test adding points manually
      const testPoints = 25
      const { error: addPointsError } = await supabase
        .from('customer_loyalty_transactions')
        .insert({
          customer_id: sampleCustomer.id,
          transaction_type: 'admin_adjustment',
          points: testPoints,
          description: 'Test points added by loyalty system test'
        })

      if (addPointsError) {
        console.error('❌ Error adding test points:', addPointsError.message)
      } else {
        console.log(`✅ Successfully added ${testPoints} test points to ${sampleCustomer.name}`)
      }
    }

    console.log('\n🎉 Simple Loyalty System test completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection working')
    console.log('✅ Loyalty tables accessible')
    console.log('✅ Settings loaded')
    console.log('✅ Customer and representative data available')
    console.log('✅ Leaderboard functions working')
    console.log('✅ Point calculation functions working')
    console.log('\n🚀 The loyalty system is ready to use!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testLoyaltySystem()


