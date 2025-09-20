const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugLiveMap() {
  console.log('=== DEBUGGING LIVE MAP DATA ===')
  
  try {
    // Check representative_live_locations table
    console.log('\n1. Checking representative_live_locations table:')
    const { data: locations, error: locationsError } = await supabase
      .from('representative_live_locations')
      .select('*')
      .order('timestamp', { ascending: false })
    
    console.log('Locations count:', locations?.length || 0)
    console.log('Locations data:', locations)
    console.log('Locations error:', locationsError)
    
    // Check representatives table
    console.log('\n2. Checking representatives table:')
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('*')
      .limit(10)
    
    console.log('Representatives count:', representatives?.length || 0)
    console.log('Representatives data:', representatives)
    console.log('Representatives error:', repsError)
    
    // Check customers table
    console.log('\n3. Checking customers table:')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(10)
    
    console.log('Customers with GPS count:', customers?.length || 0)
    console.log('Customers data:', customers)
    console.log('Customers error:', customersError)
    
    // Test the join query
    console.log('\n4. Testing join query:')
    const { data: joinedData, error: joinError } = await supabase
      .from('representative_live_locations')
      .select(`
        *,
        representatives!representative_live_locations_representative_id_fkey (
          id,
          name,
          phone
        )
      `)
      .order('timestamp', { ascending: false })
    
    console.log('Joined data count:', joinedData?.length || 0)
    console.log('Joined data:', joinedData)
    console.log('Join error:', joinError)
    
  } catch (error) {
    console.error('Debug failed:', error)
  }
}

debugLiveMap()
