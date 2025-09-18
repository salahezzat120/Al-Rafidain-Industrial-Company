// Debug authentication function
// Add this to your browser console to test authentication step by step

async function debugAuth(email, password) {
  console.log('=== DEBUG AUTHENTICATION ===');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Password type:', typeof password);
  console.log('Password length:', password?.length);
  console.log('Starts with REP-:', password?.startsWith('REP-'));
  
  // Test the authentication logic
  const isRepresentative = password?.startsWith('REP-') && password?.length === 12;
  console.log('Is representative login:', isRepresentative);
  
  if (isRepresentative) {
    console.log('Using representative authentication logic');
    console.log('Looking for user with email:', email, 'and id:', password);
  } else {
    console.log('Using regular authentication logic');
    console.log('Looking for user with email:', email, 'and password_hash:', password);
  }
  
  // You can add actual Supabase query here if needed
  console.log('=== END DEBUG ===');
}

// Test different scenarios
debugAuth('admin@company.com', 'admin123');
debugAuth('ahmed.hassan@company.com', 'REP-12345678');
