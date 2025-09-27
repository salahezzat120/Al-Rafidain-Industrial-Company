// Debug Supabase Query
// Run this in your browser console to test the exact query that's failing

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupabaseQuery() {
  console.log('🔍 Debugging Supabase query...');
  
  try {
    // Test 1: Basic products query
    console.log('\n1️⃣ Testing basic products query...');
    const { data: basicProducts, error: basicError } = await supabase
      .from('products')
      .select('*')
      .order('product_name');
    
    if (basicError) {
      console.error('❌ Basic query failed:', basicError);
      return;
    }
    
    console.log(`✅ Basic query successful: ${basicProducts?.length || 0} products`);
    console.log('Sample product:', basicProducts?.[0]);
    
    // Test 2: Products with main_group join
    console.log('\n2️⃣ Testing products with main_group join...');
    const { data: productsWithMainGroup, error: mainGroupError } = await supabase
      .from('products')
      .select(`
        *,
        main_group:main_groups(*)
      `)
      .order('product_name');
    
    if (mainGroupError) {
      console.error('❌ Main group join failed:', mainGroupError);
    } else {
      console.log(`✅ Main group join successful: ${productsWithMainGroup?.length || 0} products`);
      console.log('Sample with main group:', productsWithMainGroup?.[0]);
    }
    
    // Test 3: Full query (same as getProductsWithWarehouseInfo)
    console.log('\n3️⃣ Testing full query (getProductsWithWarehouseInfo)...');
    const { data: fullProducts, error: fullError } = await supabase
      .from('products')
      .select(`
        *,
        main_group:main_groups(*),
        sub_group:sub_groups(*),
        color:colors(*),
        material:materials(*),
        unit_of_measurement:units_of_measurement(*)
      `)
      .order('product_name');
    
    if (fullError) {
      console.error('❌ Full query failed:', fullError);
      
      // Test 4: Check if reference tables exist and have data
      console.log('\n4️⃣ Checking reference tables...');
      
      const [mainGroups, subGroups, colors, materials, units] = await Promise.all([
        supabase.from('main_groups').select('*'),
        supabase.from('sub_groups').select('*'),
        supabase.from('colors').select('*'),
        supabase.from('materials').select('*'),
        supabase.from('units_of_measurement').select('*')
      ]);
      
      console.log('Main Groups:', mainGroups.data?.length || 0, 'records');
      console.log('Sub Groups:', subGroups.data?.length || 0, 'records');
      console.log('Colors:', colors.data?.length || 0, 'records');
      console.log('Materials:', materials.data?.length || 0, 'records');
      console.log('Units:', units.data?.length || 0, 'records');
      
      if (mainGroups.error) console.error('Main groups error:', mainGroups.error);
      if (subGroups.error) console.error('Sub groups error:', subGroups.error);
      if (colors.error) console.error('Colors error:', colors.error);
      if (materials.error) console.error('Materials error:', materials.error);
      if (units.error) console.error('Units error:', units.error);
      
    } else {
      console.log(`✅ Full query successful: ${fullProducts?.length || 0} products`);
      console.log('Sample with all relationships:', fullProducts?.[0]);
      
      // Check if names are properly populated
      const sampleProduct = fullProducts?.[0];
      if (sampleProduct) {
        console.log('\n📋 Sample product relationships:');
        console.log('Main Group:', sampleProduct.main_group?.group_name || 'MISSING');
        console.log('Sub Group:', sampleProduct.sub_group?.sub_group_name || 'MISSING');
        console.log('Color:', sampleProduct.color?.color_name || 'MISSING');
        console.log('Material:', sampleProduct.material?.material_name || 'MISSING');
        console.log('Unit:', sampleProduct.unit_of_measurement?.unit_name || 'MISSING');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugSupabaseQuery();
