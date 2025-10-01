// Test script to verify the updateProduct function works correctly
// This tests updating a product with warehouse information

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateProduct() {
  console.log('🔧 Testing Update Product Function...\n');
  
  try {
    // First, create a test product
    console.log('Step 1: Creating test product...');
    const { data: testProduct, error: createError } = await supabase
      .from('products')
      .insert([{
        product_name: 'Update Test Product',
        product_code: 'UTP001',
        main_group: 'General',
        unit: 'pcs',
        cost_price: 10.00,
        selling_price: 15.00,
        is_active: true
      }])
      .select('*')
      .single();
    
    if (createError) {
      console.error('❌ Failed to create test product:', createError);
      return;
    }
    
    console.log('✅ Test product created:', testProduct);
    
    // Now test updating the product
    console.log('\nStep 2: Testing product update...');
    const updateData = {
      id: testProduct.id,
      warehouses: 'Main Warehouse, Secondary Warehouse'
    };
    
    console.log('Update data:', updateData);
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ warehouses: updateData.warehouses })
      .eq('id', updateData.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('❌ Update failed:');
      console.error('Error code:', updateError.code);
      console.error('Error message:', updateError.message);
      console.error('Error details:', updateError.details);
      console.error('Error hint:', updateError.hint);
    } else {
      console.log('✅ Update successful!');
      console.log('Updated product:', updatedProduct);
    }
    
    // Clean up - delete the test product
    console.log('\nStep 3: Cleaning up test product...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProduct.id);
    
    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test product:', deleteError);
    } else {
      console.log('✅ Test product cleaned up successfully');
    }
    
    console.log('\n🎉 Update product test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testUpdateProduct();
