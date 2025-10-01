// Test Supabase connection
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ullghcrmleaaualynomj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('❌ Auth test failed:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
    }
    
    // Test 2: Check if products table exists
    console.log('2. Testing products table access...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, product_name')
      .limit(1);
    
    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
      console.log('Error details:', productsError);
    } else {
      console.log('✅ Products table accessible');
      console.log('Sample data:', productsData);
    }
    
    // Test 3: Check related tables
    console.log('3. Testing related tables...');
    const tables = ['main_groups', 'sub_groups', 'colors', 'materials', 'units_of_measurement', 'warehouses'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} table error:`, error.message);
      } else {
        console.log(`✅ ${table} table accessible`);
      }
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testConnection();
