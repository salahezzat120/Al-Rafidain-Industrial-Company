const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_KEY') {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRepresentativesTable() {
  console.log('🔍 Testing representatives table...');
  
  try {
    // Test 1: Check if representatives table exists
    console.log('\n1. Checking if representatives table exists...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('representatives')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Representatives table error:', tableError);
      console.log('📋 Error details:', JSON.stringify(tableError, null, 2));
      return;
    }

    console.log('✅ Representatives table accessible');

    // Test 2: Check table structure
    console.log('\n2. Checking table structure...');
    const { data: allReps, error: allError } = await supabase
      .from('representatives')
      .select('*')
      .limit(5);

    if (allError) {
      console.error('❌ Error fetching representatives:', allError);
      return;
    }

    console.log('📊 Total representatives:', allReps?.length || 0);
    console.log('📋 Representatives data:', allReps);

    // Test 3: Check data types
    console.log('\n3. Checking data types...');
    if (Array.isArray(allReps)) {
      console.log('✅ Data is an array');
      if (allReps.length > 0) {
        console.log('📋 Sample representative:', allReps[0]);
        console.log('📋 Representative keys:', Object.keys(allReps[0]));
      }
    } else {
      console.error('❌ Data is not an array:', typeof allReps, allReps);
    }

    // Test 4: Test filtered query
    console.log('\n4. Testing filtered query...');
    const { data: filteredReps, error: filteredError } = await supabase
      .from('representatives')
      .select('*')
      .in('status', ['active', 'on-route'])
      .order('name', { ascending: true });

    if (filteredError) {
      console.error('❌ Filtered query error:', filteredError);
    } else {
      console.log('✅ Filtered query successful');
      console.log('📊 Filtered representatives:', filteredReps?.length || 0);
    }

    console.log('\n🎉 Representatives table test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRepresentativesTable();


