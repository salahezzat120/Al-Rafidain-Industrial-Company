// Test script to verify product creation works
// This script tests the createProduct function with sample data

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample product data that matches the CreateProductData interface
const testProductData = {
  product_name: 'Test Product',
  product_name_ar: 'منتج تجريبي',
  product_code: 'TEST001',
  barcode: '1234567890123',
  stock_number: 'ST001',
  stock_number_ar: 'مخ001',
  main_group_id: 1, // Make sure this ID exists in your main_groups table
  sub_group_id: 1,  // Make sure this ID exists in your sub_groups table
  color_id: 1,      // Make sure this ID exists in your colors table
  material_id: 1,   // Make sure this ID exists in your materials table
  unit_of_measurement_id: 1, // Make sure this ID exists in your units_of_measurement table
  description: 'This is a test product',
  description_ar: 'هذا منتج تجريبي',
  cost_price: 10.50,
  selling_price: 15.75,
  weight: 2.5,
  dimensions: '10x20x30 cm',
  expiry_date: '2025-12-31',
  serial_number: 'SN123456789',
  warehouses: 'Main Warehouse, Secondary Warehouse',
  specifications: {
    material: 'HDPE',
    color: 'Blue',
    capacity: '5L'
  }
};

async function testProductCreation() {
  console.log('🧪 Testing Product Creation...\n');
  
  try {
    // First, let's check if the reference tables have data
    console.log('📋 Checking reference tables...');
    
    const { data: mainGroups, error: mainGroupsError } = await supabase
      .from('main_groups')
      .select('id, group_name')
      .limit(5);
    
    if (mainGroupsError) {
      console.error('❌ Error fetching main groups:', mainGroupsError);
      return;
    }
    
    console.log('✅ Main groups found:', mainGroups);
    
    const { data: subGroups, error: subGroupsError } = await supabase
      .from('sub_groups')
      .select('id, sub_group_name')
      .limit(5);
    
    if (subGroupsError) {
      console.error('❌ Error fetching sub groups:', subGroupsError);
      return;
    }
    
    console.log('✅ Sub groups found:', subGroups);
    
    const { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('id, color_name')
      .limit(5);
    
    if (colorsError) {
      console.error('❌ Error fetching colors:', colorsError);
      return;
    }
    
    console.log('✅ Colors found:', colors);
    
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, material_name')
      .limit(5);
    
    if (materialsError) {
      console.error('❌ Error fetching materials:', materialsError);
      return;
    }
    
    console.log('✅ Materials found:', materials);
    
    const { data: units, error: unitsError } = await supabase
      .from('units_of_measurement')
      .select('id, unit_name')
      .limit(5);
    
    if (unitsError) {
      console.error('❌ Error fetching units:', unitsError);
      return;
    }
    
    console.log('✅ Units found:', units);
    
    // Update test data with actual IDs from the database
    if (mainGroups && mainGroups.length > 0) {
      testProductData.main_group_id = mainGroups[0].id;
    }
    if (subGroups && subGroups.length > 0) {
      testProductData.sub_group_id = subGroups[0].id;
    }
    if (colors && colors.length > 0) {
      testProductData.color_id = colors[0].id;
    }
    if (materials && materials.length > 0) {
      testProductData.material_id = materials[0].id;
    }
    if (units && units.length > 0) {
      testProductData.unit_of_measurement_id = units[0].id;
    }
    
    console.log('\n📦 Test product data:', testProductData);
    
    // Now test the product creation
    console.log('\n🚀 Creating test product...');
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        product_name: testProductData.product_name,
        product_name_ar: testProductData.product_name_ar,
        product_code: testProductData.product_code,
        barcode: testProductData.barcode,
        stock_number: testProductData.stock_number,
        stock_number_ar: testProductData.stock_number_ar,
        stock: 0,
        main_group: 'Test Group', // Using string directly for testing
        sub_group: 'Test Sub Group',
        color: 'Blue',
        material: 'HDPE',
        unit_of_measurement: 'pcs',
        description: testProductData.description,
        description_ar: testProductData.description_ar,
        cost_price: testProductData.cost_price,
        selling_price: testProductData.selling_price,
        weight: testProductData.weight,
        dimensions: testProductData.dimensions,
        expiry_date: testProductData.expiry_date,
        serial_number: testProductData.serial_number,
        warehouse: testProductData.warehouses,
        specifications: testProductData.specifications,
        is_active: true
      }])
      .select('*')
      .single();
    
    if (productError) {
      console.error('❌ Error creating product:', productError);
      console.error('Error details:', JSON.stringify(productError, null, 2));
      return;
    }
    
    console.log('✅ Product created successfully!');
    console.log('📦 Product data:', product);
    
    // Clean up - delete the test product
    console.log('\n🧹 Cleaning up test product...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);
    
    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test product:', deleteError);
    } else {
      console.log('✅ Test product cleaned up successfully');
    }
    
    console.log('\n🎉 Product creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testProductCreation();
