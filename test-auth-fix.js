// Test the authentication fix
console.log('=== TESTING AUTHENTICATION FIX ===');

const password = 'REP-716254';
console.log('Password:', password);
console.log('Starts with REP-:', password.startsWith('REP-'));
console.log('Length:', password.length);
console.log('Length >= 10:', password.length >= 10);
console.log('Will use representative logic:', password.startsWith('REP-') && password.length >= 10);

console.log('=== EXPECTED RESULT ===');
console.log('Should now use: "Using representative authentication logic"');
console.log('Should look for: email + id + role=representative');
console.log('Should find user in database and authenticate successfully!');
