// Fix Supabase credentials and connection
// Run this to test and fix the connection

const { createClient } = require('@supabase/supabase-js');

// Current credentials from your code
const currentUrl = 'https://ullghcrmleaaualynomj.supabase.co';
const currentKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g';

console.log('🔍 Testing current Supabase credentials...');
console.log('URL:', currentUrl);
console.log('Key (first 20 chars):', currentKey.substring(0, 20) + '...');

const supabase = createClient(currentUrl, currentKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('🔧 This means your Supabase URL or API key is incorrect');
      console.log('\n📋 To fix this:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Go to Settings > API');
      console.log('3. Copy the correct URL and anon key');
      console.log('4. Update your .env.local file');
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    console.log('\n2. Testing database access...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database access failed:', testError.message);
      console.log('🔧 This means the tables might not exist or RLS is blocking access');
    } else {
      console.log('✅ Database access successful');
    }
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }
}

testConnection();
