import { supabase } from '@/lib/supabase'

export type Period = 'daily' | 'weekly' | 'monthly'

export interface DateRange {
  startDate: string // ISO date
  endDate: string   // ISO date
}

export interface PaymentSummaryRow {
  date: string
  total_amount: number
  total_paid: number
  total_outstanding: number
  payments_count: number
}

export interface DelegatePerformanceRow {
  employee_id: string
  employee_name: string
  deliveries: number
  on_time_rate: number
  avg_rating: number
}

export interface SalesByRegionRow {
  region: string
  total_amount: number
  total_paid: number
  orders_count: number
}

function getDateTrunc(period: Period): 'day' | 'week' | 'month' {
  if (period === 'daily') return 'day'
  if (period === 'weekly') return 'week'
  return 'month'
}

export async function getPaymentSummaryByPeriod(period: Period, range?: DateRange): Promise<PaymentSummaryRow[]> {
  let query = supabase.from('payments').select('created_at, amount, paid_amount, outstanding_balance')
  if (range?.startDate && range?.endDate) {
    query = query.gte('created_at', range.startDate).lt('created_at', `${range.endDate}T23:59:59.999Z`)
  }
  const { data, error } = await query
  if (error) throw error

  const formatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const groupKey = (iso: string) => {
    const d = new Date(iso)
    if (period === 'daily') return formatter.format(d)
    if (period === 'weekly') {
      const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      const day = tmp.getUTCDay() || 7
      tmp.setUTCDate(tmp.getUTCDate() + 4 - day)
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
      const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
      return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
    }
    // monthly
    return `${new Date(iso).toISOString().slice(0,7)}`
  }

  const aggregate = new Map<string, PaymentSummaryRow>()
  for (const row of data || []) {
    const key = groupKey(row.created_at as unknown as string)
    if (!aggregate.has(key)) {
      aggregate.set(key, { date: key, payments_count: 0, total_amount: 0, total_paid: 0, total_outstanding: 0 })
    }
    const agg = aggregate.get(key)!
    agg.payments_count += 1
    agg.total_amount += Number(row.amount || 0)
    agg.total_paid += Number(row.paid_amount || 0)
    agg.total_outstanding += Number(row.outstanding_balance || 0)
  }
  return Array.from(aggregate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// Placeholder implementations depending on available tables; adjust when delivery tables exist
export async function getDelegatePerformance(range?: DateRange): Promise<DelegatePerformanceRow[]> {
  // If you have a deliveries table, replace this RPC with a real query.
  return []
}

export async function getSalesByRegion(range?: DateRange): Promise<SalesByRegionRow[]> {
  let query = supabase.from('customers').select('address, total_spent, created_at')
  if (range?.startDate && range?.endDate) {
    query = query.gte('created_at', range.startDate).lt('created_at', `${range.endDate}T23:59:59.999Z`)
  }
  const { data, error } = await query
  if (error) throw error

  const regionFromAddress = (addr?: string | null): string => {
    if (!addr) return 'Unknown'
    const parts = addr.split(',').map(s => s.trim()).filter(Boolean)
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'Unknown'
  }

  const aggregate = new Map<string, SalesByRegionRow>()
  for (const row of data || []) {
    const region = regionFromAddress(row.address as unknown as string)
    if (!aggregate.has(region)) {
      aggregate.set(region, { region, total_amount: 0, total_paid: 0, orders_count: 0 })
    }
    const agg = aggregate.get(region)!
    agg.orders_count += 1
    const spent = Number(row.total_spent || 0)
    agg.total_amount += spent
    agg.total_paid += spent // no separate paid metric available from customers
  }
  return Array.from(aggregate.values()).sort((a, b) => b.total_amount - a.total_amount)
}

export interface PaymentRow {
  id: string
  payment_id: string
  amount: number
  due_amount: number
  paid_amount: number
  outstanding_balance: number
  payment_method: string
  payment_status: string
  due_date: string
  collection_date: string | null
  created_at: string
}

export async function getPayments(range?: DateRange): Promise<PaymentRow[]> {
  let query = supabase
    .from('payments')
    .select('id,payment_id,amount,due_amount,paid_amount,outstanding_balance,payment_method,payment_status,due_date,collection_date,created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (range?.startDate && range?.endDate) {
    query = query.gte('created_at', range.startDate).lt('created_at', `${range.endDate}T23:59:59.999Z`)
  }
  const { data, error } = await query
  if (error) throw error
  return (data as any[]) as PaymentRow[]
}


