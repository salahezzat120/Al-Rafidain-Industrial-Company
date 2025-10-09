'use client'

import React, { useState, useEffect } from 'react'
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
  CheckCircle,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/language-context'
import type { Payment, CreatePaymentData } from '@/types/payments'
import { createPayment } from '@/lib/payments'
import { getCustomers, type Customer } from '@/lib/customers'
import { getDeliveryTasksByCustomerId, type DeliveryTask } from '@/lib/delivery-tasks'

interface AddPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (payment: Payment) => void
}

export default function AddPaymentModal({ open, onOpenChange, onAdd }: AddPaymentModalProps) {
  const { t, isRTL } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)

  const [formData, setFormData] = useState<CreatePaymentData>({
    order_id: '',
    payment_method: 'cash',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: ''
  })

  // Load customers on component mount
  useEffect(() => {
    if (open) {
      loadCustomers()
    }
  }, [open])

  // Load delivery tasks when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      loadDeliveryTasks(selectedCustomer.id)
    } else {
      setDeliveryTasks([])
      setFormData(prev => ({ ...prev, order_id: '' }))
    }
  }, [selectedCustomer])

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const { data, error } = await getCustomers()
      if (error) {
        toast.error(`Failed to load customers: ${error}`)
        return
      }
      setCustomers(data || [])
    } catch (err) {
      toast.error('An unexpected error occurred while loading customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const loadDeliveryTasks = async (customerId: string) => {
    try {
      setLoadingTasks(true)
      const { data, error } = await getDeliveryTasksByCustomerId(customerId)
      if (error) {
        toast.error(`Failed to load delivery tasks: ${error}`)
        return
      }
      setDeliveryTasks(data || [])
    } catch (err) {
      toast.error('An unexpected error occurred while loading delivery tasks')
    } finally {
      setLoadingTasks(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!selectedCustomer) newErrors.customer = isRTL ? 'يرجى اختيار عميل' : 'Please select a customer'
    if (!formData.order_id || !formData.order_id.trim()) newErrors.order_id = isRTL ? 'يرجى اختيار طلب' : 'Please select an order'
    if (!formData.amount || formData.amount <= 0) newErrors.amount = isRTL ? 'يجب أن يكون المبلغ أكبر من 0' : 'Amount must be greater than 0'
    if (!formData.payment_date || !formData.payment_date.trim()) newErrors.payment_date = isRTL ? 'تاريخ الدفع مطلوب' : 'Payment date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const paymentData: CreatePaymentData = {
        order_id: formData.order_id,
        payment_method: formData.payment_method,
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        status: formData.status,
        notes: formData.notes
      }
      
      const { data: newPayment, error } = await createPayment(paymentData)
      if (error) {
        toast.error(`Failed to create payment: ${error}`)
        return
      }

      if (newPayment) {
        onAdd(newPayment)
        onOpenChange(false)
        resetForm()
        toast.success('Payment added successfully!')
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      order_id: '',
      payment_method: 'cash',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: ''
    })
    setSelectedCustomer(null)
    setDeliveryTasks([])
    setErrors({})
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
  }

  const handleOrderChange = (orderId: string) => {
    setFormData(prev => ({ ...prev, order_id: orderId }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <DollarSign className="h-5 w-5" />
            {isRTL ? 'إضافة دفعة جديدة' : 'Add New Payment'}
          </DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            {isRTL ? 'تسجيل دفعة عميل جديدة مع معلومات تتبع شاملة' : 'Record a new client payment with comprehensive tracking information'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="h-5 w-5 text-blue-600" />
                {isRTL ? 'اختيار العميل' : 'Customer Selection'}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {isRTL ? 'اختر العميل لهذه الدفعة' : 'Select the customer for this payment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? 'العميل *' : 'Customer *'}
                </Label>
                <Select 
                  value={selectedCustomer?.id || ''} 
                  onValueChange={handleCustomerChange}
                  disabled={loadingCustomers}
                >
                  <SelectTrigger className={`${errors.customer ? 'border-red-500' : ''} ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectValue placeholder={
                      loadingCustomers 
                        ? (isRTL ? "جاري تحميل العملاء..." : "Loading customers...")
                        : (isRTL ? "اختر عميل" : "Select a customer")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <User className="h-4 w-4" />
                          <span className={isRTL ? 'text-right' : 'text-left'}>{customer.name}</span>
                          <span className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>({customer.customer_id})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer && (
                  <Alert variant="destructive" className={`py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className={isRTL ? 'text-right' : 'text-left'}>{errors.customer}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Package className="h-5 w-5 text-green-600" />
                {isRTL ? 'اختيار الطلب' : 'Order Selection'}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {isRTL ? 'اختر مهمة التوصيل/الطلب لهذه الدفعة' : 'Select the delivery task/order for this payment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order" className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? 'الطلب *' : 'Order *'}
                </Label>
                <Select 
                  value={formData.order_id} 
                  onValueChange={handleOrderChange}
                  disabled={!selectedCustomer || loadingTasks}
                >
                  <SelectTrigger className={`${errors.order_id ? 'border-red-500' : ''} ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectValue placeholder={
                      !selectedCustomer 
                        ? (isRTL ? "يرجى اختيار عميل أولاً" : "Please select a customer first")
                        : loadingTasks 
                          ? (isRTL ? "جاري تحميل الطلبات..." : "Loading orders...")
                          : deliveryTasks.length === 0 
                            ? (isRTL ? "لا توجد طلبات لهذا العميل" : "No orders found for this customer")
                            : (isRTL ? "اختر طلب" : "Select an order")
                    }>
                      {formData.order_id && (() => {
                        const selectedTask = deliveryTasks.find(task => task.id === formData.order_id)
                        return selectedTask ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">{selectedTask.title}</span>
                              <span className="text-xs text-gray-500">{selectedTask.task_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {selectedTask.status.toUpperCase()}
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                {selectedTask.total_value} {selectedTask.currency || 'IQD'}
                              </span>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-base">{task.title}</span>
                            <span className="text-sm font-semibold text-green-600">
                              {task.total_value} {task.currency || 'IQD'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600 font-mono">{task.task_id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                          {task.description && (
                            <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </span>
                          )}
                          {task.scheduled_for && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">
                                Scheduled: {new Date(task.scheduled_for).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.order_id && (
                  <Alert variant="destructive" className={`py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className={isRTL ? 'text-right' : 'text-left'}>{errors.order_id}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <DollarSign className="h-5 w-5 text-green-600" />
                {isRTL ? 'تفاصيل الدفعة' : 'Payment Details'}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {isRTL ? 'مبلغ الدفعة والطريقة والحالة' : 'Payment amount, method, and status'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'المبلغ *' : 'Amount *'}
                  </Label>
                  <div className="relative">
                    <DollarSign className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="1000.00"
                      className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'} ${errors.amount ? 'border-red-500' : ''}`}
                      step="0.01"
                      min="0"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  {errors.amount && (
                    <Alert variant="destructive" className={`py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className={isRTL ? 'text-right' : 'text-left'}>{errors.amount}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'طريقة الدفع *' : 'Payment Method *'}
                  </Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                      <SelectValue placeholder={isRTL ? "اختر طريقة الدفع" : "Select payment method"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="h-4 w-4" />
                          {isRTL ? 'نقداً' : 'Cash'}
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <CreditCard className="h-4 w-4" />
                          {isRTL ? 'بطاقة' : 'Card'}
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building className="h-4 w-4" />
                          {isRTL ? 'تحويل بنكي' : 'Bank Transfer'}
                        </div>
                      </SelectItem>
                      <SelectItem value="check">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <FileText className="h-4 w-4" />
                          {isRTL ? 'شيك' : 'Check'}
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <AlertCircle className="h-4 w-4" />
                          {isRTL ? 'أخرى' : 'Other'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_date" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'تاريخ الدفع *' : 'Payment Date *'}
                  </Label>
                  <div className="relative">
                    <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                    <Input
                      id="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                      className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'} ${errors.payment_date ? 'border-red-500' : ''}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  {errors.payment_date && (
                    <Alert variant="destructive" className={`py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className={isRTL ? 'text-right' : 'text-left'}>{errors.payment_date}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'الحالة *' : 'Status *'}
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                      <SelectValue placeholder={isRTL ? "اختر الحالة" : "Select status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <AlertCircle className="h-4 w-4" />
                          {isRTL ? 'معلق' : 'Pending'}
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <CheckCircle className="h-4 w-4" />
                          {isRTL ? 'مكتمل' : 'Completed'}
                        </div>
                      </SelectItem>
                      <SelectItem value="failed">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <AlertCircle className="h-4 w-4" />
                          {isRTL ? 'فشل' : 'Failed'}
                        </div>
                      </SelectItem>
                      <SelectItem value="refunded">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="h-4 w-4" />
                          {isRTL ? 'مسترد' : 'Refunded'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <FileText className="h-5 w-5 text-orange-600" />
                {isRTL ? 'معلومات إضافية' : 'Additional Information'}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {isRTL ? 'ملاحظات وتفاصيل الدفعة الإضافية' : 'Notes and additional payment details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isRTL ? "ملاحظات إضافية حول الدفعة..." : "Additional notes about the payment..."}
                  rows={3}
                  className={isRTL ? 'text-right' : 'text-left'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className={`flex ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'} flex-shrink-0 border-t bg-background p-4`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={isRTL ? 'flex-row-reverse' : ''}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting} className={isRTL ? 'flex-row-reverse' : ''}>
              {isSubmitting ? (
                <>
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  {isRTL ? 'جاري الإضافة...' : 'Adding Payment...'}
                </>
              ) : (
                <>
                  <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة دفعة' : 'Add Payment'}
                </>
              )}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
