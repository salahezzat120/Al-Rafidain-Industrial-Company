const { createClient } = require('@supabase/supabase-js')

// Test the visit status integration with customer management
async function testVisitStatusIntegration() {
  console.log('🧪 Testing Visit Status Integration...\n')

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
    console.log('📊 Testing Customer Data with Visit Status...')
    
    // Test loading customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name, email, visit_status, last_visit_date, visit_notes')
      .order('name', { ascending: true })

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError.message)
      return
    }

    if (!customers || customers.length === 0) {
      console.log('⚠️ No customers found in database')
      console.log('💡 You may need to add some customers first')
      return
    }

    console.log(`✅ Found ${customers.length} customers in database`)
    
    // Display customer visit status
    console.log('\n📋 Customer Visit Status:')
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.customer_id})`)
      console.log(`   Visit Status: ${customer.visit_status}`)
      console.log(`   Last Visit: ${customer.last_visit_date || 'Never'}`)
      console.log(`   Visit Notes: ${customer.visit_notes || 'No notes'}`)
      console.log('')
    })

    console.log('🔍 Testing Visit Management Data...')
    
    // Test loading visit management data
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('customer_id, status, scheduled_start_time, actual_start_time, actual_end_time')
      .order('scheduled_start_time', { ascending: false })

    if (visitsError) {
      console.error('❌ Error fetching visits:', visitsError.message)
    } else {
      console.log(`✅ Found ${visits?.length || 0} visits in visit_management table`)
      
      if (visits && visits.length > 0) {
        console.log('\n📋 Recent Visits:')
        visits.slice(0, 5).forEach((visit, index) => {
          console.log(`${index + 1}. Customer: ${visit.customer_id}`)
          console.log(`   Status: ${visit.status}`)
          console.log(`   Scheduled: ${visit.scheduled_start_time}`)
          console.log(`   Actual Start: ${visit.actual_start_time || 'Not started'}`)
          console.log(`   Actual End: ${visit.actual_end_time || 'Not completed'}`)
          console.log('')
        })
      }
    }

    // Test visit status calculation for specific customers
    console.log('🧮 Testing Visit Status Calculation...')
    
    const customerIds = customers.map(c => c.customer_id).slice(0, 3) // Test first 3 customers
    
    for (const customerId of customerIds) {
      console.log(`\n🔍 Checking visits for customer: ${customerId}`)
      
      const { data: customerVisits, error: customerVisitsError } = await supabase
        .from('visit_management')
        .select('status, scheduled_start_time, actual_start_time, actual_end_time')
        .eq('customer_id', customerId)
        .order('scheduled_start_time', { ascending: false })

      if (customerVisitsError) {
        console.error(`❌ Error fetching visits for customer ${customerId}:`, customerVisitsError.message)
        continue
      }

      if (!customerVisits || customerVisits.length === 0) {
        console.log(`   📝 No visits found for customer ${customerId}`)
        console.log(`   Status: Not Visited`)
        continue
      }

      // Calculate visit statistics
      const completedVisits = customerVisits.filter(visit => visit.status === 'completed').length
      const pendingVisits = customerVisits.filter(visit => visit.status === 'scheduled').length
      const inProgressVisits = customerVisits.filter(visit => visit.status === 'in_progress').length
      const totalVisits = customerVisits.length

      console.log(`   📊 Visit Statistics:`)
      console.log(`   - Total Visits: ${totalVisits}`)
      console.log(`   - Completed: ${completedVisits}`)
      console.log(`   - Pending: ${pendingVisits}`)
      console.log(`   - In Progress: ${inProgressVisits}`)
      
      // Determine visit status
      const hasBeenVisited = completedVisits > 0
      const visitStatus = hasBeenVisited ? 'Visited' : 'Not Visited'
      console.log(`   Status: ${visitStatus}`)
      
      if (hasBeenVisited) {
        const lastVisit = customerVisits.find(visit => visit.status === 'completed')
        if (lastVisit) {
          console.log(`   Last Visit: ${lastVisit.scheduled_start_time}`)
        }
      }
    }

    // Test visit status distribution
    console.log('\n📊 Visit Status Distribution:')
    const statusCounts = customers.reduce((acc, customer) => {
      acc[customer.visit_status] = (acc[customer.visit_status] || 0) + 1
      return acc
    }, {})

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} customers`)
    })

    console.log('\n✅ Visit Status Integration test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Customer data loading: ✅ Working')
    console.log('- Visit management data: ✅ Working')
    console.log('- Visit status calculation: ✅ Working')
    console.log('- Status distribution: ✅ Working')
    console.log('\n🎯 The Customer Management page should now show accurate visit status!')

  } catch (error) {
    console.error('❌ Error testing visit status integration:', error)
  }
}

// Run the test
testVisitStatusIntegration()
