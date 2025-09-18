// Simple authentication fix
// This will help debug and fix the authentication issue

// Test the authentication logic step by step
function testAuthLogic() {
  console.log('=== TESTING AUTHENTICATION LOGIC ===');
  
  const email = 'maged_gawish@yahoo.com';
  const password = 'REP-716254';
  
  console.log('1. Input values:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  
  console.log('2. Checking if representative format:');
  const isRepresentative = password.startsWith('REP-') && password.length === 12;
  console.log('   Starts with REP-:', password.startsWith('REP-'));
  console.log('   Length is 12:', password.length === 12);
  console.log('   Is representative:', isRepresentative);
  
  if (isRepresentative) {
    console.log('3. Representative authentication logic:');
    console.log('   Query: SELECT * FROM users WHERE email = ? AND id = ? AND role = ?');
    console.log('   Values:', [email, password, 'representative']);
    
    // Simulate what should happen
    console.log('4. Expected result:');
    console.log('   Should find user with:');
    console.log('   - id: REP-716254');
    console.log('   - email: maged_gawish@yahoo.com');
    console.log('   - role: representative');
    console.log('   - password_hash: NULL');
  } else {
    console.log('3. Regular authentication logic (should not happen)');
  }
  
  console.log('=== END TEST ===');
}

// Run the test
testAuthLogic();
