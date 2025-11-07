import * as XLSX from 'xlsx'
import type { Payment } from '@/types/payments'
import type { DeliveryTask } from '@/types/delivery-tasks'

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
}

export const exportPaymentsToExcel = (
  payments: Payment[],
  options: ExcelExportOptions = {}
): void => {
  try {
    const {
      filename = 'payments-export',
      sheetName = 'Payments',
      includeHeaders = true
    } = options

    // Prepare data for Excel
    const excelData = payments.map((payment, index) => ({
      'Row': index + 1,
      'Payment ID': payment.id,
      'Order ID': payment.order_id,
      'Amount': payment.amount,
      'Payment Method': payment.payment_method,
      'Status': payment.status,
      'Payment Date': new Date(payment.payment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      'Notes': payment.notes || '',
      'Created At': new Date(payment.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Updated At': new Date(payment.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // Row
      { wch: 15 },  // Payment ID
      { wch: 15 },  // Order ID
      { wch: 12 },  // Amount
      { wch: 15 },  // Payment Method
      { wch: 12 },  // Status
      { wch: 15 },  // Payment Date
      { wch: 30 },  // Notes
      { wch: 20 },  // Created At
      { wch: 20 }   // Updated At
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}-${timestamp}.xlsx`

    // Save file
    XLSX.writeFile(workbook, finalFilename)

    console.log(`✅ Excel file exported successfully: ${finalFilename}`)
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error)
    throw new Error('Failed to export payments to Excel')
  }
}

export const exportPaymentsToExcelWithSummary = (
  payments: Payment[],
  stats: {
    totalPayments: number
    totalAmount: number
    completedPayments: number
    pendingPayments: number
    failedPayments: number
    refundedPayments: number
    averagePaymentAmount: number
    completionRate: number
  },
  options: ExcelExportOptions = {}
): void => {
  try {
    const {
      filename = 'payments-export-with-summary',
      sheetName = 'Payments',
      includeHeaders = true
    } = options

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Payments Export Summary'],
      [''],
      ['Export Date:', new Date().toLocaleDateString('en-US')],
      ['Total Payments:', stats.totalPayments],
      ['Total Amount:', stats.totalAmount],
      ['Completed Payments:', stats.completedPayments],
      ['Pending Payments:', stats.pendingPayments],
      ['Failed Payments:', stats.failedPayments],
      ['Refunded Payments:', stats.refundedPayments],
      ['Average Payment Amount:', stats.averagePaymentAmount],
      ['Completion Rate:', `${stats.completionRate.toFixed(2)}%`],
      [''],
      ['Payment Details:']
    ]

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData)
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

    // Payments data
    const excelData = payments.map((payment, index) => ({
      'Row': index + 1,
      'Payment ID': payment.id,
      'Order ID': payment.order_id,
      'Amount': payment.amount,
      'Payment Method': payment.payment_method,
      'Status': payment.status,
      'Payment Date': new Date(payment.payment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      'Notes': payment.notes || '',
      'Created At': new Date(payment.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Updated At': new Date(payment.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    const paymentsWorksheet = XLSX.utils.json_to_sheet(excelData)
    paymentsWorksheet['!cols'] = [
      { wch: 5 },   // Row
      { wch: 15 },  // Payment ID
      { wch: 15 },  // Order ID
      { wch: 12 },  // Amount
      { wch: 15 },  // Payment Method
      { wch: 12 },  // Status
      { wch: 15 },  // Payment Date
      { wch: 30 },  // Notes
      { wch: 20 },  // Created At
      { wch: 20 }   // Updated At
    ]
    XLSX.utils.book_append_sheet(workbook, paymentsWorksheet, sheetName)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}-${timestamp}.xlsx`

    // Save file
    XLSX.writeFile(workbook, finalFilename)

    console.log(`✅ Excel file with summary exported successfully: ${finalFilename}`)
  } catch (error) {
    console.error('❌ Error exporting to Excel with summary:', error)
    throw new Error('Failed to export payments to Excel with summary')
  }
}

export const exportDeliveryTasksToExcel = (
  tasks: DeliveryTask[],
  options: ExcelExportOptions = {}
): void => {
  try {
    const {
      filename = 'delivery-tasks-export',
      sheetName = 'Delivery Tasks',
      includeHeaders = true
    } = options

    // Prepare data for Excel
    const excelData = tasks.map((task, index) => ({
      'Row': index + 1,
      'Task ID': task.task_id,
      'Title': task.title,
      'Description': task.description || '',
      'Customer Name': task.customer_name,
      'Customer Phone': task.customer_phone,
      'Customer Address': task.customer_address,
      'Representative Name': task.representative_name || '',
      'Status': task.status,
      'Priority': task.priority,
      'Estimated Duration': task.estimated_duration || '',
      'Scheduled For': task.scheduled_for ? new Date(task.scheduled_for).toLocaleDateString('en-US') : '',
      'Completed At': task.completed_at ? new Date(task.completed_at).toLocaleDateString('en-US') : '',
      'Total Value': task.total_value,
      'Currency': task.currency,
      'Notes': task.notes || '',
      'Created At': new Date(task.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Updated At': new Date(task.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // Row
      { wch: 15 },  // Task ID
      { wch: 25 },  // Title
      { wch: 30 },  // Description
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Customer Phone
      { wch: 30 },  // Customer Address
      { wch: 20 },  // Representative Name
      { wch: 12 },  // Status
      { wch: 10 },  // Priority
      { wch: 15 },  // Estimated Duration
      { wch: 15 },  // Scheduled For
      { wch: 15 },  // Completed At
      { wch: 12 },  // Total Value
      { wch: 8 },   // Currency
      { wch: 30 },  // Notes
      { wch: 20 },  // Created At
      { wch: 20 }   // Updated At
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}-${timestamp}.xlsx`

    // Save file
    XLSX.writeFile(workbook, finalFilename)

    console.log(`✅ Delivery tasks Excel file exported successfully: ${finalFilename}`)
  } catch (error) {
    console.error('❌ Error exporting delivery tasks to Excel:', error)
    throw new Error('Failed to export delivery tasks to Excel')
  }
}
