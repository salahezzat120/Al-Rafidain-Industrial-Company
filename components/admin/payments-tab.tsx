'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  FileText,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import type { Payment, PaymentStats, PaymentFilters } from '@/types/payments'
import { 
  getPayments, 
  getPaymentStats, 
  deletePayment, 
  markPaymentAsCompleted,
  generatePaymentId 
} from '@/lib/payments'
import AddPaymentModal from './add-payment-modal'
import PaymentDetailsModal from './payment-details-modal'

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const filters: PaymentFilters = {}
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus
      }
      if (selectedMethod !== 'all') {
        filters.payment_method = selectedMethod
      }

      const { data, error } = await getPayments(filters)
      if (error) {
        toast.error(`Failed to load payments: ${error}`)
        return
      }

      setPayments(data || [])
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data, error } = await getPaymentStats()
      if (error) {
        console.error('Failed to load stats:', error)
        return
      }
      setStats(data)
    } catch (err) {
      console.error('Unexpected error loading stats:', err)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [selectedStatus, selectedMethod])

  const filteredPayments = payments.filter(payment =>
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'refunded': return <TrendingDown className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'transfer': return <TrendingUp className="h-4 w-4" />
      case 'check': return <FileText className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const handleAddPayment = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev])
    loadStats()
    toast.success('Payment added successfully!')
  }

  const handleUpdatePayment = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p))
    loadStats()
    toast.success('Payment updated successfully!')
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { error } = await deletePayment(paymentId)
      if (error) {
        toast.error(`Failed to delete payment: ${error}`)
        return
      }

      setPayments(prev => prev.filter(p => p.id !== paymentId))
      loadStats()
      toast.success('Payment deleted successfully!')
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleMarkAsCompleted = async (paymentId: string) => {
    try {
      const { data, error } = await markPaymentAsCompleted(paymentId)
      if (error) {
        toast.error(`Failed to mark payment as completed: ${error}`)
        return
      }

      if (data) {
        handleUpdatePayment(data)
        toast.success('Payment marked as completed!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and record all client payments with real-time visibility
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalAmount)} total amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completionRate.toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.averagePaymentAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per payment
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>

            <Button variant="outline" onClick={() => {/* Export functionality */}}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{payment.order_id}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getMethodIcon(payment.payment_method)}
                        <span className="capitalize">{payment.payment_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedPayment(payment)
                            setShowDetailsModal(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPayment(payment)
                            setShowDetailsModal(true)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Payment
                          </DropdownMenuItem>
                          {payment.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleMarkAsCompleted(payment.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddPaymentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={handleAddPayment}
      />

      {selectedPayment && (
        <PaymentDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          payment={selectedPayment}
          onUpdate={handleUpdatePayment}
        />
      )}
    </div>
  )
}
