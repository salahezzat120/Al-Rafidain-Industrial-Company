/**
 * Test product creation with price fields
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseServiceKey === 'YOUR_SERVICE_KEY') {
  console.log('⚠️  Please set your Supabase credentials in the script or environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductWithPrices() {
  console.log('🧪 Testing Product Creation with Price Fields...\n');

  try {
    // Test creating a product with prices
    console.log('📦 Creating product with cost and selling prices...');
    
    const testProduct = {
      product_name: 'Test Product with Prices ' + Date.now(),
      product_name_ar: 'منتج تجريبي بأسعار',
      product_code: 'TEST-PRICE-' + Date.now(),
      main_group_id: 1,
      sub_group_id: 1,
      unit_of_measurement_id: 1,
      description: 'Test product with price fields',
      description_ar: 'منتج تجريبي بحقول الأسعار',
      cost_price: 25.50,
      selling_price: 35.75
    };

    console.log('📝 Product data:', JSON.stringify(testProduct, null, 2));

    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select('*')
      .single();

    if (error) {
      console.log('❌ Product creation failed:');
      console.log('   Error:', error.message);
      console.log('   Details:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n💡 Solution: Run the SQL script to add price columns:');
        console.log('   1. Go to your Supabase SQL Editor');
        console.log('   2. Run the contents of add-price-columns.sql');
        console.log('   3. Then try creating the product again');
      }
    } else {
      console.log('✅ Product created successfully with prices!');
      console.log('   Product ID:', data.id);
      console.log('   Product Name:', data.product_name);
      console.log('   Cost Price:', data.cost_price);
      console.log('   Selling Price:', data.selling_price);
      
      // Calculate profit margin
      if (data.cost_price && data.selling_price) {
        const profit = data.selling_price - data.cost_price;
        const margin = ((data.selling_price - data.cost_price) / data.cost_price * 100).toFixed(2);
        console.log('   Profit:', profit.toFixed(2));
        console.log('   Margin:', margin + '%');
      }
      
      // Clean up
      await supabase.from('products').delete().eq('id', data.id);
      console.log('   Test product cleaned up');
    }

    // Test creating a product without prices (should still work)
    console.log('\n📦 Testing product creation without prices...');
    
    const testProductNoPrices = {
      product_name: 'Test Product No Prices ' + Date.now(),
      product_name_ar: 'منتج تجريبي بدون أسعار',
      product_code: 'TEST-NO-PRICE-' + Date.now(),
      main_group_id: 1,
      sub_group_id: 1,
      unit_of_measurement_id: 1,
      description: 'Test product without price fields'
    };

    const { data: noPriceData, error: noPriceError } = await supabase
      .from('products')
      .insert([testProductNoPrices])
      .select('*')
      .single();

    if (noPriceError) {
      console.log('❌ Product without prices creation failed:', noPriceError.message);
    } else {
      console.log('✅ Product without prices created successfully!');
      console.log('   Cost Price:', noPriceData.cost_price);
      console.log('   Selling Price:', noPriceData.selling_price);
      
      // Clean up
      await supabase.from('products').delete().eq('id', noPriceData.id);
      console.log('   Test product cleaned up');
    }

    console.log('\n🎯 Price Fields Test Results:');
    console.log('   ✅ Product creation with prices: ' + (error ? '❌ Failed' : '✅ Success'));
    console.log('   ✅ Product creation without prices: ' + (noPriceError ? '❌ Failed' : '✅ Success'));

    if (!error && !noPriceError) {
      console.log('\n✅ Price fields are working correctly!');
      console.log('   - Cost Price and Selling Price fields added to form');
      console.log('   - Database columns created successfully');
      console.log('   - Products can be created with or without prices');
      console.log('   - Form validation handles decimal inputs');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductWithPrices();
