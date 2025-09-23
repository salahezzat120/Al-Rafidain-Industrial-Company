/**
 * Debug script to check why inventory isn't showing
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

async function debugInventoryIssue() {
  console.log('🔍 Debugging Inventory Issue...\n');

  try {
    // 1. Check if inventory table exists and has data
    console.log('📊 Checking inventory table...');
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `);

    if (inventoryError) {
      console.log('❌ Inventory table error:', inventoryError.message);
      return;
    }

    console.log(`✅ Inventory table exists with ${inventoryData?.length || 0} records`);
    
    if (inventoryData && inventoryData.length > 0) {
      console.log('📋 Sample inventory records:');
      inventoryData.slice(0, 3).forEach(inv => {
        console.log(`   - Product: ${inv.product?.product_name} | Warehouse: ${inv.warehouse?.warehouse_name} | Qty: ${inv.available_quantity}`);
      });
    } else {
      console.log('⚠️  No inventory records found');
    }

    // 2. Check products
    console.log('\n📊 Checking products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.log('❌ Products error:', productsError.message);
      return;
    }

    console.log(`✅ Found ${products?.length || 0} products`);
    
    if (products && products.length > 0) {
      console.log('📋 Sample products:');
      products.slice(0, 3).forEach(product => {
        console.log(`   - ${product.product_name} (ID: ${product.id})`);
      });
    }

    // 3. Check warehouses
    console.log('\n📊 Checking warehouses...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*');

    if (warehousesError) {
      console.log('❌ Warehouses error:', warehousesError.message);
      return;
    }

    console.log(`✅ Found ${warehouses?.length || 0} warehouses`);
    
    if (warehouses && warehouses.length > 0) {
      console.log('📋 Sample warehouses:');
      warehouses.slice(0, 3).forEach(warehouse => {
        console.log(`   - ${warehouse.warehouse_name} (ID: ${warehouse.id})`);
      });
    }

    // 4. Test the exact query used in the admin panel
    console.log('\n🧪 Testing products with inventory query...');
    const { data: productsWithInventory, error: queryError } = await supabase
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

    if (queryError) {
      console.log('❌ Products with inventory query failed:', queryError.message);
    } else {
      console.log('✅ Products with inventory query successful');
      console.log(`   Found ${productsWithInventory?.length || 0} products`);
      
      if (productsWithInventory && productsWithInventory.length > 0) {
        console.log('📋 Sample product with inventory:');
        const product = productsWithInventory[0];
        console.log(`   Product: ${product.product_name}`);
        console.log(`   Inventory records: ${product.inventory?.length || 0}`);
        
        if (product.inventory && product.inventory.length > 0) {
          product.inventory.forEach(inv => {
            console.log(`     - Warehouse: ${inv.warehouse?.warehouse_name} | Qty: ${inv.available_quantity}`);
          });
        } else {
          console.log('     - No inventory records for this product');
        }
      }
    }

    // 5. If no inventory records exist, create some
    if (!inventoryData || inventoryData.length === 0) {
      console.log('\n🔧 Creating sample inventory records...');
      
      if (products && products.length > 0 && warehouses && warehouses.length > 0) {
        const sampleInventory = {
          product_id: products[0].id,
          warehouse_id: warehouses[0].id,
          available_quantity: 100,
          minimum_stock_level: 10,
          reorder_point: 20
        };

        const { data: newInventory, error: createError } = await supabase
          .from('inventory')
          .insert([sampleInventory])
          .select(`
            *,
            product:products(*),
            warehouse:warehouses(*)
          `)
          .single();

        if (createError) {
          console.log('❌ Failed to create sample inventory:', createError.message);
        } else {
          console.log('✅ Sample inventory created successfully');
          console.log(`   Product: ${newInventory.product?.product_name}`);
          console.log(`   Warehouse: ${newInventory.warehouse?.warehouse_name}`);
          console.log(`   Quantity: ${newInventory.available_quantity}`);
        }
      } else {
        console.log('❌ Cannot create sample inventory - missing products or warehouses');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugInventoryIssue();
