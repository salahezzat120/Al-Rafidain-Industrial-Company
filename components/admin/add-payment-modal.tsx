'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  Loader2,
  User,
  FileText,
  Building,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Payment, CreatePaymentData } from '@/types/payments'
import { createPayment, generatePaymentId } from '@/lib/payments'

interface AddPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (payment: Payment) => void
}

export default function AddPaymentModal({ open, onOpenChange, onAdd }: AddPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState<CreatePaymentData>({
    payment_id: '',
    customer_id: '',
    order_id: '',
    amount: 0,
    due_amount: 0,
    paid_amount: 0,
    payment_method: 'cash',
    due_date: '',
    collection_date: '',
    payment_reference: '',
    notes: ''
  })

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    console.log('Validating form data:', formData)

    if (!formData.payment_id || !formData.payment_id.trim()) newErrors.payment_id = 'Payment ID is required'
    if (!formData.customer_id || !formData.customer_id.trim()) newErrors.customer_id = 'Customer ID is required'
    else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.customer_id)) {
      newErrors.customer_id = 'Customer ID must be a valid UUID format'
    }
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!formData.due_amount || formData.due_amount <= 0) newErrors.due_amount = 'Due amount must be greater than 0'
    if (!formData.due_date || !formData.due_date.trim()) newErrors.due_date = 'Due date is required'
    if (formData.paid_amount < 0) newErrors.paid_amount = 'Paid amount cannot be negative'
    if (formData.paid_amount > formData.due_amount) newErrors.paid_amount = 'Paid amount cannot exceed due amount'

    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      console.log('Form data being submitted:', formData)
      console.log('Form data type check:', {
        customer_id_type: typeof formData.customer_id,
        amount_type: typeof formData.amount,
        due_amount_type: typeof formData.due_amount,
        paid_amount_type: typeof formData.paid_amount,
        due_date_type: typeof formData.due_date
      })
      
      // Ensure all required fields are properly formatted
      const paymentData = {
        ...formData,
        customer_id: formData.customer_id.trim(),
        payment_id: formData.payment_id.trim(),
        amount: Number(formData.amount),
        due_amount: Number(formData.due_amount),
        paid_amount: Number(formData.paid_amount || 0),
        due_date: formData.due_date.trim()
      }
      
      console.log('Processed payment data:', paymentData)
      
      const { data: newPayment, error } = await createPayment(paymentData)
      if (error) {
        console.error('Error from createPayment:', error)
        toast.error(`Failed to create payment: ${error}`)
        return
      }

      if (newPayment) {
        console.log('Payment created successfully:', newPayment)
        onAdd(newPayment)
        onOpenChange(false)
        setFormData({
          payment_id: '',
          customer_id: '',
          order_id: '',
          amount: 0,
          due_amount: 0,
          paid_amount: 0,
          payment_method: 'cash',
          due_date: '',
          collection_date: '',
          payment_reference: '',
          notes: ''
        })
        setErrors({})
        toast.success('Payment added successfully!')
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePaymentIdHandler = async () => {
    try {
      const newId = await generatePaymentId()
      setFormData(prev => ({ ...prev, payment_id: newId }))
    } catch (err) {
      console.error('Error generating payment ID:', err)
    }
  }

  const generateCustomerId = () => {
    // Generate a proper UUID v4 format
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    setFormData(prev => ({ ...prev, customer_id: uuid }))
  }

  const handleAmountChange = (field: 'amount' | 'due_amount' | 'paid_amount', value: string) => {
    const numValue = value ? Number(value) : 0
    setFormData(prev => ({ ...prev, [field]: numValue }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add New Payment
          </DialogTitle>
          <DialogDescription>
            Record a new client payment with comprehensive tracking information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Payment Information
              </CardTitle>
              <CardDescription>Basic payment details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_id">Payment ID *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="payment_id"
                      value={formData.payment_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_id: e.target.value }))}
                      placeholder="PAY20241201-0001"
                      className={errors.payment_id ? 'border-red-500' : ''}
                    />
                    <Button type="button" variant="outline" onClick={generatePaymentIdHandler}>
                      Generate
                    </Button>
                  </div>
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
                    value={formData.order_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))}
                    placeholder="ORD-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer ID *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="customer_id"
                      value={formData.customer_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      className={`pl-10 ${errors.customer_id ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={generateCustomerId}>
                    Generate UUID
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be a valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)
                </p>
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
              <CardDescription>Payment amounts and financial information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => handleAmountChange('amount', e.target.value)}
                      placeholder="1000.00"
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
                  <Label htmlFor="due_amount">Due Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="due_amount"
                      type="number"
                      value={formData.due_amount || ''}
                      onChange={(e) => handleAmountChange('due_amount', e.target.value)}
                      placeholder="1000.00"
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
                      value={formData.paid_amount || ''}
                      onChange={(e) => handleAmountChange('paid_amount', e.target.value)}
                      placeholder="0.00"
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
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Card
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="check">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Check
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_reference">Payment Reference</Label>
                  <Input
                    id="payment_reference"
                    value={formData.payment_reference || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                    placeholder="Transaction ID or reference"
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
              <CardDescription>Payment due date and collection information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
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
                      value={formData.collection_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, collection_date: e.target.value }))}
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
              <CardDescription>Notes and additional payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the payment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
