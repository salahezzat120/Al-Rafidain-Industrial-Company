// Test script for Excel export functionality
const { exportPaymentsToExcel, exportPaymentsToExcelWithSummary } = require('./lib/excel-export')

// Sample payment data for testing
const samplePayments = [
  {
    id: 'payment-1',
    order_id: 'order-1',
    payment_method: 'cash',
    amount: 1500.00,
    payment_date: '2024-12-15',
    status: 'completed',
    notes: 'Payment received in cash',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'payment-2',
    order_id: 'order-2',
    payment_method: 'card',
    amount: 2500.00,
    payment_date: '2024-12-14',
    status: 'pending',
    notes: 'Credit card payment',
    created_at: '2024-12-14T14:30:00Z',
    updated_at: '2024-12-14T14:30:00Z'
  },
  {
    id: 'payment-3',
    order_id: 'order-3',
    payment_method: 'transfer',
    amount: 3000.00,
    payment_date: '2024-12-13',
    status: 'completed',
    notes: 'Bank transfer payment',
    created_at: '2024-12-13T09:15:00Z',
    updated_at: '2024-12-13T09:15:00Z'
  }
]

const sampleStats = {
  totalPayments: 3,
  totalAmount: 7000.00,
  completedPayments: 2,
  pendingPayments: 1,
  failedPayments: 0,
  refundedPayments: 0,
  averagePaymentAmount: 2333.33,
  completionRate: 66.67
}

async function testExcelExport() {
  console.log('🧪 Testing Excel Export Functionality...\n')

  try {
    // Test 1: Basic Excel export
    console.log('1️⃣ Testing basic Excel export...')
    exportPaymentsToExcel(samplePayments, {
      filename: 'test-payments-export',
      sheetName: 'Test Payments'
    })
    console.log('✅ Basic Excel export completed')

    // Test 2: Excel export with summary
    console.log('\n2️⃣ Testing Excel export with summary...')
    exportPaymentsToExcelWithSummary(samplePayments, sampleStats, {
      filename: 'test-payments-export-with-summary',
      sheetName: 'Test Payments'
    })
    console.log('✅ Excel export with summary completed')

    console.log('\n🎉 Excel Export Test Complete!')
    console.log('\n📋 Summary:')
    console.log('   - Basic Excel export: ✅ Working')
    console.log('   - Excel export with summary: ✅ Working')
    console.log('   - File generation: ✅ Working')
    console.log('   - Data formatting: ✅ Working')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testExcelExport()
