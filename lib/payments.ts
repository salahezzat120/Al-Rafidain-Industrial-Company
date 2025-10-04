import { supabase } from './supabase'
import type {
  Payment,
  PaymentInstallment,
  PaymentMethod,
  CreatePaymentData,
  UpdatePaymentData,
  CreateInstallmentData,
  UpdateInstallmentData,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  PaymentStats,
  PaymentAnalytics,
  CustomerPaymentSummary,
  PaymentFilters
} from '../types/payments'

// Payment CRUD operations
export const createPayment = async (paymentData: CreatePaymentData): Promise<{ data: Payment | null; error: string | null }> => {
  try {
    console.log('Creating payment with data:', paymentData)
    
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating payment:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message || 'Failed to create payment' }
    }

    console.log('Payment created successfully:', data)
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating payment:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getPayments = async (filters?: PaymentFilters): Promise<{ data: Payment[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }
      if (filters.order_id) {
        query = query.eq('order_id', filters.order_id)
      }
      if (filters.date_range) {
        query = query.gte('payment_date', filters.date_range.start).lte('payment_date', filters.date_range.end)
      }
      if (filters.amount_range) {
        query = query.gte('amount', filters.amount_range.min).lte('amount', filters.amount_range.max)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return { data: null, error: error.message || 'Failed to fetch payments' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching payments:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getPaymentById = async (id: string): Promise<{ data: Payment | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching payment:', error)
      return { data: null, error: error.message || 'Failed to fetch payment' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching payment:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updatePayment = async (id: string, updates: UpdatePaymentData): Promise<{ data: Payment | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment:', error)
      return { data: null, error: error.message || 'Failed to update payment' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating payment:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const deletePayment = async (id: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting payment:', error)
      return { error: error.message || 'Failed to delete payment' }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error deleting payment:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Payment Installment operations
export const createInstallment = async (installmentData: CreateInstallmentData): Promise<{ data: PaymentInstallment | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_installments')
      .insert([installmentData])
      .select()
      .single()

    if (error) {
      console.error('Error creating installment:', error)
      return { data: null, error: error.message || 'Failed to create installment' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating installment:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getInstallmentsByPaymentId = async (paymentId: string): Promise<{ data: PaymentInstallment[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('payment_id', paymentId)
      .order('installment_number', { ascending: true })

    if (error) {
      console.error('Error fetching installments:', error)
      return { data: null, error: error.message || 'Failed to fetch installments' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching installments:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const updateInstallment = async (id: string, updates: UpdateInstallmentData): Promise<{ data: PaymentInstallment | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_installments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating installment:', error)
      return { data: null, error: error.message || 'Failed to update installment' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating installment:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Payment Method operations
export const createPaymentMethod = async (methodData: CreatePaymentMethodData): Promise<{ data: PaymentMethod | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([methodData])
      .select()
      .single()

    if (error) {
      console.error('Error creating payment method:', error)
      return { data: null, error: error.message || 'Failed to create payment method' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating payment method:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getPaymentMethodsByPaymentId = async (paymentId: string): Promise<{ data: PaymentMethod[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('payment_id', paymentId)

    if (error) {
      console.error('Error fetching payment methods:', error)
      return { data: null, error: error.message || 'Failed to fetch payment methods' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching payment methods:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Analytics and Statistics
export const getPaymentStats = async (): Promise<{ data: PaymentStats | null; error: string | null }> => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')

    if (error) {
      console.error('Error fetching payments for stats:', error)
      return { data: null, error: error.message || 'Failed to fetch payment statistics' }
    }

    if (!payments || payments.length === 0) {
      return { 
        data: {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0,
          refundedPayments: 0,
          averagePaymentAmount: 0,
          completionRate: 0
        }, 
        error: null 
      }
    }

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const completedPayments = payments.filter(p => p.status === 'completed').length
    const pendingPayments = payments.filter(p => p.status === 'pending').length
    const failedPayments = payments.filter(p => p.status === 'failed').length
    const refundedPayments = payments.filter(p => p.status === 'refunded').length

    const stats: PaymentStats = {
      totalPayments: payments.length,
      totalAmount,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      averagePaymentAmount: totalAmount / payments.length,
      completionRate: payments.length > 0 ? (completedPayments / payments.length) * 100 : 0
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Unexpected error calculating payment stats:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getPaymentAnalytics = async (): Promise<{ data: PaymentAnalytics[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('payment_analytics')
      .select('*')
      .order('month', { ascending: false })
      .limit(12) // Last 12 months

    if (error) {
      console.error('Error fetching payment analytics:', error)
      return { data: null, error: error.message || 'Failed to fetch payment analytics' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching payment analytics:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const getCustomerPaymentSummary = async (customerId?: string): Promise<{ data: CustomerPaymentSummary[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('customer_payment_summary')
      .select('*')
      .order('total_outstanding', { ascending: false })

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching customer payment summary:', error)
      return { data: null, error: error.message || 'Failed to fetch customer payment summary' }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching customer payment summary:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Utility functions
export const markPaymentAsCompleted = async (paymentId: string): Promise<{ data: Payment | null; error: string | null }> => {
  try {
    const updates: UpdatePaymentData = {
      id: paymentId,
      status: 'completed'
    }

    return await updatePayment(paymentId, updates)
  } catch (err) {
    console.error('Unexpected error marking payment as completed:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

export const generatePaymentId = async (): Promise<string> => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PAY${year}${month}${day}-${randomNum}`
}
