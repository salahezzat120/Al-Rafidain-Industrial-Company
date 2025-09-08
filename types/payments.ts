export interface Payment {
  id: string
  payment_id: string
  customer_id: string
  order_id?: string
  amount: number
  due_amount: number
  paid_amount: number
  outstanding_balance: number
  payment_method: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  collection_date?: string
  payment_reference?: string
  notes?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface PaymentInstallment {
  id: string
  payment_id: string
  installment_number: number
  amount: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'paid' | 'overdue'
  payment_method?: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  payment_id: string
  method_type: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  method_details?: any
  transaction_id?: string
  bank_name?: string
  account_number?: string
  card_last_four?: string
  created_at: string
}

export interface CreatePaymentData {
  payment_id?: string
  customer_id: string
  order_id?: string
  amount: number
  due_amount: number
  paid_amount?: number
  payment_method: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  due_date: string
  collection_date?: string
  payment_reference?: string
  notes?: string
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {
  id: string
}

export interface CreateInstallmentData {
  payment_id: string
  installment_number: number
  amount: number
  due_date: string
  paid_date?: string
  status?: 'pending' | 'paid' | 'overdue'
  payment_method?: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  reference?: string
  notes?: string
}

export interface UpdateInstallmentData extends Partial<CreateInstallmentData> {
  id: string
}

export interface CreatePaymentMethodData {
  payment_id: string
  method_type: 'cash' | 'card' | 'transfer' | 'check' | 'other'
  method_details?: any
  transaction_id?: string
  bank_name?: string
  account_number?: string
  card_last_four?: string
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
  id: string
}

export interface PaymentStats {
  totalPayments: number
  totalAmount: number
  totalPaid: number
  totalOutstanding: number
  pendingPayments: number
  partialPayments: number
  paidPayments: number
  overduePayments: number
  averagePaymentTime: number
  collectionRate: number
}

export interface PaymentAnalytics {
  month: string
  total_payments: number
  total_amount: number
  total_paid: number
  total_outstanding: number
  paid_count: number
  pending_count: number
  partial_count: number
  overdue_count: number
  avg_days_to_pay: number
}

export interface CustomerPaymentSummary {
  customer_id: string
  total_payments: number
  total_amount: number
  total_paid: number
  total_outstanding: number
  overdue_count: number
  oldest_overdue_date?: string
}

export interface PaymentFilters {
  status?: string
  payment_method?: string
  date_range?: {
    start: string
    end: string
  }
  customer_id?: string
  amount_range?: {
    min: number
    max: number
  }
}

export interface PaymentExportData {
  payments: Payment[]
  format: 'csv' | 'excel' | 'pdf'
  include_installments?: boolean
  include_methods?: boolean
}
