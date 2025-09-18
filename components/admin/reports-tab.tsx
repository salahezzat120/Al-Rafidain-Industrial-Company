"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, BarChart3 } from "lucide-react"
import { getPaymentSummaryByPeriod, getPayments, type Period, type DateRange, type PaymentSummaryRow, type PaymentRow } from "@/lib/reports"
import { useLanguage } from "@/contexts/language-context"

// Lazy import xlsx to avoid SSR issues
let XLSX: any
if (typeof window !== "undefined") {
  import("xlsx").then(mod => { XLSX = mod })
}

export default function ReportsTab() {
  const { isRTL } = useLanguage()
  const [period, setPeriod] = useState<Period>("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentRows, setPaymentRows] = useState<PaymentSummaryRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])

  const range: DateRange | undefined = useMemo(() => {
    if (startDate && endDate) return { startDate, endDate }
    return undefined
  }, [startDate, endDate])

  async function refresh() {
    setLoading(true)
    try {
      const [summary, payRows] = await Promise.all([
        getPaymentSummaryByPeriod(period, range),
        getPayments(range),
      ])
      setPaymentRows(summary)
      setPayments(payRows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  function exportToExcel() {
    if (!XLSX) return
    const wb = XLSX.utils.book_new()
    const paymentsSummarySheet = XLSX.utils.json_to_sheet(paymentRows)
    XLSX.utils.book_append_sheet(wb, paymentsSummarySheet, "PaymentsSummary")
    const paymentsSheet = XLSX.utils.json_to_sheet(payments)
    XLSX.utils.book_append_sheet(wb, paymentsSheet, "RecentPayments")
    XLSX.writeFile(wb, `reports_${period}_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="h-6 w-6" /> {isRTL ? "التقارير والتحليلات" : "Reports & Analytics"}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>{isRTL ? "تحديث" : "Refresh"}</Button>
          <Button onClick={exportToExcel} disabled={loading}><Download className="h-4 w-4 mr-2" /> {isRTL ? "تصدير إكسل" : "Export Excel"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "عوامل التصفية" : "Filters"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">{isRTL ? "الفترة" : "Period"}</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={isRTL ? "اختر الفترة" : "Select period"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{isRTL ? "يومي" : "Daily"}</SelectItem>
                <SelectItem value="weekly">{isRTL ? "أسبوعي" : "Weekly"}</SelectItem>
                <SelectItem value="monthly">{isRTL ? "شهري" : "Monthly"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-600">{isRTL ? "تاريخ البداية" : "Start date"}</label>
            <Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">{isRTL ? "تاريخ النهاية" : "End date"}</label>
            <Input type="date" className="mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={refresh} disabled={loading} className="w-full">{isRTL ? "تطبيق" : "Apply"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? "ملخص المدفوعات" : "Payment Summary"} ({period === 'daily' ? (isRTL ? 'يومي' : 'daily') : period === 'weekly' ? (isRTL ? 'أسبوعي' : 'weekly') : (isRTL ? 'شهري' : 'monthly')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المدفوعات" : "Payments"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "الإجمالي" : "Total Amount"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المدفوع" : "Total Paid"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المتبقي" : "Outstanding"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRows.map((r) => (
                  <TableRow key={r.date}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="text-right">{r.payments_count}</TableCell>
                    <TableCell className="text-right">{r.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.total_paid.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.total_outstanding.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {!paymentRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">{isRTL ? "لا توجد بيانات" : "No data"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "أحدث المدفوعات" : "Recent Payments"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                  <TableHead>{isRTL ? "رقم الدفع" : "Payment ID"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المدفوع" : "Paid"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "المتبقي" : "Outstanding"}</TableHead>
                  <TableHead>{isRTL ? "الطريقة" : "Method"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.created_at).toLocaleDateString(isRTL ? 'ar-IQ' : undefined)}</TableCell>
                    <TableCell>{p.payment_id}</TableCell>
                    <TableCell className="text-right">{Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(p.paid_amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(p.outstanding_balance).toFixed(2)}</TableCell>
                    <TableCell>{p.payment_method}</TableCell>
                    <TableCell>{p.payment_status}</TableCell>
                  </TableRow>
                ))}
                {!payments.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">{isRTL ? "لا توجد بيانات" : "No data"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


