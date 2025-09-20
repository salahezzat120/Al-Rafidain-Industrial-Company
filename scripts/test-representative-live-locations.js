const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co' // Replace with your actual URL
const supabaseKey = 'your-anon-key' // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRepresentativeLiveLocations() {
  console.log('Testing representative live locations...')
  
  try {
    // First, let's check if the table exists and has data
    const { data: locations, error: locationsError } = await supabase
      .from('representative_live_locations')
      .select('*')
      .limit(5)
    
    console.log('Locations data:', locations)
    console.log('Locations error:', locationsError)
    
    // Check representatives table
    const { data: representatives, error: repsError } = await supabase
      .from('representatives')
      .select('*')
      .limit(5)
    
    console.log('Representatives data:', representatives)
    console.log('Representatives error:', repsError)
    
    // Test the join query
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
      .limit(5)
    
    console.log('Joined data:', joinedData)
    console.log('Join error:', joinError)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testRepresentativeLiveLocations()
