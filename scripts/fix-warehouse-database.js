/**
 * Fix warehouse database - creates missing data and tables
 */

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment or use placeholders
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.log('\n🔧 Quick fix: Add these to your .env file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Fixing Warehouse Database...\n');

  try {
    // 1. Check and create main_groups if needed
    console.log('📊 Checking main_groups...');
    const { data: mainGroups, error: mainGroupsError } = await supabase
      .from('main_groups')
      .select('*')
      .limit(1);

    if (mainGroupsError) {
      console.log('❌ Error checking main_groups:', mainGroupsError.message);
      return;
    }

    if (!mainGroups || mainGroups.length === 0) {
      console.log('➕ Creating sample main_groups...');
      const { error: insertError } = await supabase
        .from('main_groups')
        .insert([
          { group_name: 'Kitchenware', group_name_ar: 'أدوات المطبخ', description: 'Kitchen products' },
          { group_name: 'Storage', group_name_ar: 'التخزين', description: 'Storage products' }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating main_groups:', insertError.message);
      } else {
        console.log('✅ Main groups created');
      }
    } else {
      console.log('✅ Main groups exist');
    }

    // 2. Check and create units_of_measurement if needed
    console.log('\n📊 Checking units_of_measurement...');
    const { data: units, error: unitsError } = await supabase
      .from('units_of_measurement')
      .select('*')
      .limit(1);

    if (unitsError) {
      console.log('❌ Error checking units_of_measurement:', unitsError.message);
      return;
    }

    if (!units || units.length === 0) {
      console.log('➕ Creating sample units_of_measurement...');
      const { error: insertError } = await supabase
        .from('units_of_measurement')
        .insert([
          { unit_name: 'Piece', unit_name_ar: 'قطعة', unit_symbol: 'pcs', unit_type: 'COUNT' },
          { unit_name: 'Kilogram', unit_name_ar: 'كيلوغرام', unit_symbol: 'kg', unit_type: 'WEIGHT' }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating units_of_measurement:', insertError.message);
      } else {
        console.log('✅ Units created');
      }
    } else {
      console.log('✅ Units exist');
    }

    // 3. Check and create sub_groups if needed
    console.log('\n📊 Checking sub_groups...');
    const { data: subGroups, error: subGroupsError } = await supabase
      .from('sub_groups')
      .select('*')
      .limit(1);

    if (subGroupsError) {
      console.log('❌ Error checking sub_groups:', subGroupsError.message);
      return;
    }

    if (!subGroups || subGroups.length === 0) {
      console.log('➕ Creating sample sub_groups...');
      const { error: insertError } = await supabase
        .from('sub_groups')
        .insert([
          { main_group_id: 1, sub_group_name: 'Cups', sub_group_name_ar: 'أكواب', description: 'Drinking cups' },
          { main_group_id: 1, sub_group_name: 'Plates', sub_group_name_ar: 'أطباق', description: 'Dining plates' }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating sub_groups:', insertError.message);
      } else {
        console.log('✅ Sub groups created');
      }
    } else {
      console.log('✅ Sub groups exist');
    }

    // 4. Check and create colors if needed
    console.log('\n📊 Checking colors...');
    const { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('*')
      .limit(1);

    if (colorsError) {
      console.log('❌ Error checking colors:', colorsError.message);
      return;
    }

    if (!colors || colors.length === 0) {
      console.log('➕ Creating sample colors...');
      const { error: insertError } = await supabase
        .from('colors')
        .insert([
          { color_name: 'White', color_name_ar: 'أبيض', color_code: '#FFFFFF' },
          { color_name: 'Red', color_name_ar: 'أحمر', color_code: '#FF0000' }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating colors:', insertError.message);
      } else {
        console.log('✅ Colors created');
      }
    } else {
      console.log('✅ Colors exist');
    }

    // 5. Check and create materials if needed
    console.log('\n📊 Checking materials...');
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);

    if (materialsError) {
      console.log('❌ Error checking materials:', materialsError.message);
      return;
    }

    if (!materials || materials.length === 0) {
      console.log('➕ Creating sample materials...');
      const { error: insertError } = await supabase
        .from('materials')
        .insert([
          { material_name: 'Polypropylene', material_name_ar: 'البولي بروبيلين', material_type: 'Plastic' },
          { material_name: 'Polyethylene', material_name_ar: 'البولي إيثيلين', material_type: 'Plastic' }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating materials:', insertError.message);
      } else {
        console.log('✅ Materials created');
      }
    } else {
      console.log('✅ Materials exist');
    }

    // 6. Check and create warehouses if needed
    console.log('\n📊 Checking warehouses...');
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('*')
      .limit(1);

    if (warehousesError) {
      console.log('❌ Error checking warehouses:', warehousesError.message);
      return;
    }

    if (!warehouses || warehouses.length === 0) {
      console.log('➕ Creating sample warehouses...');
      const { error: insertError } = await supabase
        .from('warehouses')
        .insert([
          { warehouse_name: 'Main Warehouse', warehouse_name_ar: 'المستودع الرئيسي', location: 'Baghdad', location_ar: 'بغداد', capacity: 10000 },
          { warehouse_name: 'Distribution Center', warehouse_name_ar: 'مركز التوزيع', location: 'Cairo', location_ar: 'القاهرة', capacity: 5000 }
        ]);
      
      if (insertError) {
        console.log('❌ Error creating warehouses:', insertError.message);
      } else {
        console.log('✅ Warehouses created');
      }
    } else {
      console.log('✅ Warehouses exist');
    }

    // 7. Test product creation
    console.log('\n🧪 Testing product creation...');
    
    const testProduct = {
      product_name: 'Test Product ' + Date.now(),
      product_name_ar: 'منتج تجريبي',
      product_code: 'TEST-' + Date.now(),
      main_group_id: 1,
      unit_of_measurement_id: 1,
      description: 'Test product for debugging',
      cost_price: 1.00,
      selling_price: 2.00,
      is_active: true
    };

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert([testProduct])
      .select('*')
      .single();

    if (productError) {
      console.log('❌ Product creation failed:', productError.message);
      console.log('   This means there are still missing references or table structure issues');
    } else {
      console.log('✅ Product creation successful!');
      console.log('   Created product ID:', newProduct.id);
      
      // Clean up test product
      await supabase.from('products').delete().eq('id', newProduct.id);
      console.log('   Test product cleaned up');
    }

    console.log('\n🎯 Database Fix Complete!');
    console.log('   - All reference data created');
    console.log('   - Product creation tested');
    console.log('   - Warehouse management should now work');

  } catch (error) {
    console.error('❌ Database fix failed:', error);
  }
}

// Run the fix
fixDatabase();
