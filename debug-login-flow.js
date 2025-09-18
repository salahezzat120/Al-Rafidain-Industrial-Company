// Debug script to check login flow
// Run this in browser console to debug the authentication

function debugLoginFlow() {
  console.log('=== DEBUGGING LOGIN FLOW ===');
  
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem('delivery-user');
  console.log('1. Stored user in localStorage:', storedUser);
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      console.log('2. Parsed user object:', user);
      console.log('3. User role:', user.role);
      console.log('4. Is representative?', user.role === 'representative');
      console.log('5. User name:', user.name);
      console.log('6. User email:', user.email);
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  } else {
    console.log('2. No user found in localStorage');
  }
  
  // Check current URL
  console.log('7. Current URL:', window.location.href);
  console.log('8. Should be on main page:', window.location.pathname === '/');
  
  // Check if we're on the login page
  const isOnLoginPage = window.location.pathname === '/' && document.querySelector('[data-testid="login-form"]') || 
                       document.querySelector('form') && document.querySelector('input[type="email"]');
  console.log('9. Still on login page?', isOnLoginPage);
  
  // Check for any error messages
  const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
  console.log('10. Error elements found:', errorElements.length);
  errorElements.forEach((el, index) => {
    console.log(`   Error ${index + 1}:`, el.textContent);
  });
  
  console.log('=== END DEBUG ===');
}

// Run the debug
debugLoginFlow();
