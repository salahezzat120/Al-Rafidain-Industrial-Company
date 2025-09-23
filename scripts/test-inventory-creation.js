/**
 * Test inventory creation to verify it works
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

async function testInventoryCreation() {
  console.log('🧪 Testing Inventory Creation...\n');

  try {
    // Check if inventory table exists
    console.log('📊 Checking inventory table...');
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);

    if (inventoryError) {
      console.log('❌ Inventory table error:', inventoryError.message);
      console.log('   Please run the create-inventory-table.sql script first');
      return;
    }

    console.log('✅ Inventory table exists');

    // Check if we have products and warehouses
    console.log('\n📊 Checking products and warehouses...');
    const { data: products } = await supabase.from('products').select('*').limit(1);
    const { data: warehouses } = await supabase.from('warehouses').select('*').limit(1);

    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }

    if (!warehouses || warehouses.length === 0) {
      console.log('❌ No warehouses found');
      return;
    }

    console.log(`✅ Found ${products.length} products and ${warehouses.length} warehouses`);

    // Test creating inventory record
    console.log('\n🧪 Testing inventory creation...');
    
    const testInventory = {
      product_id: products[0].id,
      warehouse_id: warehouses[0].id,
      available_quantity: 100,
      minimum_stock_level: 10,
      reorder_point: 20
    };

    console.log('📝 Inventory data:', JSON.stringify(testInventory, null, 2));

    const { data: newInventory, error: createError } = await supabase
      .from('inventory')
      .insert([testInventory])
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `)
      .single();

    if (createError) {
      console.log('❌ Inventory creation failed:', createError.message);
      console.log('   Details:', JSON.stringify(createError, null, 2));
    } else {
      console.log('✅ Inventory creation successful!');
      console.log('   Created inventory:', JSON.stringify(newInventory, null, 2));
      
      // Clean up
      await supabase.from('inventory').delete().eq('id', newInventory.id);
      console.log('   Test inventory cleaned up');
    }

    // Test the getProductsWithWarehouseInfo function
    console.log('\n🧪 Testing products with warehouse info...');
    
    const { data: productsWithInfo, error: infoError } = await supabase
      .from('products')
      .select(`
        *,
        main_group:main_groups(*),
        sub_group:sub_groups(*),
        color:colors(*),
        material:materials(*),
        unit_of_measurement:units_of_measurement(*),
        inventory:inventory(
          *,
          warehouse:warehouses(*)
        )
      `)
      .order('product_name');

    if (infoError) {
      console.log('❌ Products with warehouse info failed:', infoError.message);
    } else {
      console.log('✅ Products with warehouse info successful');
      console.log(`   Found ${productsWithInfo?.length || 0} products`);
      
      if (productsWithInfo && productsWithInfo.length > 0) {
        const product = productsWithInfo[0];
        console.log('   Sample product inventory:', product.inventory?.length || 0, 'records');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testInventoryCreation();
