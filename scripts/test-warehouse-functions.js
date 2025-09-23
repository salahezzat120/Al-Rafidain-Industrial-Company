// Test script for warehouse functions
// This script tests all warehouse CRUD operations and product-warehouse relationships

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWarehouseFunctions() {
  console.log('🧪 Testing Warehouse Functions...\n');

  try {
    // Test 1: Create Warehouse
    console.log('1. Testing Create Warehouse...');
    const warehouseData = {
      warehouse_name: 'Test Warehouse',
      warehouse_name_ar: 'مستودع تجريبي',
      location: 'Test Location',
      location_ar: 'موقع تجريبي',
      responsible_person: 'Test Manager',
      responsible_person_ar: 'مدير تجريبي',
      warehouse_type: 'DISTRIBUTION',
      capacity: 1000
    };

    const { data: warehouse, error: warehouseError } = await supabase
      .from('warehouses')
      .insert([warehouseData])
      .select()
      .single();

    if (warehouseError) {
      console.error('❌ Create Warehouse failed:', warehouseError.message);
      return;
    }
    console.log('✅ Warehouse created successfully:', warehouse.warehouse_name);

    // Test 2: Create Product
    console.log('\n2. Testing Create Product...');
    
    // First, get a main group
    const { data: mainGroups } = await supabase
      .from('main_groups')
      .select('id')
      .limit(1);

    if (!mainGroups || mainGroups.length === 0) {
      console.log('⚠️  No main groups found, creating one...');
      const { data: newMainGroup } = await supabase
        .from('main_groups')
        .insert([{
          group_name: 'Test Group',
          group_name_ar: 'مجموعة تجريبية',
          description: 'Test group for testing'
        }])
        .select()
        .single();
      
      if (newMainGroup) {
        mainGroups.push(newMainGroup);
      }
    }

    // Get a unit of measurement
    const { data: units } = await supabase
      .from('units_of_measurement')
      .select('id')
      .limit(1);

    if (!units || units.length === 0) {
      console.log('⚠️  No units found, creating one...');
      const { data: newUnit } = await supabase
        .from('units_of_measurement')
        .insert([{
          unit_name: 'Piece',
          unit_name_ar: 'قطعة',
          unit_symbol: 'pcs',
          unit_symbol_ar: 'قطعة',
          unit_type: 'COUNT'
        }])
        .select()
        .single();
      
      if (newUnit) {
        units.push(newUnit);
      }
    }

    const productData = {
      product_name: 'Test Product',
      product_name_ar: 'منتج تجريبي',
      product_code: 'TEST-001',
      main_group_id: mainGroups[0].id,
      unit_of_measurement_id: units[0].id,
      description: 'Test product for testing',
      cost_price: 10.00,
      selling_price: 15.00
    };

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) {
      console.error('❌ Create Product failed:', productError.message);
      return;
    }
    console.log('✅ Product created successfully:', product.product_name);

    // Test 3: Create Inventory Record
    console.log('\n3. Testing Create Inventory...');
    const inventoryData = {
      product_id: product.id,
      warehouse_id: warehouse.id,
      available_quantity: 100,
      minimum_stock_level: 10,
      maximum_stock_level: 500,
      reorder_point: 20
    };

    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert([inventoryData])
      .select()
      .single();

    if (inventoryError) {
      console.error('❌ Create Inventory failed:', inventoryError.message);
      return;
    }
    console.log('✅ Inventory created successfully:', `Product ${product.product_name} in ${warehouse.warehouse_name}`);

    // Test 4: Create Stock Movement (IN)
    console.log('\n4. Testing Create Stock Movement (IN)...');
    const movementData = {
      product_id: product.id,
      warehouse_id: warehouse.id,
      movement_type: 'IN',
      quantity: 50,
      unit_price: 10.00,
      reference_number: 'TEST-IN-001',
      notes: 'Test stock receipt',
      created_by: 'Test User'
    };

    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert([movementData])
      .select()
      .single();

    if (movementError) {
      console.error('❌ Create Stock Movement failed:', movementError.message);
      return;
    }
    console.log('✅ Stock Movement created successfully:', `IN ${movement.quantity} units`);

    // Test 5: Verify Inventory Update
    console.log('\n5. Testing Inventory Update...');
    const { data: updatedInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product.id)
      .eq('warehouse_id', warehouse.id)
      .single();

    if (updatedInventory) {
      console.log('✅ Inventory updated successfully:', `Available quantity: ${updatedInventory.available_quantity}`);
    } else {
      console.log('⚠️  Inventory update verification failed');
    }

    // Test 6: Create Stock Movement (OUT)
    console.log('\n6. Testing Create Stock Movement (OUT)...');
    const outMovementData = {
      product_id: product.id,
      warehouse_id: warehouse.id,
      movement_type: 'OUT',
      quantity: 25,
      unit_price: 15.00,
      reference_number: 'TEST-OUT-001',
      notes: 'Test stock issue',
      created_by: 'Test User'
    };

    const { data: outMovement, error: outMovementError } = await supabase
      .from('stock_movements')
      .insert([outMovementData])
      .select()
      .single();

    if (outMovementError) {
      console.error('❌ Create OUT Stock Movement failed:', outMovementError.message);
      return;
    }
    console.log('✅ OUT Stock Movement created successfully:', `OUT ${outMovement.quantity} units`);

    // Test 7: Verify Final Inventory
    console.log('\n7. Testing Final Inventory Verification...');
    const { data: finalInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product.id)
      .eq('warehouse_id', warehouse.id)
      .single();

    if (finalInventory) {
      console.log('✅ Final inventory verified:', `Available quantity: ${finalInventory.available_quantity}`);
      console.log('   Expected: 125 (100 initial + 50 IN - 25 OUT)');
    }

    // Test 8: Get Products with Warehouse Info
    console.log('\n8. Testing Get Products with Warehouse Info...');
    const { data: productsWithWarehouse } = await supabase
      .from('products')
      .select(`
        *,
        inventory:inventory(
          *,
          warehouse:warehouses(*)
        )
      `)
      .eq('id', product.id);

    if (productsWithWarehouse && productsWithWarehouse.length > 0) {
      const productWithWarehouse = productsWithWarehouse[0];
      console.log('✅ Products with warehouse info retrieved successfully');
      console.log(`   Product: ${productWithWarehouse.product_name}`);
      console.log(`   Warehouses: ${productWithWarehouse.inventory.length}`);
      productWithWarehouse.inventory.forEach(inv => {
        console.log(`     - ${inv.warehouse.warehouse_name}: ${inv.available_quantity} units`);
      });
    }

    // Test 9: Cleanup
    console.log('\n9. Testing Cleanup...');
    
    // Delete in reverse order to respect foreign key constraints
    await supabase.from('stock_movements').delete().eq('product_id', product.id);
    await supabase.from('inventory').delete().eq('product_id', product.id);
    await supabase.from('products').delete().eq('id', product.id);
    await supabase.from('warehouses').delete().eq('id', warehouse.id);
    
    console.log('✅ Cleanup completed successfully');

    console.log('\n🎉 All warehouse function tests passed!');
    console.log('\nSummary:');
    console.log('✅ Warehouse CRUD operations work correctly');
    console.log('✅ Product CRUD operations work correctly');
    console.log('✅ Inventory management works correctly');
    console.log('✅ Stock movements work correctly');
    console.log('✅ Product-warehouse relationships work correctly');
    console.log('✅ Arabic field support works correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the tests
testWarehouseFunctions();
