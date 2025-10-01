const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_KEY') {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRepresentativesSimple() {
  console.log('🔍 Testing representatives table...');
  
  try {
    // Test 1: Basic table existence
    console.log('\n1. Testing basic table access...');
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Table access error:', error);
      console.log('📋 Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Table accessible');
    console.log('📊 Data type:', typeof data);
    console.log('📊 Is array:', Array.isArray(data));
    console.log('📊 Data:', data);

    // Test 2: Check if we have any representatives
    console.log('\n2. Checking representatives count...');
    const { count, error: countError } = await supabase
      .from('representatives')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log('📊 Total representatives:', count);
    }

    // Test 3: Get all representatives
    console.log('\n3. Getting all representatives...');
    const { data: allReps, error: allError } = await supabase
      .from('representatives')
      .select('*');

    if (allError) {
      console.error('❌ All representatives error:', allError);
    } else {
      console.log('✅ All representatives fetched');
      console.log('📊 Count:', allReps?.length || 0);
      console.log('📊 Data type:', typeof allReps);
      console.log('📊 Is array:', Array.isArray(allReps));
      
      if (allReps && allReps.length > 0) {
        console.log('📋 Sample representative:', allReps[0]);
      }
    }

    console.log('\n🎉 Representatives test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRepresentativesSimple();
