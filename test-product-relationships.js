// Test script to verify product relationships are working correctly
// Run this in your browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductRelationships() {
  console.log('🔍 Testing product relationships...');
  
  try {
    // Test 1: Check if reference tables have data
    console.log('\n📊 Checking reference table data:');
    
    const [mainGroups, subGroups, colors, materials, units] = await Promise.all([
      supabase.from('main_groups').select('*'),
      supabase.from('sub_groups').select('*'),
      supabase.from('colors').select('*'),
      supabase.from('materials').select('*'),
      supabase.from('units_of_measurement').select('*')
    ]);
    
    console.log(`Main Groups: ${mainGroups.data?.length || 0} records`);
    console.log(`Sub Groups: ${subGroups.data?.length || 0} records`);
    console.log(`Colors: ${colors.data?.length || 0} records`);
    console.log(`Materials: ${materials.data?.length || 0} records`);
    console.log(`Units: ${units.data?.length || 0} records`);
    
    // Test 2: Check products with relationships
    console.log('\n🔗 Testing product relationships:');
    
    const { data: products, error } = await supabase
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
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products?.length || 0} products`);
    
    // Test 3: Verify each product has proper relationships
    products?.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.product_name}`);
      console.log(`  Main Group: ${product.main_group?.group_name || 'MISSING'}`);
      console.log(`  Sub Group: ${product.sub_group?.sub_group_name || 'MISSING'}`);
      console.log(`  Color: ${product.color?.color_name || 'MISSING'}`);
      console.log(`  Material: ${product.material?.material_name || 'MISSING'}`);
      console.log(`  Unit: ${product.unit_of_measurement?.unit_name || 'MISSING'}`);
      
      // Check for missing relationships
      const missing = [];
      if (!product.main_group?.group_name) missing.push('Main Group');
      if (!product.sub_group?.sub_group_name) missing.push('Sub Group');
      if (!product.color?.color_name) missing.push('Color');
      if (!product.material?.material_name) missing.push('Material');
      if (!product.unit_of_measurement?.unit_name) missing.push('Unit');
      
      if (missing.length > 0) {
        console.log(`  ⚠️  Missing relationships: ${missing.join(', ')}`);
      } else {
        console.log(`  ✅ All relationships present`);
      }
    });
    
    // Test 4: Check for any products with NULL foreign keys
    console.log('\n🔍 Checking for orphaned products:');
    
    const orphanedProducts = products?.filter(product => 
      !product.main_group || 
      !product.sub_group || 
      !product.color || 
      !product.material || 
      !product.unit_of_measurement
    );
    
    if (orphanedProducts?.length > 0) {
      console.log(`❌ Found ${orphanedProducts.length} products with missing relationships:`);
      orphanedProducts.forEach(product => {
        console.log(`  - ${product.product_name} (ID: ${product.id})`);
      });
    } else {
      console.log('✅ All products have proper relationships');
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductRelationships();
