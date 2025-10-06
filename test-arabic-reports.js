const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Import the report generation function
const { generateReport } = require('./lib/warehouse');

async function testArabicReports() {
  console.log('🧪 Testing Arabic Reports Generation...\n');
  
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

  // Arabic headers for each report type
  const expectedArabicHeaders = {
    'COST_SALES': ['كود المنتج', 'اسم المنتج', 'سعر التكلفة', 'سعر البيع', 'هامش الربح %', 'مستوى المخزون'],
    'CONSIGNMENT': ['المنتج', 'المستودع', 'الكمية المتاحة', 'الحد الأدنى للمخزون', 'الحالة'],
    'DAMAGED': ['التاريخ', 'المنتج', 'المستودع', 'الكمية التالفة', 'السبب', 'القيمة'],
    'EXPIRY': ['المنتج', 'تاريخ الانتهاء', 'الأيام المتبقية', 'الكمية', 'الحالة'],
    'SERIAL_TRACKING': ['كود المنتج', 'اسم المنتج', 'الرقم التسلسلي', 'الحالة', 'تاريخ الإنشاء', 'الوصف'],
    'PRODUCT_CARD': ['كود المنتج', 'اسم المنتج', 'الوصف', 'الفئة', 'المخزون الحالي', 'آخر حركة'],
    'MONITORING_CARD': ['التاريخ', 'المنتج', 'المستودع', 'نوع الحركة', 'الكمية', 'المرجع'],
    'AGING': ['المنتج', 'المستودع', 'الكمية', 'الأيام في المخزون', 'فئة العمر', 'آخر حركة'],
    'STOCK_ANALYSIS': ['المنتج', 'تاريخ التحليل', 'إجمالي الداخل', 'إجمالي الخارج', 'الحركة الصافية', 'المخزون الحالي', 'معدل الدوران'],
    'VALUATION': ['المنتج', 'المستودع', 'الكمية', 'تكلفة الوحدة', 'القيمة الإجمالية', 'تاريخ التقييم'],
    'ISSUED_ITEMS': ['التاريخ', 'المنتج', 'المستودع', 'الكمية', 'صرف إلى', 'المرجع', 'ملاحظات'],
    'CUSTOM': [] // Custom reports will have dynamic headers
  };

  // Arabic titles for each report type
  const expectedArabicTitles = {
    'COST_SALES': 'تقرير التكلفة وسعر البيع',
    'CONSIGNMENT': 'تقرير مخزون الوكالة',
    'DAMAGED': 'تقرير البضائع التالفة',
    'EXPIRY': 'تقرير انتهاء الصلاحية',
    'SERIAL_TRACKING': 'تتبع الأرقام التسلسلية',
    'PRODUCT_CARD': 'بطاقة المنتج',
    'MONITORING_CARD': 'بطاقة مراقبة المنتج',
    'AGING': 'تقرير التقادم',
    'STOCK_ANALYSIS': 'تحليل المخزون',
    'VALUATION': 'تقرير التقييم',
    'ISSUED_ITEMS': 'تقرير العناصر المصروفة',
    'CUSTOM': 'تقرير مخصص'
  };

  for (const reportType of reportTypes) {
    try {
      console.log(`📊 Testing ${reportType} report in Arabic...`);
      
      const startTime = Date.now();
      const reportData = await generateReport(reportType, {});
      const endTime = Date.now();
      
      // Validate Arabic title
      const expectedTitle = expectedArabicTitles[reportType];
      if (reportData.title !== expectedTitle) {
        throw new Error(`Title mismatch. Expected: "${expectedTitle}", Got: "${reportData.title}"`);
      }
      
      // Validate Arabic headers (skip for custom reports)
      if (reportType !== 'CUSTOM' && expectedArabicHeaders[reportType]) {
        const expectedHeaders = expectedArabicHeaders[reportType];
        if (JSON.stringify(reportData.headers) !== JSON.stringify(expectedHeaders)) {
          throw new Error(`Headers mismatch. Expected: ${JSON.stringify(expectedHeaders)}, Got: ${JSON.stringify(reportData.headers)}`);
        }
      }
      
      // Check if headers contain Arabic text
      const hasArabicHeaders = reportData.headers.some(header => 
        /[\u0600-\u06FF]/.test(header)
      );
      
      if (!hasArabicHeaders) {
        throw new Error('Report headers do not contain Arabic text');
      }
      
      console.log(`✅ ${reportType} - Arabic report generated in ${endTime - startTime}ms`);
      console.log(`   Title: ${reportData.title}`);
      console.log(`   Headers: ${reportData.headers.join(', ')}`);
      console.log(`   Rows: ${reportData.rows.length}`);
      
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

  // Test custom report with Arabic configuration
  try {
    console.log('📊 Testing CUSTOM report with Arabic configuration...');
    
    const customConfig = {
      name: 'تقرير مخصص للاختبار',
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
    
    // Check if title is in Arabic
    if (!reportData.title.includes('تقرير')) {
      throw new Error('Custom report title is not in Arabic');
    }
    
    console.log(`✅ CUSTOM - Arabic custom report generated in ${endTime - startTime}ms`);
    console.log(`   Title: ${reportData.title}`);
    console.log(`   Headers: ${reportData.headers.join(', ')}`);
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
  console.log('\n📋 Arabic Reports Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(error => {
      console.log(`   ${error.reportType}: ${error.error}`);
    });
  }

  // Test Arabic text detection
  console.log('\n🔍 Testing Arabic Text Detection:');
  const arabicTextTests = [
    { text: 'تقرير التكلفة وسعر البيع', expected: true },
    { text: 'كود المنتج', expected: true },
    { text: 'متوفر', expected: true },
    { text: 'منتهي الصلاحية', expected: true },
    { text: 'Cost & Sales Report', expected: false },
    { text: 'Product Code', expected: false }
  ];

  arabicTextTests.forEach(test => {
    const hasArabic = /[\u0600-\u06FF]/.test(test.text);
    const result = hasArabic === test.expected ? '✅' : '❌';
    console.log(`   ${result} "${test.text}" - Arabic: ${hasArabic} (Expected: ${test.expected})`);
  });

  return results;
}

// Run the tests
testArabicReports()
  .then(results => {
    if (results.failed === 0) {
      console.log('\n🎉 All reports are generating in Arabic correctly!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some reports need attention for Arabic support.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Arabic reports test failed:', error);
    process.exit(1);
  });
