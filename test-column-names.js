// Test script to verify the correct column names for products table
// This will help identify the actual column structure

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumnNames() {
  console.log('🔍 Testing Products Table Column Names...\n');
  
  try {
    // Test 1: Try with 'unit' column
    console.log('Test 1: Trying with "unit" column...');
    const testData1 = {
      product_name: 'Test Product 1',
      product_code: 'TEST001',
      main_group: 'General',
      unit: 'pcs',
      cost_price: 10.00,
      selling_price: 15.00,
      is_active: true
    };
    
    const { data: result1, error: error1 } = await supabase
      .from('products')
      .insert([testData1])
      .select('*')
      .single();
    
    if (error1) {
      console.log('❌ "unit" column failed:', error1.message);
      
      // Test 2: Try with 'unit_of_measurement' column
      console.log('\nTest 2: Trying with "unit_of_measurement" column...');
      const testData2 = {
        product_name: 'Test Product 2',
        product_code: 'TEST002',
        main_group: 'General',
        unit_of_measurement: 'pcs',
        cost_price: 10.00,
        selling_price: 15.00,
        is_active: true
      };
      
      const { data: result2, error: error2 } = await supabase
        .from('products')
        .insert([testData2])
        .select('*')
        .single();
      
      if (error2) {
        console.log('❌ "unit_of_measurement" column failed:', error2.message);
        
        // Test 3: Try with minimal data
        console.log('\nTest 3: Trying with minimal data...');
        const testData3 = {
          product_name: 'Test Product 3',
          product_code: 'TEST003',
          main_group: 'General',
          cost_price: 10.00,
          selling_price: 15.00,
          is_active: true
        };
        
        const { data: result3, error: error3 } = await supabase
          .from('products')
          .insert([testData3])
          .select('*')
          .single();
        
        if (error3) {
          console.log('❌ Minimal data failed:', error3.message);
          console.log('\n🔍 Please check your products table structure:');
          console.log('Run this SQL in your Supabase SQL editor:');
          console.log('SELECT column_name FROM information_schema.columns WHERE table_name = \'products\' ORDER BY ordinal_position;');
        } else {
          console.log('✅ Minimal data worked!');
          console.log('📦 Result:', result3);
          
          // Clean up
          await supabase.from('products').delete().eq('id', result3.id);
        }
      } else {
        console.log('✅ "unit_of_measurement" column worked!');
        console.log('📦 Result:', result2);
        
        // Clean up
        await supabase.from('products').delete().eq('id', result2.id);
      }
    } else {
      console.log('✅ "unit" column worked!');
      console.log('📦 Result:', result1);
      
      // Clean up
      await supabase.from('products').delete().eq('id', result1.id);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testColumnNames();
