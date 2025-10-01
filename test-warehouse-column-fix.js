// Test script to verify the warehouse column name fix
// This tests that products can be created with the correct column names

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWarehouseColumnFix() {
  console.log('🔧 Testing Warehouse Column Name Fix...\n');
  
  try {
    // Test with the correct column names
    console.log('Test: Creating product with correct column names...');
    const testData = {
      product_name: 'Warehouse Column Test',
      product_code: 'WCT001',
      main_group: 'General',
      unit: 'pcs',
      cost_price: 10.00,
      selling_price: 15.00,
      warehouses: 'Main Warehouse, Secondary Warehouse', // Using 'warehouses' (plural)
      is_active: true
    };
    
    console.log('Data to insert:', testData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([testData])
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Test failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      // Try with minimal data to see what works
      console.log('\nTrying with minimal data...');
      const minimalData = {
        product_name: 'Minimal Test',
        main_group: 'General',
        is_active: true
      };
      
      const { data: minimalResult, error: minimalError } = await supabase
        .from('products')
        .insert([minimalData])
        .select('*')
        .single();
      
      if (minimalError) {
        console.error('❌ Even minimal data failed:', minimalError);
      } else {
        console.log('✅ Minimal data worked!');
        console.log('Result:', minimalResult);
        
        // Clean up
        await supabase.from('products').delete().eq('id', minimalResult.id);
      }
    } else {
      console.log('✅ Test successful!');
      console.log('Product created:', data);
      
      // Test updating the warehouses field
      console.log('\nTest: Updating warehouses field...');
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
      console.log('\nCleaning up test data...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('⚠️  Warning: Could not delete test product:', deleteError);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
    }
    
    console.log('\n🎉 Warehouse column fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testWarehouseColumnFix();
