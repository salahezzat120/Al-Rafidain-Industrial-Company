// Test script to verify representative login
// Run this in browser console to test authentication

async function testRepresentativeLogin() {
  console.log('Testing representative login...');
  
  // Test the authentication function directly
  try {
    // Import the auth function (this might not work in console, but shows the logic)
    console.log('Testing with credentials:');
    console.log('Email: maged_gawish@yahoo.com');
    console.log('Representative ID: REP-716254');
    
    // Check if user is in localStorage
    const storedUser = localStorage.getItem("delivery-user");
    console.log('Stored user:', storedUser);
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('Current user:', user);
      console.log('User role:', user.role);
      console.log('Should show representative dashboard:', user.role === 'representative');
    } else {
      console.log('No user stored in localStorage');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testRepresentativeLogin();
