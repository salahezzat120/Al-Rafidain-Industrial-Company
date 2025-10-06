const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

async function setupReportsDatabase() {
  try {
    console.log('Setting up reports database tables...');
    
    // Read the SQL file
    const sql = fs.readFileSync('setup-complete-reports-database.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            console.warn(`Warning in statement ${i + 1}:`, error.message);
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`Error in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('Reports database setup completed!');
    
    // Test the setup by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'serial_numbers', 'aging_items', 'stock_analysis', 
        'valuation_items', 'expiry_tracking', 'issued_items',
        'product_monitoring', 'custom_reports'
      ]);
    
    if (tablesError) {
      console.warn('Could not verify table creation:', tablesError.message);
    } else {
      console.log('Created tables:', tables?.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('Error setting up reports database:', error);
  }
}

// Run the setup
setupReportsDatabase();

