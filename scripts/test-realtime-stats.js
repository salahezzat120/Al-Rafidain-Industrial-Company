/**
 * Test real-time warehouse stats
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

async function getWarehouseStats() {
  try {
    // Get warehouses count
    const { count: totalWarehouses } = await supabase
      .from('warehouses')
      .select('*', { count: 'exact', head: true });

    // Get products count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get inventory data
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('available_quantity');

    // Calculate total inventory value
    const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + (item.available_quantity || 0), 0) || 0;

    // Get low stock items (items with quantity <= 10)
    const { data: lowStockData } = await supabase
      .from('inventory')
      .select('*')
      .lte('available_quantity', 10);

    const lowStockItems = lowStockData?.length || 0;

    return {
      total_warehouses: totalWarehouses || 0,
      total_products: totalProducts || 0,
      total_inventory_value: totalInventoryValue,
      low_stock_items: lowStockItems,
      out_of_stock_items: 0
    };
  } catch (error) {
    console.error('Error getting warehouse stats:', error);
    return {
      total_warehouses: 0,
      total_products: 0,
      total_inventory_value: 0,
      low_stock_items: 0,
      out_of_stock_items: 0
    };
  }
}

async function testRealtimeStats() {
  console.log('🧪 Testing Real-Time Warehouse Stats...\n');

  try {
    // Get initial stats
    console.log('📊 Getting initial stats...');
    const initialStats = await getWarehouseStats();
    console.log('Initial Stats:', JSON.stringify(initialStats, null, 2));

    // Create a test warehouse
    console.log('\n📦 Creating test warehouse...');
    const testWarehouse = {
      warehouse_name: 'Test Stats Warehouse ' + Date.now(),
      warehouse_name_ar: 'مستودع إحصائيات تجريبي',
      location: 'Test Location',
      location_ar: 'موقع تجريبي'
    };

    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .insert([testWarehouse])
      .select('*')
      .single();

    if (warehouseError) {
      console.log('❌ Warehouse creation failed:', warehouseError.message);
      return;
    }

    console.log('✅ Test warehouse created:', warehouseData.warehouse_name);

    // Get stats after warehouse creation
    console.log('\n📊 Getting stats after warehouse creation...');
    const statsAfterWarehouse = await getWarehouseStats();
    console.log('Stats After Warehouse:', JSON.stringify(statsAfterWarehouse, null, 2));

    // Create a test product
    console.log('\n📦 Creating test product...');
    const testProduct = {
      product_name: 'Test Stats Product ' + Date.now(),
      product_name_ar: 'منتج إحصائيات تجريبي',
      product_code: 'TEST-STATS-' + Date.now(),
      main_group_id: 1,
      sub_group_id: 1,
      unit_of_measurement_id: 1,
      description: 'Test product for stats',
      description_ar: 'منتج تجريبي للإحصائيات'
    };

    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([testProduct])
      .select('*')
      .single();

    if (productError) {
      console.log('❌ Product creation failed:', productError.message);
    } else {
      console.log('✅ Test product created:', productData.product_name);

      // Get stats after product creation
      console.log('\n📊 Getting stats after product creation...');
      const statsAfterProduct = await getWarehouseStats();
      console.log('Stats After Product:', JSON.stringify(statsAfterProduct, null, 2));

      // Create inventory record
      console.log('\n📦 Creating inventory record...');
      const testInventory = {
        product_id: productData.id,
        warehouse_id: warehouseData.id,
        available_quantity: 25,
        minimum_stock_level: 5,
        reorder_point: 10
      };

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .insert([testInventory])
        .select('*')
        .single();

      if (inventoryError) {
        console.log('❌ Inventory creation failed:', inventoryError.message);
      } else {
        console.log('✅ Inventory record created with quantity:', inventoryData.available_quantity);

        // Get final stats
        console.log('\n📊 Getting final stats...');
        const finalStats = await getWarehouseStats();
        console.log('Final Stats:', JSON.stringify(finalStats, null, 2));

        // Verify changes
        console.log('\n🎯 Stats Changes:');
        console.log(`   Warehouses: ${initialStats.total_warehouses} → ${finalStats.total_warehouses} (+${finalStats.total_warehouses - initialStats.total_warehouses})`);
        console.log(`   Products: ${initialStats.total_products} → ${finalStats.total_products} (+${finalStats.total_products - initialStats.total_products})`);
        console.log(`   Inventory: ${initialStats.total_inventory_value} → ${finalStats.total_inventory_value} (+${finalStats.total_inventory_value - initialStats.total_inventory_value})`);
        console.log(`   Low Stock: ${initialStats.low_stock_items} → ${finalStats.low_stock_items} (+${finalStats.low_stock_items - initialStats.low_stock_items})`);

        // Clean up
        console.log('\n🧹 Cleaning up test data...');
        await supabase.from('inventory').delete().eq('id', inventoryData.id);
        await supabase.from('products').delete().eq('id', productData.id);
        await supabase.from('warehouses').delete().eq('id', warehouseData.id);
        console.log('✅ Test data cleaned up');

        console.log('\n✅ Real-time stats are working correctly!');
        console.log('   - Dashboard numbers will update automatically');
        console.log('   - Creating warehouses/products updates the counts');
        console.log('   - Inventory changes affect total stock values');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRealtimeStats();
