// Test script to check if permission system is working
// Run this in your browser console to debug the issue

async function testPermissionSystem() {
  console.log('Testing permission system...');
  
  try {
    // Test 1: Check if Supabase is connected
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
    
    // Test 2: Check if user_permissions table exists
    const { data: tableData, error: tableError } = await supabase
      .from('user_permissions')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing user_permissions table:', tableError);
      return;
    }
    
    console.log('user_permissions table accessible:', tableData);
    
    // Test 3: Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return;
    }
    
    console.log('Current user:', user);
    
    // Test 4: Check if user exists in users table
    if (user) {
      const { data: userData, error: userTableError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userTableError) {
        console.error('Error finding user in users table:', userTableError);
        return;
      }
      
      console.log('User found in users table:', userData);
      
      // Test 5: Check user permissions
      const { data: permissionData, error: permissionError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (permissionError) {
        console.error('Error fetching user permissions:', permissionError);
        return;
      }
      
      console.log('User permissions:', permissionData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testPermissionSystem();
