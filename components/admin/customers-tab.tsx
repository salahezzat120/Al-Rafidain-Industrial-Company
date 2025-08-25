"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Filter, 
  Download, 
  Star, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Navigation,
  Clock
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  status: 'active' | 'inactive' | 'vip'
  visit_status: 'visited' | 'not_visited' | 'scheduled'
  total_orders: number
  total_spent: number
  last_order_date?: string
  rating: number
  preferred_delivery_time?: string
  join_date: string
  notes: string
  visit_notes: string
  last_visit_date?: string
  created_at: string
  updated_at: string
}

export function CustomersTab() {
  const { t, isRTL } = useLanguage()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterVisitStatus, setFilterVisitStatus] = useState<string>("all")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // Form states
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Customer form data
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'active' as const,
    visit_status: 'not_visited' as const,
    preferred_delivery_time: '',
    notes: ''
  })

  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'active' as const,
    visit_status: 'not_visited' as const,
    preferred_delivery_time: '',
    notes: '',
    visit_notes: ''
  })

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading customers:', error)
        setMessage({ type: 'error', text: 'Failed to load customers' })
      } else {
        setCustomers(data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setMessage({ type: 'error', text: 'Failed to load customers' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setCreateLoading(true)
    setMessage(null)

    try {
      const customerData = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        latitude: newCustomer.latitude ? parseFloat(newCustomer.latitude) : null,
        longitude: newCustomer.longitude ? parseFloat(newCustomer.longitude) : null,
        status: newCustomer.status,
        visit_status: newCustomer.visit_status,
        preferred_delivery_time: newCustomer.preferred_delivery_time,
        notes: newCustomer.notes,
        total_orders: 0,
        total_spent: 0,
        rating: 0,
        join_date: new Date().toISOString().split('T')[0],
        visit_notes: ''
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()

      if (error) {
        console.error('Error creating customer:', error)
        setMessage({ type: 'error', text: 'Failed to create customer. Email might already exist.' })
      } else {
        setMessage({ type: 'success', text: 'Customer created successfully!' })
        setNewCustomer({
          name: '', email: '', phone: '', address: '', latitude: '', longitude: '',
          status: 'active', visit_status: 'not_visited', preferred_delivery_time: '', notes: ''
        })
        setIsCreateModalOpen(false)
        loadCustomers()
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      setMessage({ type: 'error', text: 'Failed to create customer' })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || '',
      status: customer.status,
      visit_status: customer.visit_status,
      preferred_delivery_time: customer.preferred_delivery_time || '',
      notes: customer.notes,
      visit_notes: customer.visit_notes
    })
    setIsEditModalOpen(true)
    setMessage(null)
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer || !editCustomer.name || !editCustomer.email || !editCustomer.phone || !editCustomer.address) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setEditLoading(true)
    setMessage(null)

    try {
      const updateData = {
        name: editCustomer.name,
        email: editCustomer.email,
        phone: editCustomer.phone,
        address: editCustomer.address,
        latitude: editCustomer.latitude ? parseFloat(editCustomer.latitude) : null,
        longitude: editCustomer.longitude ? parseFloat(editCustomer.longitude) : null,
        status: editCustomer.status,
        visit_status: editCustomer.visit_status,
        preferred_delivery_time: editCustomer.preferred_delivery_time,
        notes: editCustomer.notes,
        visit_notes: editCustomer.visit_notes,
        last_visit_date: editCustomer.visit_status === 'visited' ? new Date().toISOString().split('T')[0] : selectedCustomer.last_visit_date,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', selectedCustomer.id)

      if (error) {
        console.error('Error updating customer:', error)
        setMessage({ type: 'error', text: 'Failed to update customer' })
      } else {
        setMessage({ type: 'success', text: 'Customer updated successfully!' })
        setIsEditModalOpen(false)
        setSelectedCustomer(null)
        loadCustomers()
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      setMessage({ type: 'error', text: 'Failed to update customer' })
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    setDeleteLoading(customerId)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        console.error('Error deleting customer:', error)
        setMessage({ type: 'error', text: 'Failed to delete customer' })
      } else {
        setMessage({ type: 'success', text: 'Customer deleted successfully!' })
        loadCustomers()
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      setMessage({ type: 'error', text: 'Failed to delete customer' })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleUpdateVisitStatus = async (customerId: string, visitStatus: Customer['visit_status'], visitNotes: string = '') => {
    try {
      const updateData = {
        visit_status: visitStatus,
        visit_notes: visitNotes,
        last_visit_date: visitStatus === 'visited' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)

      if (error) {
        console.error('Error updating visit status:', error)
        setMessage({ type: 'error', text: 'Failed to update visit status' })
      } else {
        setMessage({ type: 'success', text: 'Visit status updated successfully!' })
        loadCustomers()
      }
    } catch (error) {
      console.error('Error updating visit status:', error)
      setMessage({ type: 'error', text: 'Failed to update visit status' })
    }
  }

  const openNotesModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsNotesModalOpen(true)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCustomer(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          setMessage({ type: 'success', text: 'Location captured successfully!' })
        },
        (error) => {
          console.error('Error getting location:', error)
          setMessage({ type: 'error', text: 'Failed to get current location' })
        }
      )
    } else {
      setMessage({ type: 'error', text: 'Geolocation is not supported by this browser' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVisitStatusColor = (visitStatus: string) => {
    switch (visitStatus) {
      case 'visited':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'not_visited':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVisitStatusIcon = (visitStatus: string) => {
    switch (visitStatus) {
      case 'visited':
        return <CheckCircle className="h-4 w-4" />
      case 'not_visited':
        return <XCircle className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
    const matchesVisitStatus = filterVisitStatus === 'all' || customer.visit_status === filterVisitStatus
    
    return matchesSearch && matchesStatus && matchesVisitStatus
  })

  const getCustomerStats = () => {
    const active = customers.filter(c => c.status === 'active').length
    const vip = customers.filter(c => c.status === 'vip').length
    const visited = customers.filter(c => c.visit_status === 'visited').length
    const notVisited = customers.filter(c => c.visit_status === 'not_visited').length
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)

    return { active, vip, visited, notVisited, totalRevenue }
  }

  const stats = getCustomerStats()

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600 mt-1">Manage customer relationships and visit tracking</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
          </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer with location and visit tracking
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newCustomer.status} onValueChange={(value) => setNewCustomer({ ...newCustomer, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter customer address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <div className="flex space-x-2">
                  <Input
                    id="latitude"
                    placeholder="e.g., 31.2001"
                    value={newCustomer.latitude}
                    onChange={(e) => setNewCustomer({ ...newCustomer, latitude: e.target.value })}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                    <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g., 29.9187"
                  value={newCustomer.longitude}
                  onChange={(e) => setNewCustomer({ ...newCustomer, longitude: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit_status">Visit Status</Label>
                <Select value={newCustomer.visit_status} onValueChange={(value) => setNewCustomer({ ...newCustomer, visit_status: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_visited">Not Visited</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="visited">Visited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_delivery_time">Preferred Delivery Time</Label>
                <Input
                  id="preferred_delivery_time"
                  placeholder="e.g., Morning (9-12 PM)"
                  value={newCustomer.preferred_delivery_time}
                  onChange={(e) => setNewCustomer({ ...newCustomer, preferred_delivery_time: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the customer"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                />
              </div>
            </div>

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setNewCustomer({
                    name: '', email: '', phone: '', address: '', latitude: '', longitude: '',
                    status: 'active', visit_status: 'not_visited', preferred_delivery_time: '', notes: ''
                  })
                  setMessage(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleCreateCustomer}
                disabled={createLoading}
              >
                {createLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Customer'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success/Error Message */}
      {message && !isCreateModalOpen && !isEditModalOpen && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">VIP Customers</p>
                <p className="text-xl font-bold">{stats.vip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visited</p>
                <p className="text-xl font-bold">{stats.visited}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Not Visited</p>
                <p className="text-xl font-bold">{stats.notVisited}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVisitStatus} onValueChange={setFilterVisitStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visit Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visits</SelectItem>
                <SelectItem value="visited">Visited</SelectItem>
                <SelectItem value="not_visited">Not Visited</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500">Create your first customer to get started.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-user.jpg" alt={customer.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                            <Badge variant="outline" className={getStatusColor(customer.status)}>
                              {customer.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getVisitStatusColor(customer.visit_status)}>
                              <div className="flex items-center space-x-1">
                                {getVisitStatusIcon(customer.visit_status)}
                                <span>{customer.visit_status.replace('_', ' ').toUpperCase()}</span>
                              </div>
                            </Badge>
                  </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                    </div>
                            <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{customer.address}</span>
                    </div>
                  </div>

                          {(customer.latitude && customer.longitude) && (
                            <div className="mt-2 text-xs text-gray-500">
                              GPS: {customer.latitude}, {customer.longitude}
                    </div>
                          )}
                          
                          {customer.last_visit_date && (
                            <div className="mt-1 text-xs text-gray-500">
                              Last visit: {new Date(customer.last_visit_date).toLocaleDateString()}
                  </div>
                          )}
                    </div>
                  </div>

                      <div className="flex items-center space-x-2">
                        {customer.visit_notes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openNotesModal(customer)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openNotesModal(customer)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateVisitStatus(customer.id, 'visited')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Mark Visited
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateVisitStatus(customer.id, 'not_visited')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Mark Not Visited
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Customer
                        </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the customer <strong>{customer.name}</strong> and remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteLoading === customer.id}
                                  >
                                    {deleteLoading === customer.id ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                      </div>
                                    ) : (
                                      'Delete Customer'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                  </CardContent>
                </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and visit status
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter customer name"
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editCustomer.email}
                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editCustomer.status} onValueChange={(value) => setEditCustomer({ ...editCustomer, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                placeholder="Enter customer address"
                value={editCustomer.address}
                onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-latitude">Latitude</Label>
              <Input
                id="edit-latitude"
                placeholder="e.g., 31.2001"
                value={editCustomer.latitude}
                onChange={(e) => setEditCustomer({ ...editCustomer, latitude: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-longitude">Longitude</Label>
              <Input
                id="edit-longitude"
                placeholder="e.g., 29.9187"
                value={editCustomer.longitude}
                onChange={(e) => setEditCustomer({ ...editCustomer, longitude: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-visit-status">Visit Status</Label>
              <Select value={editCustomer.visit_status} onValueChange={(value) => setEditCustomer({ ...editCustomer, visit_status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_visited">Not Visited</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="visited">Visited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-preferred-delivery-time">Preferred Delivery Time</Label>
              <Input
                id="edit-preferred-delivery-time"
                placeholder="e.g., Morning (9-12 PM)"
                value={editCustomer.preferred_delivery_time}
                onChange={(e) => setEditCustomer({ ...editCustomer, preferred_delivery_time: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-notes">Customer Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Add any notes about the customer"
                value={editCustomer.notes}
                onChange={(e) => setEditCustomer({ ...editCustomer, notes: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-visit-notes">Visit Notes</Label>
              <Textarea
                id="edit-visit-notes"
                placeholder="Add notes about customer visits"
                value={editCustomer.visit_notes}
                onChange={(e) => setEditCustomer({ ...editCustomer, visit_notes: e.target.value })}
              />
            </div>
          </div>

          {message && isEditModalOpen && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedCustomer(null)
                setMessage(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={handleUpdateCustomer}
              disabled={editLoading}
            >
              {editLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Customer'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Notes</DialogTitle>
            <DialogDescription>
              View customer and visit notes for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Customer Notes:</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {selectedCustomer?.notes || 'No customer notes available.'}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Visit Notes:</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {selectedCustomer?.visit_notes || 'No visit notes available.'}
                </p>
              </div>
            </div>
            
            {selectedCustomer?.last_visit_date && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Last Visit:</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedCustomer.last_visit_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => setIsNotesModalOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}