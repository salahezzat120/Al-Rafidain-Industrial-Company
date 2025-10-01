// Quick fix for Supabase configuration
// This will help you get the correct credentials

console.log('🔧 Supabase Configuration Fix');
console.log('============================');

console.log('\n1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');

console.log('\n2. Select your project');

console.log('\n3. Go to Settings > API');

console.log('\n4. Copy these values:');
console.log('   - Project URL');
console.log('   - anon/public key');

console.log('\n5. Create/update .env.local file:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=your_project_url');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');

console.log('\n6. Restart your development server:');
console.log('   npm run dev');

console.log('\n7. Test the connection by trying to create a product');

console.log('\n⚠️  Current issue: 404 error means wrong URL or project not found');
console.log('✅ After fixing credentials, the "Database tables not found" error should disappear');
