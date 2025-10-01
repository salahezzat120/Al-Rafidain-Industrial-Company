// =====================================================
// TEST DROPDOWN FUNCTIONALITY
// This script tests if all dropdown data is loading correctly
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

async function testDropdownData() {
  console.log('🧪 Testing Dropdown Data Loading...\n');

  try {
    // Test Main Groups
    console.log('📋 Testing Main Groups...');
    const { data: mainGroups, error: mainGroupsError } = await supabase
      .from('main_groups')
      .select('*')
      .order('group_name');
    
    if (mainGroupsError) {
      console.error('❌ Main Groups Error:', mainGroupsError.message);
    } else {
      console.log(`✅ Main Groups: ${mainGroups?.length || 0} records found`);
      if (mainGroups && mainGroups.length > 0) {
        console.log('   Sample:', mainGroups[0].group_name);
      }
    }

    // Test Sub Groups
    console.log('\n📋 Testing Sub Groups...');
    const { data: subGroups, error: subGroupsError } = await supabase
      .from('sub_groups')
      .select(`
        *,
        main_group:main_groups(group_name)
      `)
      .order('sub_group_name');
    
    if (subGroupsError) {
      console.error('❌ Sub Groups Error:', subGroupsError.message);
    } else {
      console.log(`✅ Sub Groups: ${subGroups?.length || 0} records found`);
      if (subGroups && subGroups.length > 0) {
        console.log('   Sample:', subGroups[0].sub_group_name, 'in', subGroups[0].main_group?.group_name);
      }
    }

    // Test Colors
    console.log('\n🎨 Testing Colors...');
    const { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('*')
      .order('color_name');
    
    if (colorsError) {
      console.error('❌ Colors Error:', colorsError.message);
    } else {
      console.log(`✅ Colors: ${colors?.length || 0} records found`);
      if (colors && colors.length > 0) {
        console.log('   Sample:', colors[0].color_name, colors[0].color_code);
      }
    }

    // Test Materials
    console.log('\n🔧 Testing Materials...');
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .order('material_name');
    
    if (materialsError) {
      console.error('❌ Materials Error:', materialsError.message);
    } else {
      console.log(`✅ Materials: ${materials?.length || 0} records found`);
      if (materials && materials.length > 0) {
        console.log('   Sample:', materials[0].material_name, materials[0].material_type);
      }
    }

    // Test Units of Measurement
    console.log('\n📏 Testing Units of Measurement...');
    const { data: units, error: unitsError } = await supabase
      .from('units_of_measurement')
      .select('*')
      .order('unit_name');
    
    if (unitsError) {
      console.error('❌ Units Error:', unitsError.message);
    } else {
      console.log(`✅ Units: ${units?.length || 0} records found`);
      if (units && units.length > 0) {
        console.log('   Sample:', units[0].unit_name, units[0].unit_symbol, units[0].unit_type);
      }
    }

    // Test Warehouses
    console.log('\n🏭 Testing Warehouses...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*')
      .order('warehouse_name');
    
    if (warehousesError) {
      console.error('❌ Warehouses Error:', warehousesError.message);
    } else {
      console.log(`✅ Warehouses: ${warehouses?.length || 0} records found`);
      if (warehouses && warehouses.length > 0) {
        console.log('   Sample:', warehouses[0].warehouse_name, 'in', warehouses[0].location);
      }
    }

    // Test Product Creation Form Data Loading
    console.log('\n🛍️ Testing Product Form Data Loading...');
    const [
      mainGroupsData,
      colorsData,
      materialsData,
      unitsData,
      warehousesData
    ] = await Promise.all([
      supabase.from('main_groups').select('*').order('group_name'),
      supabase.from('colors').select('*').order('color_name'),
      supabase.from('materials').select('*').order('material_name'),
      supabase.from('units_of_measurement').select('*').order('unit_name'),
      supabase.from('warehouses').select('*').order('warehouse_name')
    ]);

    const allDataLoaded = 
      !mainGroupsData.error && 
      !colorsData.error && 
      !materialsData.error && 
      !unitsData.error && 
      !warehousesData.error;

    if (allDataLoaded) {
      console.log('✅ All dropdown data loaded successfully!');
      console.log(`   Main Groups: ${mainGroupsData.data?.length || 0}`);
      console.log(`   Colors: ${colorsData.data?.length || 0}`);
      console.log(`   Materials: ${materialsData.data?.length || 0}`);
      console.log(`   Units: ${unitsData.data?.length || 0}`);
      console.log(`   Warehouses: ${warehousesData.data?.length || 0}`);
    } else {
      console.log('❌ Some dropdown data failed to load');
    }

    // Test Sub Groups Loading for a specific main group
    if (mainGroupsData.data && mainGroupsData.data.length > 0) {
      const firstMainGroup = mainGroupsData.data[0];
      console.log(`\n🔗 Testing Sub Groups for "${firstMainGroup.group_name}"...`);
      
      const { data: subGroupsForMain, error: subGroupsForMainError } = await supabase
        .from('sub_groups')
        .select('*')
        .eq('main_group_id', firstMainGroup.id)
        .order('sub_group_name');
      
      if (subGroupsForMainError) {
        console.error('❌ Sub Groups for Main Group Error:', subGroupsForMainError.message);
      } else {
        console.log(`✅ Sub Groups for "${firstMainGroup.group_name}": ${subGroupsForMain?.length || 0} records found`);
        if (subGroupsForMain && subGroupsForMain.length > 0) {
          console.log('   Sample:', subGroupsForMain[0].sub_group_name);
        }
      }
    }

    console.log('\n🎉 Dropdown functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDropdownData();
