// Quick script to check database status
// Run this to see if the visit_management table exists and has data

const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Database Status...')
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing Supabase configuration!')
  console.log('Please check your .env file for:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  try {
    console.log('\n📊 Checking visit_management table...')
    
    const { data, error } = await supabase
      .from('visit_management')
      .select('*')
      .limit(10)
    
    if (error) {
      console.log('❌ Database Error:', error.message)
      
      if (error.message?.includes('relation "visit_management" does not exist')) {
        console.log('\n💡 SOLUTION:')
        console.log('1. Go to your Supabase Dashboard')
        console.log('2. Open the SQL Editor')
        console.log('3. Copy and paste the contents of create-single-visit-management-table.sql')
        console.log('4. Run the script')
        console.log('5. Refresh your application')
        return false
      }
      
      return false
    }
    
    console.log('✅ Table exists!')
    console.log(`📋 Found ${data?.length || 0} records`)
    
    if (data && data.length > 0) {
      console.log('\n📝 Sample records:')
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.visit_id} - ${record.customer_name} (${record.status})`)
      })
    } else {
      console.log('\n📝 Table is empty. You can add sample data by running the database setup script.')
    }
    
    return true
    
  } catch (error) {
    console.log('❌ Error:', error.message)
    return false
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database is ready! Your app should now read real data.')
  } else {
    console.log('\n❌ Database setup needed. Please run the SQL script first.')
  }
})
