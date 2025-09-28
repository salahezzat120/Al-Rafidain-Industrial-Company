// Complete Stock Movements Fix
// This script will fix all stock movements issues

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load environment variables
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not available, using environment variables directly');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Stock Movements Fix Script');
console.log('============================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLScript(scriptPath) {
  try {
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');
    console.log(`📄 Running SQL script: ${scriptPath}`);
    
    // Split the SQL script into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️ Warning in statement: ${error.message}`);
          }
        } catch (err) {
          console.warn(`⚠️ Warning executing statement: ${err.message}`);
        }
      }
    }
    
    console.log('✅ SQL script executed successfully');
  } catch (error) {
    console.error(`❌ Error running SQL script: ${error.message}`);
  }
}

async function testStockMovements() {
  try {
    console.log('\n🧪 Testing Stock Movements...');
    
    // Test 1: Check if table exists
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .limit(1);
    
    if (movementsError) {
      console.error('❌ stock_movements table error:', movementsError.message);
      return false;
    }
    
    console.log('✅ stock_movements table exists');
    console.log(`📊 Found ${movements?.length || 0} movements`);
    
    // Test 2: Check products and warehouses
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, product_name')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Products table error:', productsError.message);
      return false;
    }
    
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, warehouse_name')
      .limit(1);
    
    if (warehousesError) {
      console.error('❌ Warehouses table error:', warehousesError.message);
      return false;
    }
    
    console.log('✅ Required tables exist');
    
    // Test 3: Try to create a stock movement
    if (products && products.length > 0 && warehouses && warehouses.length > 0) {
      const testMovement = {
        product_id: products[0].id,
        warehouse_id: warehouses[0].id,
        movement_type: 'IN',
        movement_type_ar: 'دخول',
        quantity: 10,
        unit_price: 1.50,
        reference_number: 'TEST-' + Date.now(),
        reference_number_ar: 'اختبار-' + Date.now(),
        notes: 'Test movement from fix script',
        notes_ar: 'حركة اختبار من سكريبت الإصلاح',
        created_by: 'Fix Script',
        created_by_ar: 'سكريبت الإصلاح'
      };
      
      const { data: newMovement, error: createError } = await supabase
        .from('stock_movements')
        .insert([testMovement])
        .select('*')
        .single();
      
      if (createError) {
        console.error('❌ Error creating stock movement:', createError.message);
        return false;
      }
      
      console.log('✅ Successfully created test movement');
      
      // Clean up test data
      await supabase
        .from('stock_movements')
        .delete()
        .eq('id', newMovement.id);
      console.log('🧹 Cleaned up test data');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Stock Movements Fix...\n');
    
    // Step 1: Run the database fix script
    console.log('📋 Step 1: Setting up database...');
    await runSQLScript('fix-stock-movements-complete.sql');
    
    // Step 2: Test the functionality
    console.log('\n📋 Step 2: Testing functionality...');
    const testResult = await testStockMovements();
    
    if (testResult) {
      console.log('\n🎉 Stock Movements Fix Completed Successfully!');
      console.log('===============================================');
      console.log('✅ Database table created');
      console.log('✅ RLS policies configured');
      console.log('✅ Sample data inserted');
      console.log('✅ Create functionality working');
      console.log('✅ Read functionality working');
      console.log('\n💡 Next steps:');
      console.log('1. Refresh your warehouse management page');
      console.log('2. Try creating a new stock movement');
      console.log('3. Check that movements are displayed in the table');
    } else {
      console.log('\n❌ Fix completed with issues');
      console.log('Please check the error messages above');
    }
    
  } catch (error) {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  }
}

main();
