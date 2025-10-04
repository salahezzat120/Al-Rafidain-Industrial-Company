// Environment Setup Script
// This script helps you set up the environment variables

const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up environment variables...')

// Check if .env file exists
const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, 'env.example')

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists')
} else if (fs.existsSync(envExamplePath)) {
  console.log('📋 Copying env.example to .env...')
  fs.copyFileSync(envExamplePath, envPath)
  console.log('✅ .env file created from env.example')
} else {
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
  console.log('✅ .env file created with default values')
}

console.log('\n📋 Next steps:')
console.log('1. Edit the .env file with your actual Supabase credentials')
console.log('2. Get your credentials from: https://supabase.com/dashboard')
console.log('3. Restart your development server')
console.log('4. Run the database setup script in Supabase SQL Editor')

console.log('\n🔍 To test the connection, run:')
console.log('node check-database-status.js')
