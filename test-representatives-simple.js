// Simple test to check representatives table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRepresentatives() {
  console.log('🔍 Testing representatives table...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('representatives')
      .select('id, name, email, status')
      .limit(5)
    
    if (error) {
      console.error('❌ Error:', error)
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('✅ Success! Found representatives:', data.length)
      console.log('Data:', data)
    }
  } catch (err) {
    console.error('❌ Exception:', err)
  }
}

testRepresentatives()