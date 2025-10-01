// =====================================================
// TEST MAIN GROUPS CONNECTION
// This script tests the connection to main_groups table
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMainGroupsConnection() {
  console.log('🧪 Testing Main Groups Connection...\n');

  try {
    // Test 1: Basic connection test
    console.log('📡 Test 1: Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('main_groups')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('❌ Connection Error:', testError);
      console.log('💡 Possible issues:');
      console.log('   - Table does not exist');
      console.log('   - RLS (Row Level Security) is blocking access');
      console.log('   - Wrong table name');
      console.log('   - Database connection issues');
      return;
    }

    console.log('✅ Connection successful');

    // Test 2: Check if table has data
    console.log('\n📊 Test 2: Checking table data...');
    const { data: countData, error: countError } = await supabase
      .from('main_groups')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count Error:', countError);
    } else {
      console.log(`✅ Table has ${countData?.length || 0} records`);
    }

    // Test 3: Fetch actual data
    console.log('\n📋 Test 3: Fetching main groups data...');
    const { data: mainGroups, error: fetchError } = await supabase
      .from('main_groups')
      .select('*')
      .order('group_name');

    if (fetchError) {
      console.error('❌ Fetch Error:', fetchError);
      console.log('Error details:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint
      });
    } else {
      console.log(`✅ Successfully fetched ${mainGroups?.length || 0} main groups`);
      
      if (mainGroups && mainGroups.length > 0) {
        console.log('\n📋 Sample data:');
        mainGroups.slice(0, 3).forEach((group, index) => {
          console.log(`   ${index + 1}. ID: ${group.id}, Name: ${group.group_name}, Arabic: ${group.group_name_ar || 'N/A'}`);
        });
      } else {
        console.log('⚠️ No data found in main_groups table');
        console.log('💡 Solution: Run the main groups SQL script to insert data');
      }
    }

    // Test 4: Check RLS policies
    console.log('\n🔒 Test 4: Checking RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('main_groups')
      .select('id')
      .limit(1);

    if (rlsError && rlsError.code === '42501') {
      console.log('❌ RLS Error: Permission denied');
      console.log('💡 Solution: Disable RLS for main_groups table or create proper policies');
      console.log('   SQL: ALTER TABLE main_groups DISABLE ROW LEVEL SECURITY;');
    } else if (rlsError) {
      console.log('❌ RLS Error:', rlsError.message);
    } else {
      console.log('✅ RLS policies allow access');
    }

    console.log('\n🎉 Main groups connection test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testMainGroupsConnection();
