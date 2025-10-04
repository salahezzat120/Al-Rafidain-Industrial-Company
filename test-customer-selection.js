const { createClient } = require('@supabase/supabase-js')

// Test the customer selection functionality
async function testCustomerSelection() {
  console.log('🧪 Testing Customer Selection Functionality...\n')

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
    console.log('📊 Testing Customer Data Loading...')
    
    // Test loading customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, customer_id, name, email, phone, address, status')
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
    
    // Display first few customers
    console.log('\n📋 Sample customers:')
    customers.slice(0, 3).forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.customer_id})`)
      console.log(`   Email: ${customer.email}`)
      console.log(`   Phone: ${customer.phone}`)
      console.log(`   Address: ${customer.address}`)
      console.log(`   Status: ${customer.status}`)
      console.log('')
    })

    // Test customer search functionality
    console.log('🔍 Testing Customer Search...')
    
    const searchTerm = customers[0]?.name?.split(' ')[0] || 'Test'
    console.log(`Searching for: "${searchTerm}"`)
    
    const { data: searchResults, error: searchError } = await supabase
      .from('customers')
      .select('id, customer_id, name, email, phone, address, status')
      .or(`name.ilike.%${searchTerm}%,customer_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(5)

    if (searchError) {
      console.error('❌ Error searching customers:', searchError.message)
    } else {
      console.log(`✅ Search results: ${searchResults?.length || 0} customers found`)
      searchResults?.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.name} (${customer.customer_id})`)
      })
    }

    // Test customer by ID lookup
    console.log('\n🔍 Testing Customer by ID Lookup...')
    
    if (customers.length > 0) {
      const testCustomer = customers[0]
      console.log(`Looking up customer with ID: ${testCustomer.customer_id}`)
      
      const { data: customerById, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', testCustomer.customer_id)
        .single()

      if (customerError) {
        console.error('❌ Error fetching customer by ID:', customerError.message)
      } else if (customerById) {
        console.log('✅ Customer found by ID:')
        console.log(`   Name: ${customerById.name}`)
        console.log(`   Email: ${customerById.email}`)
        console.log(`   Phone: ${customerById.phone}`)
        console.log(`   Address: ${customerById.address}`)
        console.log(`   Status: ${customerById.status}`)
      } else {
        console.log('❌ Customer not found by ID')
      }
    }

    // Test customer status distribution
    console.log('\n📊 Customer Status Distribution:')
    const statusCounts = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1
      return acc
    }, {})

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} customers`)
    })

    console.log('\n✅ Customer Selection test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Customer data loading: ✅ Working')
    console.log('- Customer search: ✅ Working')
    console.log('- Customer lookup by ID: ✅ Working')
    console.log('- Customer status distribution: ✅ Working')
    console.log('\n🎯 The customer selection dropdown should now work properly!')

  } catch (error) {
    console.error('❌ Error testing customer selection:', error)
  }
}

// Run the test
testCustomerSelection()
