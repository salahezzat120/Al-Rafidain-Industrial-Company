"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Package, Filter, Download, Star, Navigation, CheckCircle, XCircle, Calendar, Loader2, FileText, FileSpreadsheet, Eye, MessageSquare, History, Trash2, Edit, UserCheck, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomerProfileModal } from "./customer-profile-modal"
import { AddCustomerModal } from "./add-customer-modal-new"
import { LocationDisplay, LocationCard } from "@/components/ui/location-display"
import { useLanguage } from "@/contexts/language-context"
import { getCustomers, Customer } from "@/lib/customers"
import { useToast } from "@/hooks/use-toast"
import { exportCustomersToExcel, exportCustomersToExcelWithSummary } from "@/lib/customer-excel-export"

export default function CustomersTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [visitStatusFilter, setVisitStatusFilter] = useState<string>("all")
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { t, isRTL } = useLanguage()
  const { toast } = useToast()

  // Fetch customers from Supabase
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await getCustomers()
      
      if (error) {
        setError(error)
        console.error('Error fetching customers:', error)
      } else if (data) {
        setCustomers(data)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Show toast notifications for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: `Failed to load customers: ${error}`,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "vip":
        return "bg-purple-100 text-purple-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisitStatusColor = (visitStatus: string) => {
    switch (visitStatus) {
      case "visited":
        return "bg-green-100 text-green-800"
      case "not_visited":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisitStatusIcon = (visitStatus: string) => {
    switch (visitStatus) {
      case "visited":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "not_visited":
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return <XCircle className="h-3 w-3 text-gray-600" />
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter

      // Visit status filter
      const matchesVisitStatus = visitStatusFilter === "all" || customer.visit_status === visitStatusFilter

      // Order filter
      let matchesOrder = true
      if (orderFilter !== "all") {
        switch (orderFilter) {
          case "has_orders":
            matchesOrder = customer.total_orders > 0
            break
          case "no_orders":
            matchesOrder = customer.total_orders === 0
            break
          case "high_value":
            matchesOrder = customer.total_spent > 100
            break
          case "low_value":
            matchesOrder = customer.total_spent <= 100 && customer.total_spent > 0
            break
        }
      }

      return matchesSearch && matchesStatus && matchesVisitStatus && matchesOrder
    })
  }, [customers, searchTerm, statusFilter, visitStatusFilter, orderFilter])

  const handleViewProfile = useCallback((customer: any) => {
    setSelectedCustomer(customer)
    setIsProfileModalOpen(true)
  }, [])

  const handleSaveCustomer = useCallback(async (updatedCustomer: Customer) => {
    try {
      // Update the customer in the local state
      setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
      setIsProfileModalOpen(false)
      
      toast({
        title: "Success",
        description: "Customer updated successfully!",
      })
    } catch (err) {
      console.error('Error updating customer:', err)
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleAddCustomer = useCallback(async (newCustomer: any) => {
    try {
      // Refresh customers from Supabase after adding a new one
      const { data, error } = await getCustomers()
      
      if (error) {
        console.error('Error refreshing customers:', error)
        toast({
          title: "Warning",
          description: "Customer added but failed to refresh the list. Please refresh the page.",
          variant: "destructive",
        })
        // Add the customer to local state as fallback
        setCustomers(prev => [...prev, newCustomer])
      } else if (data) {
        setCustomers(data)
        toast({
          title: "Success",
          description: "Customer added successfully!",
        })
      }
      
      setIsAddModalOpen(false)
    } catch (err) {
      console.error('Error refreshing customers:', err)
      // Still add the customer to local state as fallback
      setCustomers(prev => [...prev, newCustomer])
      setIsAddModalOpen(false)
    }
  }, [toast])

  // Excel export handlers
  const handleExportToExcel = useCallback(() => {
    try {
      const result = exportCustomersToExcel(filteredCustomers)
      if (result.success) {
        toast({
          title: "Success",
          description: `Customers exported to ${result.filename}`,
        })
      } else {
        toast({
          title: "Error",
          description: `Export failed: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast({
        title: "Error",
        description: "Failed to export customers. Please try again.",
        variant: "destructive",
      })
    }
  }, [filteredCustomers, toast])

  const handleExportToExcelWithSummary = useCallback(() => {
    try {
      const result = exportCustomersToExcelWithSummary(filteredCustomers)
      if (result.success) {
        toast({
          title: "Success",
          description: `Customers exported with summary to ${result.filename}`,
        })
      } else {
        toast({
          title: "Error",
          description: `Export failed: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error exporting to Excel with summary:', error)
      toast({
        title: "Error",
        description: "Failed to export customers. Please try again.",
        variant: "destructive",
      })
    }
  }, [filteredCustomers, toast])

  // Clear filters
  const clearFilters = useCallback(() => {
    setStatusFilter("all")
    setVisitStatusFilter("all")
    setOrderFilter("all")
    setSearchTerm("")
    setIsFilterOpen(false)
  }, [])

  const stats = useMemo(() => {
    const active = customers.filter((c) => c.status === "active").length
    const vip = customers.filter((c) => c.status === "vip").length
    const inactive = customers.filter((c) => c.status === "inactive").length
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)

    return { active, vip, inactive, totalRevenue }
  }, [customers])

  // Export functions
  const exportToCSV = useCallback(() => {
    const headers = [
      'Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 
      'Total Orders', 'Total Spent', 'Rating', 'Last Order Date',
      'Latitude', 'Longitude', 'Visit Status', 'Last Visit Date', 'Visit Notes'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.customer_id,
        `"${customer.name}"`,
        customer.email,
        customer.phone,
        `"${customer.address}"`,
        customer.status,
        customer.total_orders,
        customer.total_spent,
        customer.rating,
        customer.last_order_date || '',
        customer.latitude || '',
        customer.longitude || '',
        customer.visit_status,
        customer.last_visit_date || '',
        `"${customer.visit_notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Export Successful",
      description: "Customer data exported to CSV file",
    })
  }, [filteredCustomers, toast])

  const exportToExcel = useCallback(() => {
    // For Excel export, we'll create a simple HTML table that can be opened in Excel
    const tableHeaders = [
      'Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 
      'Total Orders', 'Total Spent', 'Rating', 'Last Order Date',
      'Latitude', 'Longitude', 'Visit Status', 'Last Visit Date', 'Visit Notes'
    ]
    
    const tableRows = filteredCustomers.map(customer => [
      customer.customer_id,
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.status,
      customer.total_orders,
      customer.total_spent,
      customer.rating,
      customer.last_order_date || '',
      customer.latitude || '',
      customer.longitude || '',
      customer.visit_status,
      customer.last_visit_date || '',
      customer.visit_notes || ''
    ])

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${tableHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Export Successful",
      description: "Customer data exported to Excel file",
    })
  }, [filteredCustomers, toast])

  const exportToPDF = useCallback(() => {
    // Simple PDF export using browser's print functionality
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableHeaders = [
        'Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 
        'Total Orders', 'Total Spent', 'Rating', 'Last Order Date',
        'Latitude', 'Longitude', 'Visit Status', 'Last Visit Date', 'Visit Notes'
      ]
      
      const tableRows = filteredCustomers.map(customer => [
        customer.customer_id,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.status,
        customer.total_orders,
        customer.total_spent,
        customer.rating,
        customer.last_order_date || '',
        customer.latitude || '',
        customer.longitude || '',
        customer.visit_status,
        customer.last_visit_date || '',
        customer.visit_notes || ''
      ])

      printWindow.document.write(`
        <html>
          <head>
            <title>Customer Export - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Customer Management Export</h1>
            <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Customers:</strong> ${filteredCustomers.length}</p>
            <table>
              <thead>
                <tr>${tableHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      
      toast({
        title: "Export Successful",
        description: "Customer data exported to PDF",
      })
    }
  }, [filteredCustomers, toast])

  // Customer action handlers
  const handleMarkAsVisited = useCallback((customer: Customer) => {
    // TODO: Implement mark as visited functionality
    toast({
      title: "Feature Coming Soon",
      description: "Mark as visited functionality will be implemented soon",
    })
  }, [toast])

  const handleScheduleVisit = useCallback((customer: Customer) => {
    // TODO: Implement schedule visit functionality
    toast({
      title: "Feature Coming Soon",
      description: "Schedule visit functionality will be implemented soon",
    })
  }, [toast])

  const handleViewOnMap = useCallback((customer: Customer) => {
    if (customer.latitude && customer.longitude) {
      const mapUrl = `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`
      window.open(mapUrl, '_blank')
    } else {
      toast({
        title: "No Location Data",
        description: "This customer doesn't have GPS coordinates",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleSendMessage = useCallback((customer: Customer) => {
    // TODO: Implement send message functionality
    toast({
      title: "Feature Coming Soon",
      description: "Send message functionality will be implemented soon",
    })
  }, [toast])

  const handleCreateOrder = useCallback((customer: Customer) => {
    // TODO: Implement create order functionality
    toast({
      title: "Feature Coming Soon",
      description: "Create order functionality will be implemented soon",
    })
  }, [toast])

  const handleViewHistory = useCallback((customer: Customer) => {
    // TODO: Implement view history functionality
    toast({
      title: "Feature Coming Soon",
      description: "View history functionality will be implemented soon",
    })
  }, [toast])

  const handleDeactivateCustomer = useCallback((customer: Customer) => {
    // TODO: Implement deactivate customer functionality
    toast({
      title: "Feature Coming Soon",
      description: "Deactivate customer functionality will be implemented soon",
    })
  }, [toast])

  const handleEditProfile = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    setIsProfileModalOpen(true)
  }, [])

  const handleDeleteCustomer = useCallback(async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      try {
        // TODO: Implement actual delete functionality with Supabase
        toast({
          title: "Feature Coming Soon",
          description: "Delete customer functionality will be implemented soon",
        })
      } catch (err) {
        console.error('Error deleting customer:', err)
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  // Stable callback function to close the AddCustomerModal
  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false)
  }, [])

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900">{t("customerManagement")}</h2>
          <p className="text-gray-600">{t("manageCustomerRelationships")}</p>
        </div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                {t("export")}
                <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV} className={isRTL ? 'flex-row-reverse' : ''}>
                Export as CSV
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportToExcel} className={isRTL ? 'flex-row-reverse' : ''}>
                Export as Excel
                <FileSpreadsheet className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportToExcelWithSummary} className={isRTL ? 'flex-row-reverse' : ''}>
                Export as Excel (with Summary)
                <FileSpreadsheet className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className={isRTL ? 'flex-row-reverse' : ''}>
                Export as PDF
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddModalOpen(true)} className={isRTL ? 'flex-row-reverse' : ''}>
            {t("add")} Customer
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t("activeCustomers")}</p>
                <p className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{stats.active}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t("vipCustomers")}</p>
                <p className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{stats.vip}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t("totalRevenue")}</p>
                <p className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalRevenue)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t("inactive")}</p>
                <p className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{stats.inactive}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
              <Input
                placeholder={t("searchCustomers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                  {t("filter")}
                  <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="visit-status-filter">Visit Status</Label>
                      <Select value={visitStatusFilter} onValueChange={setVisitStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Visit Status</SelectItem>
                          <SelectItem value="visited">Visited</SelectItem>
                          <SelectItem value="not_visited">Not Visited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="order-filter">Orders</Label>
                      <Select value={orderFilter} onValueChange={setOrderFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="has_orders">Has Orders</SelectItem>
                          <SelectItem value="no_orders">No Orders</SelectItem>
                          <SelectItem value="high_value">High Value (>$100)</SelectItem>
                          <SelectItem value="low_value">Low Value (≤$100)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading customers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error loading customers: {error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
              <div key={customer.id} className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={customer.avatar_url || customer.avatar || "/placeholder.svg"} alt={customer.name} />
                  <AvatarFallback>
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">ID: {customer.customer_id}</p>
                  </div>

                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className={`flex items-center gap-1 text-sm text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {customer.email}
                      <Mail className="h-3 w-3" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {customer.phone}
                      <Phone className="h-3 w-3" />
                    </div>
                  </div>

                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className={`flex items-center gap-1 text-sm text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="truncate">{customer.address.split(",")[0]}</span>
                      <MapPin className="h-3 w-3" />
                    </div>
                    <Badge className={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                  </div>

                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium">{customer.total_orders} orders</p>
                    <p className="text-sm text-gray-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(customer.total_spent)}</p>
                  </div>

                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className={`flex items-center gap-1 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-medium">
                        {customer.visit_status === "visited" ? "Visited" : "Not Visited"}
                      </span>
                      {getVisitStatusIcon(customer.visit_status)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        {customer.last_visit_date ? `Last: ${customer.last_visit_date}` : "No visits yet"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.visit_notes || "No visit details"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <LocationDisplay
                      latitude={customer.latitude}
                      longitude={customer.longitude}
                      address={customer.address}
                      className="mb-2"
                    />
                  </div>

                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className={`flex items-center gap-1 text-sm text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs">
                        {customer.last_visit_date ? customer.last_visit_date : "No visits"}
                      </span>
                      <Calendar className="h-3 w-3" />
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]" title={customer.visit_notes}>
                      {customer.visit_notes ? customer.visit_notes : "No notes"}
                    </p>
                  </div>

                  <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEditProfile(customer)} className={isRTL ? 'flex-row-reverse' : ''}>
                          Edit Profile
                          <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={`text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={() => handleDeleteCustomer(customer)}>
                          Delete Customer
                          <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        customerId={selectedCustomer?.id || ''}
        customerName={selectedCustomer?.name || ''}
        customerEmail={selectedCustomer?.email || ''}
        customerPhone={selectedCustomer?.phone || ''}
      />

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onAdd={handleAddCustomer} 
      />
    </div>
  )
}
