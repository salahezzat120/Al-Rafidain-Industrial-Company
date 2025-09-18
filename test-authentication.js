// Test script to debug authentication issues
// Run this in your browser console to test authentication

async function testAuth() {
  console.log('Testing authentication...');
  
  // Test admin login
  console.log('Testing admin login...');
  try {
    const response = await fetch('/api/test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'admin123'
      })
    });
    
    const result = await response.json();
    console.log('Admin auth result:', result);
  } catch (error) {
    console.error('Admin auth error:', error);
  }
  
  // Test representative login
  console.log('Testing representative login...');
  try {
    const response = await fetch('/api/test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ahmed.hassan@company.com',
        password: 'REP-12345678'
      })
    });
    
    const result = await response.json();
    console.log('Representative auth result:', result);
  } catch (error) {
    console.error('Representative auth error:', error);
  }
}

// Run the test
testAuth();
