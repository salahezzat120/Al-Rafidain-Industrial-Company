import { useEffect, useState } from "react"
import { getAttendanceRecords } from "@/lib/representative-live-locations"
import { AttendanceWithRepresentative } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function AttendanceTab() {
  const [records, setRecords] = useState<AttendanceWithRepresentative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAttendanceRecords().then(res => {
      if (res.error) setError(res.error)
      else setRecords(res.data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.representative_name || rec.representative_id}</TableCell>
                    <TableCell>{rec.representative_phone}</TableCell>
                    <TableCell>{rec.check_in_time ? new Date(rec.check_in_time).toLocaleString() : ''}</TableCell>
                    <TableCell>{rec.check_out_time ? new Date(rec.check_out_time).toLocaleString() : ''}</TableCell>
                    <TableCell>{rec.status}</TableCell>
                    <TableCell>{rec.total_hours ?? ''}</TableCell>
                    <TableCell>{rec.notes ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
