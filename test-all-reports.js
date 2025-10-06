const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Import the report generation function
const { generateReport } = require('./lib/warehouse');

async function testAllReports() {
  console.log('🧪 Testing all warehouse reports...\n');
  
  const reportTypes = [
    'COST_SALES',
    'CONSIGNMENT', 
    'DAMAGED',
    'EXPIRY',
    'SERIAL_TRACKING',
    'PRODUCT_CARD',
    'MONITORING_CARD',
    'AGING',
    'STOCK_ANALYSIS',
    'VALUATION',
    'ISSUED_ITEMS',
    'CUSTOM'
  ];

  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const reportType of reportTypes) {
    try {
      console.log(`📊 Testing ${reportType} report...`);
      
      const startTime = Date.now();
      const reportData = await generateReport(reportType, {});
      const endTime = Date.now();
      
      // Validate report structure
      if (!reportData || !reportData.title || !reportData.headers || !Array.isArray(reportData.rows)) {
        throw new Error('Invalid report structure');
      }
      
      console.log(`✅ ${reportType} - Generated in ${endTime - startTime}ms`);
      console.log(`   Title: ${reportData.title}`);
      console.log(`   Headers: ${reportData.headers.length}`);
      console.log(`   Rows: ${reportData.rows.length}`);
      console.log(`   Summary: ${JSON.stringify(reportData.summary || {})}`);
      
      results.passed++;
    } catch (error) {
      console.log(`❌ ${reportType} - Failed: ${error.message}`);
      results.failed++;
      results.errors.push({
        reportType,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }

  // Test custom report
  try {
    console.log('📊 Testing CUSTOM report with configuration...');
    
    const customConfig = {
      name: 'Test Custom Report',
      tables: ['products'],
      fields: {
        products: ['product_name', 'product_code', 'cost_price']
      },
      filters: [],
      sorting: []
    };
    
    const startTime = Date.now();
    const reportData = await generateReport('CUSTOM', customConfig);
    const endTime = Date.now();
    
    console.log(`✅ CUSTOM - Generated in ${endTime - startTime}ms`);
    console.log(`   Title: ${reportData.title}`);
    console.log(`   Headers: ${reportData.headers.length}`);
    console.log(`   Rows: ${reportData.rows.length}`);
    
    results.passed++;
  } catch (error) {
    console.log(`❌ CUSTOM - Failed: ${error.message}`);
    results.failed++;
    results.errors.push({
      reportType: 'CUSTOM',
      error: error.message
    });
  }

  // Print summary
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(error => {
      console.log(`   ${error.reportType}: ${error.error}`);
    });
  }

  // Test database connectivity
  console.log('\n🔗 Testing database connectivity...');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, product_name')
      .limit(1);
    
    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
    } else {
      console.log(`✅ Database connected - Found ${products?.length || 0} products`);
    }
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
  }

  return results;
}

// Run the tests
testAllReports()
  .then(results => {
    if (results.failed === 0) {
      console.log('\n🎉 All reports are working correctly!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some reports need attention.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });

