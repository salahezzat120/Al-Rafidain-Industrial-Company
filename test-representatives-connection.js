// Test script to check representatives table connection
import { supabase } from './lib/supabase.js'

async function testRepresentativesConnection() {
  console.log('🔍 Testing representatives table connection...')
  
  try {
    // Test 1: Check if table exists by trying to select from it
    console.log('📊 Test 1: Basic table access')
    const { data: basicData, error: basicError } = await supabase
      .from('representatives')
      .select('*')
      .limit(1)
    
    if (basicError) {
      console.error('❌ Basic access failed:', basicError)
      console.log('🔍 Error details:', {
        code: basicError.code,
        message: basicError.message,
        details: basicError.details,
        hint: basicError.hint
      })
    } else {
      console.log('✅ Basic access successful:', basicData)
    }
    
    // Test 2: Check table structure
    console.log('📊 Test 2: Table structure check')
    const { data: structureData, error: structureError } = await supabase
      .from('representatives')
      .select('id, name, email, status')
      .limit(5)
    
    if (structureError) {
      console.error('❌ Structure check failed:', structureError)
    } else {
      console.log('✅ Structure check successful:', structureData)
      console.log('📊 Found representatives:', structureData.length)
    }
    
    // Test 3: Check RLS policies
    console.log('📊 Test 3: RLS policy check')
    const { data: rlsData, error: rlsError } = await supabase
      .from('representatives')
      .select('id, name')
      .eq('status', 'active')
    
    if (rlsError) {
      console.error('❌ RLS check failed:', rlsError)
    } else {
      console.log('✅ RLS check successful:', rlsData)
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

// Run the test
testRepresentativesConnection()
