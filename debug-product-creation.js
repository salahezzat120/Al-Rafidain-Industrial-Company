// Debug script to test product creation with minimal data
// This will help identify the exact issue

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProductCreation() {
  console.log('🔍 Debugging Product Creation...\n');
  
  try {
    // Test with minimal required data only
    console.log('Test 1: Minimal required data...');
    const minimalData = {
      product_name: 'Debug Test Product',
      main_group: 'General',
      unit: 'pcs',
      cost_price: 10.00,
      selling_price: 15.00,
      is_active: true
    };
    
    console.log('Data to insert:', minimalData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([minimalData])
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Minimal data failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Try with even more minimal data
      console.log('\nTest 2: Even more minimal data...');
      const superMinimalData = {
        product_name: 'Super Minimal Test',
        main_group: 'General',
        is_active: true
      };
      
      console.log('Super minimal data:', superMinimalData);
      
      const { data: data2, error: error2 } = await supabase
        .from('products')
        .insert([superMinimalData])
        .select('*')
        .single();
      
      if (error2) {
        console.error('❌ Super minimal data also failed:');
        console.error('Error:', error2);
      } else {
        console.log('✅ Super minimal data worked!');
        console.log('Result:', data2);
        
        // Clean up
        await supabase.from('products').delete().eq('id', data2.id);
      }
    } else {
      console.log('✅ Minimal data worked!');
      console.log('Result:', data);
      
      // Clean up
      await supabase.from('products').delete().eq('id', data.id);
    }
    
    // Test with all fields like the form would send
    console.log('\nTest 3: Full form data...');
    const fullFormData = {
      product_name: 'Full Form Test Product',
      product_name_ar: 'منتج تجريبي كامل',
      product_code: 'FFT001',
      barcode: '1234567890123',
      stock_number: 'ST001',
      stock_number_ar: 'مخ001',
      stock: 0,
      main_group: 'General',
      sub_group: '',
      color: '',
      material: '',
      unit: 'pcs',
      description: 'Full form test product',
      description_ar: 'منتج تجريبي كامل',
      cost_price: 25.00,
      selling_price: 35.00,
      weight: 2.5,
      dimensions: '10x20x30 cm',
      expiry_date: '2025-12-31',
      serial_number: 'SN123456789',
      warehouse: 'Test Warehouse',
      specifications: { material: 'Test', color: 'Blue' },
      is_active: true
    };
    
    console.log('Full form data:', fullFormData);
    
    const { data: fullData, error: fullError } = await supabase
      .from('products')
      .insert([fullFormData])
      .select('*')
      .single();
    
    if (fullError) {
      console.error('❌ Full form data failed:');
      console.error('Error:', fullError);
    } else {
      console.log('✅ Full form data worked!');
      console.log('Result:', fullData);
      
      // Clean up
      await supabase.from('products').delete().eq('id', fullData.id);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed with error:', error);
  }
}

// Run the debug test
debugProductCreation();
