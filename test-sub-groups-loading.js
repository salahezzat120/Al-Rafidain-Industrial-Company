// =====================================================
// TEST SUB GROUPS LOADING
// This script tests if sub groups are loading correctly
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

async function testSubGroupsLoading() {
  console.log('🧪 Testing Sub Groups Loading...\n');

  try {
    // Test 1: Check if sub_groups table exists and has data
    console.log('📋 Test 1: Checking sub_groups table...');
    const { data: subGroups, error: subGroupsError } = await supabase
      .from('sub_groups')
      .select('*')
      .order('sub_group_name');

    if (subGroupsError) {
      console.error('❌ Sub Groups Error:', subGroupsError.message);
      console.log('💡 Solution: Run the sub groups RLS fix SQL script first');
      return;
    }

    console.log(`✅ Sub Groups: ${subGroups?.length || 0} records found`);
    
    if (subGroups && subGroups.length > 0) {
      console.log('📊 Sample Sub Groups:');
      subGroups.slice(0, 3).forEach(subGroup => {
        console.log(`   - ID: ${subGroup.id}, Name: ${subGroup.sub_group_name}, Main Group ID: ${subGroup.main_group_id}`);
      });
    } else {
      console.log('⚠️ No sub groups found in database');
      console.log('💡 Solution: Run the sub groups SQL script to insert sample data');
    }

    // Test 2: Test filtering by main group ID
    console.log('\n🔍 Test 2: Testing filtering by main group ID...');
    const mainGroupIds = [52, 53, 54, 55, 56]; // Based on your database data
    
    for (const mainGroupId of mainGroupIds) {
      const { data: filteredSubGroups, error: filterError } = await supabase
        .from('sub_groups')
        .select('*')
        .eq('main_group_id', mainGroupId)
        .order('sub_group_name');

      if (filterError) {
        console.error(`❌ Filter Error for main group ${mainGroupId}:`, filterError.message);
      } else {
        console.log(`✅ Main Group ${mainGroupId}: ${filteredSubGroups?.length || 0} sub groups`);
        if (filteredSubGroups && filteredSubGroups.length > 0) {
          console.log(`   Sample: ${filteredSubGroups[0].sub_group_name}`);
        }
      }
    }

    // Test 3: Check dropdown data structure
    console.log('\n🎯 Test 3: Checking dropdown data structure...');
    if (subGroups && subGroups.length > 0) {
      const sampleSubGroup = subGroups[0];
      console.log('📋 Sample sub group structure:');
      console.log(`   - id: ${sampleSubGroup.id} (type: ${typeof sampleSubGroup.id})`);
      console.log(`   - sub_group_name: ${sampleSubGroup.sub_group_name} (type: ${typeof sampleSubGroup.sub_group_name})`);
      console.log(`   - main_group_id: ${sampleSubGroup.main_group_id} (type: ${typeof sampleSubGroup.main_group_id})`);
      
      // Test dropdown mapping
      console.log('\n🔄 Dropdown mapping test:');
      const dropdownItems = subGroups.map(subGroup => ({
        key: subGroup.id,
        value: subGroup.id.toString(),
        label: subGroup.sub_group_name
      }));
      
      console.log('📋 Dropdown items:');
      dropdownItems.slice(0, 3).forEach(item => {
        console.log(`   - Key: ${item.key}, Value: "${item.value}", Label: "${item.label}"`);
      });
    }

    // Test 4: Check for common issues
    console.log('\n🔍 Test 4: Checking for common issues...');
    
    if (subGroups && subGroups.length === 0) {
      console.log('❌ Issue: No sub groups in database');
      console.log('💡 Solution: Run the sub groups SQL script');
    } else if (subGroups && subGroups.length > 0) {
      console.log('✅ Sub groups are available');
      
      // Check if all required fields exist
      const requiredFields = ['id', 'sub_group_name', 'main_group_id'];
      const missingFields = requiredFields.filter(field => !(field in subGroups[0]));
      
      if (missingFields.length > 0) {
        console.log(`❌ Issue: Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields are present');
      }
    }

    console.log('\n🎉 Sub groups loading test completed!');
    
    if (subGroups && subGroups.length > 0) {
      console.log('\n✅ SUCCESS: Sub groups are loaded and ready for dropdown!');
      console.log('📝 Next steps:');
      console.log('   1. Check that the component is calling loadSubGroups() when main group changes');
      console.log('   2. Verify that subGroups state is being set');
      console.log('   3. Check that the dropdown is using subGroups.map()');
      console.log('   4. Ensure main group selection triggers sub group loading');
    } else {
      console.log('\n❌ ISSUE: No sub groups found');
      console.log('📝 Solutions:');
      console.log('   1. Run the sub groups SQL script');
      console.log('   2. Check database connection');
      console.log('   3. Verify table name is correct');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSubGroupsLoading();
