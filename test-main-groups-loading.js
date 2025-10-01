// =====================================================
// TEST MAIN GROUPS LOADING
// This script tests if main groups are loading correctly
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMainGroupsLoading() {
  console.log('🧪 Testing Main Groups Loading...\n');

  try {
    // Test 1: Check if main_groups table exists and has data
    console.log('📋 Test 1: Checking main_groups table...');
    const { data: mainGroups, error: mainGroupsError } = await supabase
      .from('main_groups')
      .select('*')
      .order('group_name');

    if (mainGroupsError) {
      console.error('❌ Main Groups Error:', mainGroupsError.message);
      console.log('💡 Solution: Run the main groups SQL script first');
      return;
    }

    console.log(`✅ Main Groups: ${mainGroups?.length || 0} records found`);
    
    if (mainGroups && mainGroups.length > 0) {
      console.log('📊 Sample Main Groups:');
      mainGroups.slice(0, 3).forEach(group => {
        console.log(`   - ID: ${group.id}, Name: ${group.group_name}, Arabic: ${group.group_name_ar || 'N/A'}`);
      });
    } else {
      console.log('⚠️ No main groups found in database');
      console.log('💡 Solution: Run the main groups SQL script to insert sample data');
    }

    // Test 2: Check if the API function works
    console.log('\n🔧 Test 2: Testing API function...');
    
    // Simulate the getMainGroups function
    const { data: apiData, error: apiError } = await supabase
      .from('main_groups')
      .select('*')
      .order('group_name');

    if (apiError) {
      console.error('❌ API Error:', apiError.message);
    } else {
      console.log(`✅ API Function: ${apiData?.length || 0} records returned`);
    }

    // Test 3: Check dropdown data structure
    console.log('\n🎯 Test 3: Checking dropdown data structure...');
    if (mainGroups && mainGroups.length > 0) {
      const sampleGroup = mainGroups[0];
      console.log('📋 Sample group structure:');
      console.log(`   - id: ${sampleGroup.id} (type: ${typeof sampleGroup.id})`);
      console.log(`   - group_name: ${sampleGroup.group_name} (type: ${typeof sampleGroup.group_name})`);
      console.log(`   - group_name_ar: ${sampleGroup.group_name_ar || 'N/A'} (type: ${typeof sampleGroup.group_name_ar})`);
      
      // Test dropdown mapping
      console.log('\n🔄 Dropdown mapping test:');
      const dropdownItems = mainGroups.map(group => ({
        key: group.id,
        value: group.id.toString(),
        label: group.group_name
      }));
      
      console.log('📋 Dropdown items:');
      dropdownItems.slice(0, 3).forEach(item => {
        console.log(`   - Key: ${item.key}, Value: "${item.value}", Label: "${item.label}"`);
      });
    }

    // Test 4: Check for common issues
    console.log('\n🔍 Test 4: Checking for common issues...');
    
    if (mainGroups && mainGroups.length === 0) {
      console.log('❌ Issue: No main groups in database');
      console.log('💡 Solution: Run the main groups SQL script');
    } else if (mainGroups && mainGroups.length > 0) {
      console.log('✅ Main groups are available');
      
      // Check if all required fields exist
      const requiredFields = ['id', 'group_name'];
      const missingFields = requiredFields.filter(field => !(field in mainGroups[0]));
      
      if (missingFields.length > 0) {
        console.log(`❌ Issue: Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields are present');
      }
    }

    console.log('\n🎉 Main groups loading test completed!');
    
    if (mainGroups && mainGroups.length > 0) {
      console.log('\n✅ SUCCESS: Main groups are loaded and ready for dropdown!');
      console.log('📝 Next steps:');
      console.log('   1. Check that the component is calling loadData()');
      console.log('   2. Verify that mainGroups state is being set');
      console.log('   3. Check that the dropdown is using mainGroups.map()');
    } else {
      console.log('\n❌ ISSUE: No main groups found');
      console.log('📝 Solutions:');
      console.log('   1. Run the main groups SQL script');
      console.log('   2. Check database connection');
      console.log('   3. Verify table name is correct');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testMainGroupsLoading();
