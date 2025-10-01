// Isolated test for createProduct function
// This will help identify the exact issue

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the createProduct function logic
async function testCreateProductIsolated() {
  console.log('🧪 Testing CreateProduct Function Isolated...\n');
  
  try {
    // Test data that matches the form structure
    const productData = {
      product_name: 'Isolated Test Product',
      product_name_ar: 'منتج تجريبي معزول',
      product_code: 'ITP001',
      barcode: '1234567890123',
      stock_number: 'ST001',
      stock_number_ar: 'مخ001',
      main_group_id: 0,
      sub_group_id: undefined,
      color_id: undefined,
      material_id: undefined,
      unit_of_measurement_id: 0,
      description: 'Isolated test product',
      description_ar: 'منتج تجريبي معزول',
      cost_price: 20.00,
      selling_price: 30.00,
      weight: 1.5,
      dimensions: '10x15x20 cm',
      expiry_date: '2025-12-31',
      serial_number: 'SN123456789',
      warehouses: 'Test Warehouse',
      specifications: { material: 'Test', color: 'Blue' }
    };
    
    console.log('Input data:', productData);
    
    // Simulate the createProduct function logic
    const fullProductData = {
      product_name: productData.product_name.trim(),
      product_name_ar: productData.product_name_ar || productData.product_name.trim(),
      product_code: productData.product_code || '',
      barcode: productData.barcode || '',
      stock_number: productData.stock_number || '',
      stock_number_ar: productData.stock_number_ar || productData.stock_number || '',
      stock: 0,
      main_group: 'General',
      sub_group: '',
      color: '',
      material: '',
      unit: 'pcs',
      description: productData.description || '',
      description_ar: productData.description_ar || productData.description || '',
      cost_price: productData.cost_price || 0,
      selling_price: productData.selling_price || 0,
      weight: productData.weight || null,
      dimensions: productData.dimensions || '',
      expiry_date: productData.expiry_date || null,
      serial_number: productData.serial_number || '',
      warehouses: productData.warehouses || '',
      specifications: productData.specifications || {},
      is_active: true
    };
    
    console.log('Processed data:', fullProductData);
    
    // Try to insert
    console.log('\nAttempting to insert product...');
    const { data, error } = await supabase
      .from('products')
      .insert([fullProductData])
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Insert failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Insert successful!');
      console.log('Created product:', data);
      
      // Test updating the product
      console.log('\nTesting product update...');
      const { data: updateData, error: updateError } = await supabase
        .from('products')
        .update({ warehouses: 'Updated Warehouse 1, Updated Warehouse 2' })
        .eq('id', data.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('❌ Update failed:', updateError);
      } else {
        console.log('✅ Update successful!');
        console.log('Updated product:', updateData);
      }
      
      // Clean up
      console.log('\nCleaning up...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('⚠️  Warning: Could not delete test product:', deleteError);
      } else {
        console.log('✅ Test product cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCreateProductIsolated();
