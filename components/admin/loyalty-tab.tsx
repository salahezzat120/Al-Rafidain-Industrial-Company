"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Award } from "lucide-react"
import { createLoyaltyEvaluation, getLoyaltyLeaderboard, calculateLoyaltyPoints } from "@/lib/loyalty"
import { getEmployees } from "@/lib/employees"
import { useLanguage } from "@/contexts/language-context"

let XLSX: any
if (typeof window !== 'undefined') {
  import('xlsx').then((m) => { XLSX = m })
}

export default function LoyaltyTab() {
  const { isRTL } = useLanguage()
  const [periodMonth, setPeriodMonth] = useState<string>("")
  const [employeeId, setEmployeeId] = useState<string>("")
  const [visits, setVisits] = useState<number>(0)
  const [closingRate, setClosingRate] = useState<number>(0)
  const [punctuality, setPunctuality] = useState<number>(0)
  const [csat, setCsat] = useState<number>(0)
  const [comments, setComments] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [employees, setEmployees] = useState<Array<{ id: string; employee_id: string; first_name?: string; last_name?: string }>>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  const points = useMemo(() => calculateLoyaltyPoints({ visits_count: visits, deal_closing_rate: closingRate, punctuality_score: punctuality, customer_satisfaction: csat }), [visits, closingRate, punctuality, csat])

  async function submitEvaluation() {
    if (!employeeId) return
    setSubmitting(true)
    try {
      await createLoyaltyEvaluation({
        employee_id: employeeId,
        period_month: periodMonth,
        visits_count: visits,
        deal_closing_rate: closingRate,
        punctuality_score: punctuality,
        customer_satisfaction: csat,
        comments,
      })
      await loadLeaderboard()
      setVisits(0); setClosingRate(0); setPunctuality(0); setCsat(0); setComments("")
    } finally {
      setSubmitting(false)
    }
  }

  async function loadLeaderboard() {
    const rows = await getLoyaltyLeaderboard(periodMonth)
    setLeaderboard(rows)
  }

  useEffect(() => { loadLeaderboard() }, [periodMonth])

  // Set default month on client after mount to avoid SSR/client time mismatch
  useEffect(() => {
    if (!periodMonth) {
      const d = new Date()
      const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
      setPeriodMonth(monthStr)
    }
  }, [periodMonth])

  // Load employees for dropdown
  useEffect(() => {
    async function load() {
      setLoadingEmployees(true)
      try {
        const res: any = await getEmployees()
        const list = res?.data || []
        const items = list.map((e: any) => ({ id: e.id, employee_id: e.employee_id, first_name: e.first_name, last_name: e.last_name }))
        setEmployees(items)
      } finally {
        setLoadingEmployees(false)
      }
    }
    load()
  }, [])

  function exportExcel() {
    if (!XLSX) return
    const wb = XLSX.utils.book_new()
    const sheet = XLSX.utils.json_to_sheet(leaderboard)
    XLSX.utils.book_append_sheet(wb, sheet, 'Leaderboard')
    XLSX.writeFile(wb, `loyalty_leaderboard_${periodMonth}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Award className="h-6 w-6" /> {isRTL ? "نظام الولاء" : "Loyalty System"}</h2>
        <div className="flex gap-2">
          <Button onClick={exportExcel}><Download className="h-4 w-4 mr-2" /> {isRTL ? "تصدير" : "Export"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "التقييم" : "Evaluation"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>{isRTL ? "الفترة (شهر)" : "Period (Month)"}</Label>
            <Input suppressHydrationWarning type="month" value={(periodMonth || '').slice(0,7)} onChange={(e) => setPeriodMonth(e.target.value + '-01')} />
          </div>
          <div>
            <Label>{isRTL ? "الموظف" : "Employee"}</Label>
            <Select value={employeeId} onValueChange={(v) => setEmployeeId(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={isRTL ? "اختر موظف" : "Select employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {(emp.first_name || emp.last_name ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : emp.employee_id) + ` (${emp.employee_id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">{isRTL ? "النقاط المحسوبة" : "Calculated Points"}: <span className="font-semibold">{points}</span></div>
          </div>

          <div>
            <Label>{isRTL ? "عدد الزيارات" : "Visits"}</Label>
            <Input type="number" min={0} value={visits} onChange={(e) => setVisits(Number(e.target.value||0))} />
          </div>
          <div>
            <Label>{isRTL ? "معدل إغلاق الصفقات (%)" : "Deal Closing Rate (%)"}</Label>
            <Input type="number" min={0} max={100} value={closingRate} onChange={(e) => setClosingRate(Number(e.target.value||0))} />
          </div>
          <div>
            <Label>{isRTL ? "الانضباط (0-5)" : "Punctuality (0-5)"}</Label>
            <Input type="number" min={0} max={5} step={0.1} value={punctuality} onChange={(e) => setPunctuality(Number(e.target.value||0))} />
          </div>
          <div>
            <Label>{isRTL ? "رضا العملاء (0-5)" : "Customer Satisfaction (0-5)"}</Label>
            <Input type="number" min={0} max={5} step={0.1} value={csat} onChange={(e) => setCsat(Number(e.target.value||0))} />
          </div>
          <div className="md:col-span-2">
            <Label>{isRTL ? "ملاحظات" : "Comments"}</Label>
            <Input value={comments} onChange={(e) => setComments(e.target.value)} placeholder={isRTL ? "ملاحظات لمساعدة المندوب على التحسن" : "Feedback to help representative improve"} />
          </div>
          <div className="flex items-end">
            <Button onClick={submitEvaluation} disabled={submitting || !employeeId}>{isRTL ? "حفظ التقييم" : "Save Evaluation"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "لوحة الصدارة الشهرية" : "Monthly Leaderboard"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "الموظف" : "Employee"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "النقاط" : "Points"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "متوسط الإغلاق %" : "Avg Closing %"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "متوسط الانضباط" : "Avg Punctuality"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "متوسط رضا العملاء" : "Avg CSAT"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "إجمالي الزيارات" : "Total Visits"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row) => (
                  <TableRow key={`${row.employee_id}-${row.period_month}`}>
                    <TableCell className="font-medium">{row.employee_id}</TableCell>
                    <TableCell className="text-right">{row.points}</TableCell>
                    <TableCell className="text-right">{Number(row.avg_closing_rate||0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(row.avg_punctuality||0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(row.avg_csat||0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.total_visits}</TableCell>
                  </TableRow>
                ))}
                {!leaderboard.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">{isRTL ? "لا توجد بيانات" : "No data"}</TableCell>
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


