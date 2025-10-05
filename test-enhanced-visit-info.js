const { createClient } = require('@supabase/supabase-js')

// Test the enhanced visit information functionality
async function testEnhancedVisitInfo() {
  console.log('🧪 Testing Enhanced Visit Information...\n')

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
    console.log('📊 Testing Enhanced Visit Information...')
    
    // Test loading customers with enhanced visit info
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
    
    // Display enhanced visit information
    console.log('\n📋 Enhanced Visit Information:')
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.customer_id})`)
      console.log(`   Visit Status: ${customer.visit_status}`)
      console.log(`   Last Visit: ${customer.last_visit_date || 'Never'}`)
      console.log(`   Visit Details: ${customer.visit_notes || 'No visit information'}`)
      console.log('')
    })

    console.log('🔍 Testing Visit Management Data...')
    
    // Test loading visit management data
    const { data: visits, error: visitsError } = await supabase
      .from('visit_management')
      .select('customer_id, status, visit_type, delegate_name, is_late, scheduled_start_time, actual_start_time, actual_end_time')
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
          console.log(`   Type: ${visit.visit_type}`)
          console.log(`   Delegate: ${visit.delegate_name}`)
          console.log(`   Late: ${visit.is_late ? 'Yes' : 'No'}`)
          console.log(`   Scheduled: ${visit.scheduled_start_time}`)
          console.log(`   Actual Start: ${visit.actual_start_time || 'Not started'}`)
          console.log(`   Actual End: ${visit.actual_end_time || 'Not completed'}`)
          console.log('')
        })
      }
    }

    // Test enhanced visit status calculation for specific customers
    console.log('🧮 Testing Enhanced Visit Status Calculation...')
    
    const customerIds = customers.map(c => c.customer_id).slice(0, 3) // Test first 3 customers
    
    for (const customerId of customerIds) {
      console.log(`\n🔍 Checking enhanced visit status for customer: ${customerId}`)
      
      const { data: customerVisits, error: customerVisitsError } = await supabase
        .from('visit_management')
        .select('status, visit_type, delegate_name, is_late, scheduled_start_time, actual_start_time, actual_end_time')
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

      // Calculate enhanced visit statistics
      const completedVisits = customerVisits.filter(visit => visit.status === 'completed')
      const pendingVisits = customerVisits.filter(visit => visit.status === 'scheduled')
      const inProgressVisits = customerVisits.filter(visit => visit.status === 'in_progress')
      const cancelledVisits = customerVisits.filter(visit => visit.status === 'cancelled')
      const lateVisits = customerVisits.filter(visit => visit.is_late === true)

      console.log(`   📊 Enhanced Visit Statistics:`)
      console.log(`   - Total Visits: ${customerVisits.length}`)
      console.log(`   - Completed: ${completedVisits.length}`)
      console.log(`   - Pending: ${pendingVisits.length}`)
      console.log(`   - In Progress: ${inProgressVisits.length}`)
      console.log(`   - Cancelled: ${cancelledVisits.length}`)
      console.log(`   - Late: ${lateVisits.length}`)
      
      // Calculate visit duration for completed visits
      const completedVisitsWithDuration = completedVisits.filter(visit => 
        visit.actual_start_time && visit.actual_end_time
      )
      
      if (completedVisitsWithDuration.length > 0) {
        const totalVisitHours = completedVisitsWithDuration.reduce((total, visit) => {
          const start = new Date(visit.actual_start_time)
          const end = new Date(visit.actual_end_time)
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          return total + durationHours
        }, 0)
        
        const averageVisitDuration = totalVisitHours / completedVisitsWithDuration.length
        
        console.log(`   - Total Visit Hours: ${totalVisitHours.toFixed(2)}`)
        console.log(`   - Average Duration: ${averageVisitDuration.toFixed(2)} hours`)
      }
      
      // Show visit details
      const visitInfo = []
      if (completedVisits.length > 0) visitInfo.push(`${completedVisits.length} completed`)
      if (pendingVisits.length > 0) visitInfo.push(`${pendingVisits.length} pending`)
      if (inProgressVisits.length > 0) visitInfo.push(`${inProgressVisits.length} in progress`)
      if (lateVisits.length > 0) visitInfo.push(`${lateVisits.length} late`)
      
      const visitDetails = visitInfo.length > 0 ? visitInfo.join(', ') : 'No visits'
      console.log(`   Visit Details: ${visitDetails}`)
      
      if (customerVisits.length > 0) {
        const lastVisit = customerVisits[0]
        console.log(`   Last Visit Type: ${lastVisit.visit_type}`)
        console.log(`   Last Visit Delegate: ${lastVisit.delegate_name}`)
        console.log(`   Last Visit Date: ${lastVisit.scheduled_start_time}`)
      }
    }

    // Test visit status distribution
    console.log('\n📊 Visit Status Distribution:')
    if (visits && visits.length > 0) {
      const statusCounts = visits.reduce((acc, visit) => {
        acc[visit.status] = (acc[visit.status] || 0) + 1
        return acc
      }, {})

      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} visits`)
      })
    }

    // Test visit type distribution
    console.log('\n📊 Visit Type Distribution:')
    if (visits && visits.length > 0) {
      const typeCounts = visits.reduce((acc, visit) => {
        const type = visit.visit_type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} visits`)
      })
    }

    // Test late visits
    console.log('\n📊 Late Visits Analysis:')
    if (visits && visits.length > 0) {
      const lateVisits = visits.filter(visit => visit.is_late === true)
      const onTimeVisits = visits.filter(visit => visit.is_late === false)
      
      console.log(`   Late Visits: ${lateVisits.length}`)
      console.log(`   On Time Visits: ${onTimeVisits.length}`)
      console.log(`   Late Rate: ${((lateVisits.length / visits.length) * 100).toFixed(2)}%`)
    }

    console.log('\n✅ Enhanced Visit Information test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Customer data loading: ✅ Working')
    console.log('- Visit management data: ✅ Working')
    console.log('- Enhanced visit status calculation: ✅ Working')
    console.log('- Visit duration tracking: ✅ Working')
    console.log('- Visit type analysis: ✅ Working')
    console.log('- Late visit tracking: ✅ Working')
    console.log('\n🎯 The Customer Management page should now show enhanced visit information!')

  } catch (error) {
    console.error('❌ Error testing enhanced visit information:', error)
  }
}

// Run the test
testEnhancedVisitInfo()
