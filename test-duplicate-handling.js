// Test script to verify duplicate product code handling
// This tests both the validation and the error handling

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDuplicateHandling() {
  console.log('🔍 Testing Duplicate Product Code Handling...\n');
  
  try {
    // Test 1: Create a product with a specific code
    console.log('Test 1: Creating product with code "TEST-DUP-001"...');
    const { data: product1, error: error1 } = await supabase
      .from('products')
      .insert([{
        product_name: 'Test Product 1',
        product_code: 'TEST-DUP-001',
        main_group: 'General',
        unit: 'pcs',
        cost_price: 10.00,
        selling_price: 15.00,
        is_active: true
      }])
      .select('*')
      .single();
    
    if (error1) {
      console.error('❌ First product creation failed:', error1);
      return;
    }
    
    console.log('✅ First product created:', product1);
    
    // Test 2: Try to create another product with the same code
    console.log('\nTest 2: Trying to create duplicate product with same code...');
    const { data: product2, error: error2 } = await supabase
      .from('products')
      .insert([{
        product_name: 'Test Product 2',
        product_code: 'TEST-DUP-001', // Same code as first product
        main_group: 'General',
        unit: 'pcs',
        cost_price: 20.00,
        selling_price: 25.00,
        is_active: true
      }])
      .select('*')
      .single();
    
    if (error2) {
      console.log('✅ Duplicate detection working!');
      console.log('Error code:', error2.code);
      console.log('Error message:', error2.message);
      
      if (error2.code === '23505') {
        console.log('✅ Unique constraint violation detected correctly');
      }
    } else {
      console.log('❌ Duplicate was not prevented!');
      console.log('Second product created:', product2);
    }
    
    // Test 3: Create product with different code
    console.log('\nTest 3: Creating product with different code...');
    const { data: product3, error: error3 } = await supabase
      .from('products')
      .insert([{
        product_name: 'Test Product 3',
        product_code: 'TEST-DUP-002', // Different code
        main_group: 'General',
        unit: 'pcs',
        cost_price: 30.00,
        selling_price: 35.00,
        is_active: true
      }])
      .select('*')
      .single();
    
    if (error3) {
      console.error('❌ Third product creation failed:', error3);
    } else {
      console.log('✅ Third product created successfully:', product3);
    }
    
    // Clean up - delete test products
    console.log('\nCleaning up test products...');
    const deletePromises = [];
    
    if (product1) {
      deletePromises.push(supabase.from('products').delete().eq('id', product1.id));
    }
    if (product2) {
      deletePromises.push(supabase.from('products').delete().eq('id', product2.id));
    }
    if (product3) {
      deletePromises.push(supabase.from('products').delete().eq('id', product3.id));
    }
    
    await Promise.all(deletePromises);
    console.log('✅ Test products cleaned up');
    
    console.log('\n🎉 Duplicate handling test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDuplicateHandling();
