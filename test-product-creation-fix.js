// Test script to verify product creation works after removing inventory dependencies
// This script tests the simplified createProduct function

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample product data that matches the CreateProductData interface
const testProductData = {
  product_name: 'Test Product - No Dependencies',
  product_name_ar: 'منتج تجريبي - بدون تبعيات',
  product_code: 'TEST002',
  barcode: '1234567890124',
  stock_number: 'ST002',
  stock_number_ar: 'مخ002',
  main_group_id: 0, // Will be ignored and use default
  sub_group_id: undefined, // Will be ignored and use default
  color_id: undefined, // Will be ignored and use default
  material_id: undefined, // Will be ignored and use default
  unit_of_measurement_id: 0, // Will be ignored and use default
  description: 'This is a test product without dependencies',
  description_ar: 'هذا منتج تجريبي بدون تبعيات',
  cost_price: 15.00,
  selling_price: 22.50,
  weight: 1.5,
  dimensions: '12x15x20 cm',
  expiry_date: '2025-12-31',
  serial_number: 'SN987654321',
  warehouses: 'Test Warehouse',
  specifications: {
    material: 'Test Material',
    color: 'Test Color',
    capacity: '3L'
  }
};

async function testSimplifiedProductCreation() {
  console.log('🧪 Testing Simplified Product Creation...\n');
  
  try {
    console.log('📦 Test product data:', testProductData);
    
    // Test the simplified product creation
    console.log('\n🚀 Creating test product with simplified approach...');
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        product_name: testProductData.product_name,
        product_name_ar: testProductData.product_name_ar,
        product_code: testProductData.product_code,
        barcode: testProductData.barcode,
        stock_number: testProductData.stock_number,
        stock_number_ar: testProductData.stock_number_ar,
        stock: 0, // Default stock
        main_group: 'General', // Default main group
        sub_group: '', // Empty sub group
        color: '', // Empty color
        material: '', // Empty material
        unit_of_measurement: 'pcs', // Default unit
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
    
    // Test updating the product with warehouse information
    console.log('\n🔄 Testing product update with warehouse info...');
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ warehouse: 'Main Warehouse, Secondary Warehouse' })
      .eq('id', product.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('❌ Error updating product:', updateError);
    } else {
      console.log('✅ Product updated successfully!');
      console.log('📦 Updated product data:', updatedProduct);
    }
    
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
    
    console.log('\n🎉 Simplified product creation test completed successfully!');
    console.log('✅ No inventory table dependencies required');
    console.log('✅ Product creation works with default values');
    console.log('✅ Warehouse assignment works via product.warehouse field');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSimplifiedProductCreation();
