// Debug script to test product loading
// Run this in your browser console when on the delivery task page

console.log('🔍 Starting product loading debug...');

// Test 1: Check if Supabase client is available
console.log('📡 Supabase client available:', typeof window.supabase !== 'undefined');

// Test 2: Try to fetch products directly
async function testProductFetch() {
  try {
    console.log('🔍 Testing direct product fetch...');
    
    // Get the Supabase client from the app
    const { createClient } = await import('@supabase/supabase-js');
    
    // You'll need to replace these with your actual credentials
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, product_name, product_code, stock, is_active')
      .limit(5);
    
    if (testError) {
      console.error('❌ Supabase connection error:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Products found:', testData?.length || 0);
    console.log('📋 Sample products:', testData);
    
    // Test the exact query used in the app
    const { data: deliveryData, error: deliveryError } = await supabase
      .from('products')
      .select(`
        id,
        product_name,
        product_name_ar,
        product_code,
        stock,
        main_group,
        sub_group,
        color,
        material,
        unit,
        description,
        cost_price,
        selling_price,
        weight,
        dimensions,
        warehouses,
        is_active
      `)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('product_name', { ascending: true });
    
    if (deliveryError) {
      console.error('❌ Delivery products query error:', deliveryError);
      return;
    }
    
    console.log('✅ Delivery products query successful');
    console.log('📊 Delivery products found:', deliveryData?.length || 0);
    console.log('📋 Delivery products:', deliveryData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductFetch();
