'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  Loader2,
  User,
  FileText,
  Building,
  CheckCircle,
  Edit,
  Save,
  X,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Payment, UpdatePaymentData, PaymentInstallment, PaymentMethod } from '@/types/payments'
import { 
  updatePayment, 
  getInstallmentsByPaymentId, 
  getPaymentMethodsByPaymentId,
  markPaymentAsPaid 
} from '@/lib/payments'

interface PaymentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  onUpdate: (payment: Payment) => void
}

export default function PaymentDetailsModal({ open, onOpenChange, payment, onUpdate }: PaymentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [installments, setInstallments] = useState<PaymentInstallment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingInstallments, setLoadingInstallments] = useState(false)

  const [editedPayment, setEditedPayment] = useState<Payment>(payment)

  useEffect(() => {
    setEditedPayment(payment)
    if (open) {
      loadInstallments()
      loadPaymentMethods()
    }
  }, [payment, open])

  const loadInstallments = async () => {
    try {
      setLoadingInstallments(true)
      const { data, error } = await getInstallmentsByPaymentId(payment.id)
      if (error) {
        console.error('Error loading installments:', error)
        return
      }
      setInstallments(data || [])
    } catch (err) {
      console.error('Unexpected error loading installments:', err)
    } finally {
      setLoadingInstallments(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await getPaymentMethodsByPaymentId(payment.id)
      if (error) {
        console.error('Error loading payment methods:', error)
        return
      }
      setPaymentMethods(data || [])
    } catch (err) {
      console.error('Unexpected error loading payment methods:', err)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!editedPayment.payment_id.trim()) newErrors.payment_id = 'Payment ID is required'
    if (!editedPayment.customer_id.trim()) newErrors.customer_id = 'Customer ID is required'
    if (!editedPayment.amount || editedPayment.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!editedPayment.due_amount || editedPayment.due_amount <= 0) newErrors.due_amount = 'Due amount must be greater than 0'
    if (!editedPayment.due_date) newErrors.due_date = 'Due date is required'
    if (editedPayment.paid_amount < 0) newErrors.paid_amount = 'Paid amount cannot be negative'
    if (editedPayment.paid_amount > editedPayment.due_amount) newErrors.paid_amount = 'Paid amount cannot exceed due amount'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const updates: UpdatePaymentData = {
        id: editedPayment.id,
        payment_id: editedPayment.payment_id,
        customer_id: editedPayment.customer_id,
        order_id: editedPayment.order_id,
        amount: editedPayment.amount,
        due_amount: editedPayment.due_amount,
        paid_amount: editedPayment.paid_amount,
        payment_method: editedPayment.payment_method,
        due_date: editedPayment.due_date,
        collection_date: editedPayment.collection_date,
        payment_reference: editedPayment.payment_reference,
        notes: editedPayment.notes
      }

      const { data: updatedPayment, error } = await updatePayment(editedPayment.id, updates)
      if (error) {
        toast.error(`Failed to update payment: ${error}`)
        return
      }

      if (updatedPayment) {
        onUpdate(updatedPayment)
        setIsEditing(false)
        toast.success('Payment updated successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      const { data, error } = await markPaymentAsPaid(editedPayment.id, editedPayment.due_amount)
      if (error) {
        toast.error(`Failed to mark payment as paid: ${error}`)
        return
      }

      if (data) {
        onUpdate(data)
        toast.success('Payment marked as paid!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleAmountChange = (field: 'amount' | 'due_amount' | 'paid_amount', value: string) => {
    const numValue = value ? Number(value) : 0
    setEditedPayment(prev => ({ ...prev, [field]: numValue }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'partial': return <TrendingUp className="h-4 w-4" />
      case 'overdue': return <AlertTriangle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'paid'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            View and manage payment information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Payment Details</TabsTrigger>
            <TabsTrigger value="installments">Installments</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(editedPayment.payment_status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(editedPayment.payment_status)}
                    <span className="capitalize">{editedPayment.payment_status}</span>
                  </div>
                </Badge>
                {isOverdue(editedPayment.due_date, editedPayment.payment_status) && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {editedPayment.payment_status !== 'paid' && (
                      <Button onClick={handleMarkAsPaid}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_id">Payment ID</Label>
                    <Input
                      id="payment_id"
                      value={editedPayment.payment_id || ''}
                      onChange={(e) => setEditedPayment(prev => ({ ...prev, payment_id: e.target.value }))}
                      disabled={!isEditing}
                      className={errors.payment_id ? 'border-red-500' : ''}
                    />
                    {errors.payment_id && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.payment_id}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order_id">Order ID</Label>
                    <Input
                      id="order_id"
                      value={editedPayment.order_id || ''}
                      onChange={(e) => setEditedPayment(prev => ({ ...prev, order_id: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="customer_id"
                      value={editedPayment.customer_id || ''}
                      onChange={(e) => setEditedPayment(prev => ({ ...prev, customer_id: e.target.value }))}
                      disabled={!isEditing}
                      className={`pl-10 ${errors.customer_id ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.customer_id && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.customer_id}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Total Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={editedPayment.amount || ''}
                        onChange={(e) => handleAmountChange('amount', e.target.value)}
                        disabled={!isEditing}
                        className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.amount && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.amount}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_amount">Due Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="due_amount"
                        type="number"
                        value={editedPayment.due_amount || ''}
                        onChange={(e) => handleAmountChange('due_amount', e.target.value)}
                        disabled={!isEditing}
                        className={`pl-10 ${errors.due_amount ? 'border-red-500' : ''}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.due_amount && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.due_amount}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid_amount">Paid Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="paid_amount"
                        type="number"
                        value={editedPayment.paid_amount || ''}
                        onChange={(e) => handleAmountChange('paid_amount', e.target.value)}
                        disabled={!isEditing}
                        className={`pl-10 ${errors.paid_amount ? 'border-red-500' : ''}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.paid_amount && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.paid_amount}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select 
                      value={editedPayment.payment_method} 
                      onValueChange={(value) => setEditedPayment(prev => ({ ...prev, payment_method: value as any }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_reference">Payment Reference</Label>
                    <Input
                      id="payment_reference"
                      value={editedPayment.payment_reference || ''}
                      onChange={(e) => setEditedPayment(prev => ({ ...prev, payment_reference: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="due_date"
                        type="date"
                        value={editedPayment.due_date || ''}
                        onChange={(e) => setEditedPayment(prev => ({ ...prev, due_date: e.target.value }))}
                        disabled={!isEditing}
                        className={`pl-10 ${errors.due_date ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.due_date && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.due_date}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collection_date">Collection Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="collection_date"
                        type="date"
                        value={editedPayment.collection_date || ''}
                        onChange={(e) => setEditedPayment(prev => ({ ...prev, collection_date: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editedPayment.notes || ''}
                    onChange={(e) => setEditedPayment(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Installments</CardTitle>
                <CardDescription>
                  Track partial payments and installments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInstallments ? (
                  <div className="text-center py-4">Loading installments...</div>
                ) : installments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No installments found for this payment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {installments.map((installment) => (
                      <div key={installment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Installment #{installment.installment_number}</h4>
                            <p className="text-sm text-muted-foreground">
                              Amount: {formatCurrency(installment.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {formatDate(installment.due_date)}
                            </p>
                            {installment.paid_date && (
                              <p className="text-sm text-green-600">
                                Paid: {formatDate(installment.paid_date)}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(installment.status)}>
                            {installment.status}
                          </Badge>
                        </div>
                        {installment.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {installment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Detailed payment method information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No payment method details available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium capitalize">{method.method_type}</h4>
                            {method.transaction_id && (
                              <p className="text-sm text-muted-foreground">
                                Transaction ID: {method.transaction_id}
                              </p>
                            )}
                            {method.bank_name && (
                              <p className="text-sm text-muted-foreground">
                                Bank: {method.bank_name}
                              </p>
                            )}
                            {method.card_last_four && (
                              <p className="text-sm text-muted-foreground">
                                Card: ****{method.card_last_four}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
