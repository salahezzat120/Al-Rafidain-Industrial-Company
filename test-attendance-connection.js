// Test script to verify attendance functionality
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAttendanceConnection() {
  console.log('🔍 Testing attendance connection...');
  
  try {
    // Test 1: Check if representative_attendance table exists
    console.log('\n1. Testing representative_attendance table...');
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('representative_attendance')
      .select('*')
      .limit(5);
    
    if (attendanceError) {
      console.log('❌ representative_attendance table error:', attendanceError.message);
    } else {
      console.log('✅ representative_attendance table accessible');
      console.log('📊 Sample data:', attendanceData);
    }

    // Test 2: Check if representatives table exists
    console.log('\n2. Testing representatives table...');
    const { data: representativesData, error: representativesError } = await supabase
      .from('representatives')
      .select('id, name, phone')
      .limit(5);
    
    if (representativesError) {
      console.log('❌ representatives table error:', representativesError.message);
    } else {
      console.log('✅ representatives table accessible');
      console.log('📊 Sample data:', representativesData);
    }

    // Test 3: Test the join query
    console.log('\n3. Testing join query...');
    const { data: joinData, error: joinError } = await supabase
      .from('representative_attendance')
      .select(`
        *,
        representatives!representative_attendance_representative_id_fkey (name, phone)
      `)
      .limit(3);
    
    if (joinError) {
      console.log('❌ Join query error:', joinError.message);
    } else {
      console.log('✅ Join query successful');
      console.log('📊 Joined data:', joinData);
    }

    // Test 4: Test fallback approach
    console.log('\n4. Testing fallback approach...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('attendance')
      .select('*')
      .limit(3);
    
    if (fallbackError) {
      console.log('❌ Fallback attendance table error:', fallbackError.message);
    } else {
      console.log('✅ Fallback attendance table accessible');
      console.log('📊 Fallback data:', fallbackData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAttendanceConnection();
