// Test script to verify form mapping works correctly
// This tests that IDs are properly mapped to names

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFormMapping() {
  console.log('🧪 Testing Form Mapping...\n');
  
  try {
    // First, check if reference tables have data
    console.log('Step 1: Checking reference tables...');
    
    const { data: mainGroups } = await supabase.from('main_groups').select('*').limit(5);
    const { data: subGroups } = await supabase.from('sub_groups').select('*').limit(5);
    const { data: colors } = await supabase.from('colors').select('*').limit(5);
    const { data: materials } = await supabase.from('materials').select('*').limit(5);
    const { data: units } = await supabase.from('units_of_measurement').select('*').limit(5);
    
    console.log('Main groups:', mainGroups?.length || 0);
    console.log('Sub groups:', subGroups?.length || 0);
    console.log('Colors:', colors?.length || 0);
    console.log('Materials:', materials?.length || 0);
    console.log('Units:', units?.length || 0);
    
    if (mainGroups && mainGroups.length > 0) {
      console.log('Sample main group:', mainGroups[0]);
    }
    if (subGroups && subGroups.length > 0) {
      console.log('Sample sub group:', subGroups[0]);
    }
    if (colors && colors.length > 0) {
      console.log('Sample color:', colors[0]);
    }
    if (materials && materials.length > 0) {
      console.log('Sample material:', materials[0]);
    }
    if (units && units.length > 0) {
      console.log('Sample unit:', units[0]);
    }
    
    // Test the mapping logic
    console.log('\nStep 2: Testing ID to name mapping...');
    
    if (mainGroups && mainGroups.length > 0 && subGroups && subGroups.length > 0 && 
        colors && colors.length > 0 && materials && materials.length > 0 && units && units.length > 0) {
      
      const testProductData = {
        product_name: 'Mapping Test Product',
        product_code: 'MTP001',
        main_group_id: mainGroups[0].id,
        sub_group_id: subGroups[0].id,
        color_id: colors[0].id,
        material_id: materials[0].id,
        unit_of_measurement_id: units[0].id,
        description: 'Test product for mapping',
        cost_price: 25.00,
        selling_price: 35.00,
        is_active: true
      };
      
      console.log('Test product data:', testProductData);
      
      // Simulate the mapping logic
      const mainGroupName = mainGroups.find(g => g.id === testProductData.main_group_id)?.group_name || 'General';
      const subGroupName = subGroups.find(g => g.id === testProductData.sub_group_id)?.sub_group_name || '';
      const colorName = colors.find(c => c.id === testProductData.color_id)?.color_name || '';
      const materialName = materials.find(m => m.id === testProductData.material_id)?.material_name || '';
      const unitName = units.find(u => u.id === testProductData.unit_of_measurement_id)?.unit_name || 'pcs';
      
      console.log('\nMapped values:');
      console.log('Main group:', mainGroupName);
      console.log('Sub group:', subGroupName);
      console.log('Color:', colorName);
      console.log('Material:', materialName);
      console.log('Unit:', unitName);
      
      // Test creating a product with the mapped data
      console.log('\nStep 3: Testing product creation with mapped data...');
      
      const fullProductData = {
        product_name: testProductData.product_name,
        product_code: testProductData.product_code,
        main_group: mainGroupName,
        sub_group: subGroupName,
        color: colorName,
        material: materialName,
        unit: unitName,
        description: testProductData.description,
        cost_price: testProductData.cost_price,
        selling_price: testProductData.selling_price,
        stock: 0,
        is_active: true
      };
      
      console.log('Full product data:', fullProductData);
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([fullProductData])
        .select('*')
        .single();
      
      if (productError) {
        console.error('❌ Product creation failed:', productError);
      } else {
        console.log('✅ Product created successfully!');
        console.log('Product data:', product);
        
        // Verify the mapped values are correct
        console.log('\nVerification:');
        console.log('Main group matches:', product.main_group === mainGroupName);
        console.log('Sub group matches:', product.sub_group === subGroupName);
        console.log('Color matches:', product.color === colorName);
        console.log('Material matches:', product.material === materialName);
        console.log('Unit matches:', product.unit === unitName);
        
        // Clean up
        console.log('\nCleaning up test product...');
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        
        if (deleteError) {
          console.error('⚠️  Warning: Could not delete test product:', deleteError);
        } else {
          console.log('✅ Test product cleaned up successfully');
        }
      }
    } else {
      console.log('⚠️  Reference tables are empty. Please run populate-reference-tables.sql first.');
    }
    
    console.log('\n🎉 Form mapping test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFormMapping();
