import * as XLSX from 'xlsx'
import { Customer } from './customers'

// Export customers to Excel
export const exportCustomersToExcel = (customers: Customer[], filename?: string) => {
  try {
    console.log('📊 Exporting customers to Excel...')
    
    // Prepare data for export
    const exportData = customers.map(customer => ({
      'Customer ID': customer.customer_id,
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone,
      'Address': customer.address,
      'Status': customer.status,
      'Total Orders': customer.total_orders,
      'Total Spent': customer.total_spent,
      'Last Order Date': customer.last_order_date || 'Never',
      'Visit Status': customer.visit_status,
      'Last Visit Date': customer.last_visit_date || 'Never',
      'Visit Notes': customer.visit_notes || 'No visits',
      'Rating': customer.rating,
      'Join Date': customer.join_date,
      'Latitude': customer.latitude,
      'Longitude': customer.longitude,
      'Created At': customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '',
      'Updated At': customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : ''
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Auto-size columns
    const columnWidths = [
      { wch: 12 }, // Customer ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 10 }, // Status
      { wch: 12 }, // Total Orders
      { wch: 12 }, // Total Spent
      { wch: 15 }, // Last Order Date
      { wch: 12 }, // Visit Status
      { wch: 15 }, // Last Visit Date
      { wch: 20 }, // Visit Notes
      { wch: 8 },  // Rating
      { wch: 12 }, // Join Date
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 12 }, // Created At
      { wch: 12 }  // Updated At
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers')

    // Generate filename
    const defaultFilename = `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`
    const finalFilename = filename || defaultFilename

    // Save file
    XLSX.writeFile(workbook, finalFilename)
    
    console.log('✅ Customers exported to Excel successfully')
    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('❌ Error exporting customers to Excel:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Export customers with summary statistics
export const exportCustomersToExcelWithSummary = (customers: Customer[], filename?: string) => {
  try {
    console.log('📊 Exporting customers to Excel with summary...')
    
    // Calculate summary statistics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const vipCustomers = customers.filter(c => c.status === 'vip').length
    const inactiveCustomers = customers.filter(c => c.status === 'inactive').length
    const visitedCustomers = customers.filter(c => c.visit_status === 'visited').length
    const notVisitedCustomers = customers.filter(c => c.visit_status === 'not_visited').length
    const customersWithOrders = customers.filter(c => c.total_orders > 0).length
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
    const averageOrderValue = customersWithOrders > 0 ? totalRevenue / customersWithOrders : 0

    // Prepare summary data
    const summaryData = [
      { Metric: 'Total Customers', Value: totalCustomers },
      { Metric: 'Active Customers', Value: activeCustomers },
      { Metric: 'VIP Customers', Value: vipCustomers },
      { Metric: 'Inactive Customers', Value: inactiveCustomers },
      { Metric: 'Visited Customers', Value: visitedCustomers },
      { Metric: 'Not Visited Customers', Value: notVisitedCustomers },
      { Metric: 'Customers with Orders', Value: customersWithOrders },
      { Metric: 'Total Revenue', Value: totalRevenue },
      { Metric: 'Average Order Value', Value: averageOrderValue.toFixed(2) }
    ]

    // Prepare customer data
    const customerData = customers.map(customer => ({
      'Customer ID': customer.customer_id,
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone,
      'Address': customer.address,
      'Status': customer.status,
      'Total Orders': customer.total_orders,
      'Total Spent': customer.total_spent,
      'Last Order Date': customer.last_order_date || 'Never',
      'Visit Status': customer.visit_status,
      'Last Visit Date': customer.last_visit_date || 'Never',
      'Visit Notes': customer.visit_notes || 'No visits',
      'Rating': customer.rating,
      'Join Date': customer.join_date
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

    // Create customers worksheet
    const customersWorksheet = XLSX.utils.json_to_sheet(customerData)
    customersWorksheet['!cols'] = [
      { wch: 12 }, // Customer ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 10 }, // Status
      { wch: 12 }, // Total Orders
      { wch: 12 }, // Total Spent
      { wch: 15 }, // Last Order Date
      { wch: 12 }, // Visit Status
      { wch: 15 }, // Last Visit Date
      { wch: 20 }, // Visit Notes
      { wch: 8 },  // Rating
      { wch: 12 }  // Join Date
    ]
    XLSX.utils.book_append_sheet(workbook, customersWorksheet, 'Customers')

    // Generate filename
    const defaultFilename = `customers_with_summary_${new Date().toISOString().split('T')[0]}.xlsx`
    const finalFilename = filename || defaultFilename

    // Save file
    XLSX.writeFile(workbook, finalFilename)
    
    console.log('✅ Customers exported to Excel with summary successfully')
    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('❌ Error exporting customers to Excel with summary:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
