// Fix Supabase Connection Script
// This script helps you set up the environment variables correctly

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing Supabase Connection...')

// Check if .env file exists
const envPath = path.join(__dirname, '.env')

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...')
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ullghcrmleaaualynomj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbGdoY3JtbGVhYXVhbHlub21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzA3OTEsImV4cCI6MjA3Mjc0Njc5MX0.gw-uw0WuqsK1JydwyoNGgufWgmj7SGuc62l9zU-RJ9g

# Application Configuration
NEXT_PUBLIC_APP_NAME="Al-Rafidain Warehouse System"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_DEFAULT_LANGUAGE="en"

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created')
} else {
  console.log('✅ .env file already exists')
}

// Test the environment variables
console.log('\n🔍 Testing environment variables...')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Environment variables are missing!')
  console.log('Please check your .env file and make sure it contains:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Test URL validity
try {
  new URL(supabaseUrl)
  console.log('✅ Supabase URL is valid')
} catch (error) {
  console.log('❌ Supabase URL is invalid:', supabaseUrl)
  console.log('URL must be a valid HTTPS URL (e.g., https://your-project.supabase.co)')
  process.exit(1)
}

console.log('\n🎉 Environment variables are configured correctly!')
console.log('\n📋 Next steps:')
console.log('1. Restart your development server (npm run dev)')
console.log('2. Run the database setup script in Supabase SQL Editor')
console.log('3. Test the connection with: node check-database-status.js')

console.log('\n🔗 Database Setup:')
console.log('1. Go to your Supabase Dashboard')
console.log('2. Open the SQL Editor')
console.log('3. Copy and paste the contents of create-single-visit-management-table.sql')
console.log('4. Click "Run" to execute the script')
