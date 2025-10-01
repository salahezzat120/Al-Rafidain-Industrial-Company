// Test script to verify products are being fetched correctly
// Run this with: node test-products-connection.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductsConnection() {
  try {
    console.log('🔍 Testing products connection...');
    
    // First, check if products table exists and has data
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Error fetching all products:', allError);
      return;
    }
    
    console.log('📊 Total products in table:', allProducts?.length || 0);
    console.log('📋 Sample products:', allProducts);
    
    // Test the delivery products query
    const { data: deliveryProducts, error: deliveryError } = await supabase
      .from('products')
      .select(`
        id,
        product_name,
        product_code,
        stock,
        main_group,
        selling_price,
        is_active
      `)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('product_name', { ascending: true });
    
    if (deliveryError) {
      console.error('❌ Error fetching delivery products:', deliveryError);
      return;
    }
    
    console.log('✅ Delivery products fetched:', deliveryProducts?.length || 0);
    console.log('📋 Delivery products:', deliveryProducts);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductsConnection();
