/**
 * Quick database setup using SQL files
 * This script runs the SQL files directly in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQLFile(filePath) {
  try {
    console.log(`📄 Reading ${filePath}...`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
  }
}

async function setupDatabase() {
  console.log('🏭 Setting up Warehouse Database...\n');
  
  try {
    // Run the essential tables SQL file
    await runSQLFile('warehouse-essential-tables.sql');
    
    console.log('\n✅ Database setup completed!');
    console.log('You can now try creating products again.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy and paste the contents of warehouse-essential-tables.sql');
    console.log('4. Run the SQL');
  }
}

// Run the setup
setupDatabase();
