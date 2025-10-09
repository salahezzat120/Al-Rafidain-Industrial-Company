"use client"

import { useEffect, useState, useMemo } from "react"
import { getAttendanceRecords } from "@/lib/representative-live-locations"
import { AttendanceWithRepresentative } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Loader2, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle,
  XCircle,
  Coffee,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { AttendanceLocationMap } from "@/components/ui/attendance-location-map"
import { useLanguage } from "@/contexts/language-context"
import { format, isToday, isYesterday, parseISO, differenceInHours, differenceInMinutes, isThisWeek, isThisMonth, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

export default function AttendanceTab() {
  const { t, isRTL } = useLanguage()
  const [records, setRecords] = useState<AttendanceWithRepresentative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [representativeFilter, setRepresentativeFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceWithRepresentative | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await getAttendanceRecords()
      if (res.error) {
        setError(res.error)
      } else {
        setRecords(res.data || [])
      }
    } catch (err) {
      setError("Failed to fetch attendance records")
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.representative_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.representative_phone?.includes(searchTerm) ||
        record.representative_id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || record.status === statusFilter
      
      const matchesRepresentative = representativeFilter === "all" || record.representative_id === representativeFilter
      
      const matchesDateRange = (() => {
        if (dateRangeFilter === "all") return true
        if (!record.check_in_time) return false
        
        const recordDate = parseISO(record.check_in_time)
        
        switch (dateRangeFilter) {
          case "today":
            return isToday(recordDate)
          case "yesterday":
            return isYesterday(recordDate)
          case "this_week":
            return isThisWeek(recordDate)
          case "this_month":
            return isThisMonth(recordDate)
          case "custom":
            if (!startDate || !endDate) return true
            return isWithinInterval(recordDate, { start: startDate, end: endDate })
          default:
            return true
        }
      })()
      
      return matchesSearch && matchesStatus && matchesRepresentative && matchesDateRange
    })
  }, [records, searchTerm, statusFilter, representativeFilter, dateRangeFilter, startDate, endDate])

  const stats = useMemo(() => {
    const total = records.length
    const checkedIn = records.filter(r => r.status === 'checked_in').length
    const checkedOut = records.filter(r => r.status === 'checked_out').length
    const onBreak = records.filter(r => r.status === 'break').length
    const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0)
    
    return { total, checkedIn, checkedOut, onBreak, totalHours }
  }, [records])

  const uniqueRepresentatives = useMemo(() => {
    const reps = new Map()
    records.forEach(record => {
      if (record.representative_id && record.representative_name) {
        reps.set(record.representative_id, {
          id: record.representative_id,
          name: record.representative_name
        })
      }
    })
    return Array.from(reps.values())
  }, [records])

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setRepresentativeFilter("all")
    setDateRangeFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert(isRTL ? "لا توجد بيانات للتصدير" : "No data to export")
      return
    }

    const headers = [
      isRTL ? "المندوب" : "Representative",
      isRTL ? "الهاتف" : "Phone",
      isRTL ? "التاريخ" : "Date",
      isRTL ? "وقت الدخول" : "Check In",
      isRTL ? "وقت الخروج" : "Check Out",
      isRTL ? "المدة" : "Duration",
      isRTL ? "الحالة" : "Status",
      isRTL ? "الموقع" : "Location"
    ]

    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        `"${record.representative_name || ''}"`,
        `"${record.representative_phone || ''}"`,
        `"${record.check_in_time ? format(parseISO(record.check_in_time), 'yyyy-MM-dd') : ''}"`,
        `"${record.check_in_time ? format(parseISO(record.check_in_time), 'HH:mm') : ''}"`,
        `"${record.check_out_time ? format(parseISO(record.check_out_time), 'HH:mm') : ''}"`,
        `"${record.total_hours ? `${record.total_hours.toFixed(1)}h` : '0h'}"`,
        `"${record.status || ''}"`,
        `"${record.location || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_records_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    if (filteredRecords.length === 0) {
      alert(isRTL ? "لا توجد بيانات للتصدير" : "No data to export")
      return
    }

    // Create Excel-like CSV with proper formatting
    const headers = [
      isRTL ? "المندوب" : "Representative",
      isRTL ? "الهاتف" : "Phone", 
      isRTL ? "التاريخ" : "Date",
      isRTL ? "وقت الدخول" : "Check In",
      isRTL ? "وقت الخروج" : "Check Out",
      isRTL ? "المدة" : "Duration",
      isRTL ? "الحالة" : "Status",
      isRTL ? "الموقع" : "Location"
    ]

    const excelContent = [
      headers.join('\t'),
      ...filteredRecords.map(record => [
        record.representative_name || '',
        record.representative_phone || '',
        record.check_in_time ? format(parseISO(record.check_in_time), 'yyyy-MM-dd') : '',
        record.check_in_time ? format(parseISO(record.check_in_time), 'HH:mm') : '',
        record.check_out_time ? format(parseISO(record.check_out_time), 'HH:mm') : '',
        record.total_hours ? `${record.total_hours.toFixed(1)}h` : '0h',
        record.status || '',
        record.location || ''
      ].join('\t'))
    ].join('\n')

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_records_${format(new Date(), 'yyyy-MM-dd')}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      checked_in: { label: "Checked In", variant: "default", icon: CheckCircle, color: "text-green-600" },
      checked_out: { label: "Checked Out", variant: "secondary", icon: XCircle, color: "text-gray-600" },
      break: { label: "On Break", variant: "outline", icon: Coffee, color: "text-orange-600" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.checked_out
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A"
    const date = parseISO(timeString)
    return format(date, "HH:mm")
  }

  const formatDate = (timeString: string | null) => {
    if (!timeString) return "N/A"
    const date = parseISO(timeString)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "MMM dd, yyyy")
  }

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Ongoing"
    const start = parseISO(checkIn)
    const end = parseISO(checkOut)
    const hours = differenceInHours(end, start)
    const minutes = differenceInMinutes(end, start) % 60
    return `${hours}h ${minutes}m`
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRecords} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            {isRTL ? "سجلات الحضور" : "Attendance Records"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isRTL ? "إدارة ومتابعة حضور المندوبين" : "Manage and track representative attendance"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecords}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "تصدير" : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "تصدير CSV" : "Export CSV"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "تصدير Excel" : "Export Excel"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{isRTL ? "إجمالي" : "Total"}</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">{isRTL ? "سجل" : "records"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{isRTL ? "حاضر" : "Present"}</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-xs text-gray-500">{isRTL ? "مندوب" : "representatives"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{isRTL ? "مغادر" : "Checked Out"}</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.checkedOut}</div>
            <div className="text-xs text-gray-500">{isRTL ? "مندوب" : "representatives"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">{isRTL ? "استراحة" : "On Break"}</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.onBreak}</div>
            <div className="text-xs text-gray-500">{isRTL ? "مندوب" : "representatives"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">{isRTL ? "إجمالي الساعات" : "Total Hours"}</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours.toFixed(1)}</div>
            <div className="text-xs text-gray-500">{isRTL ? "ساعة" : "hours"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {isRTL ? "فلاتر البحث" : "Search Filters"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRTL ? "مسح الكل" : "Clear All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isRTL ? "البحث عن المندوبين..." : "Search representatives..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "فلترة حسب الحالة" : "Filter by status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "جميع الحالات" : "All Status"}</SelectItem>
                <SelectItem value="checked_in">{isRTL ? "حاضر" : "Checked In"}</SelectItem>
                <SelectItem value="checked_out">{isRTL ? "مغادر" : "Checked Out"}</SelectItem>
                <SelectItem value="break">{isRTL ? "استراحة" : "On Break"}</SelectItem>
              </SelectContent>
            </Select>

            {/* Representative Filter */}
            <Select value={representativeFilter} onValueChange={setRepresentativeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر المندوب" : "Select Representative"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "جميع المندوبين" : "All Representatives"}</SelectItem>
                {uniqueRepresentatives.map(rep => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر الفترة" : "Select Date Range"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "جميع التواريخ" : "All Dates"}</SelectItem>
                <SelectItem value="today">{isRTL ? "اليوم" : "Today"}</SelectItem>
                <SelectItem value="yesterday">{isRTL ? "أمس" : "Yesterday"}</SelectItem>
                <SelectItem value="this_week">{isRTL ? "هذا الأسبوع" : "This Week"}</SelectItem>
                <SelectItem value="this_month">{isRTL ? "هذا الشهر" : "This Month"}</SelectItem>
                <SelectItem value="custom">{isRTL ? "فترة مخصصة" : "Custom Range"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRangeFilter === "custom" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? "تاريخ البداية" : "Start Date"}
                </label>
                <Input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? "تاريخ النهاية" : "End Date"}
                </label>
                <Input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {isRTL ? "سجلات الحضور" : "Attendance Records"}
            <Badge variant="outline">{filteredRecords.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "المندوب" : "Representative"}</TableHead>
                  <TableHead>{isRTL ? "الهاتف" : "Phone"}</TableHead>
                  <TableHead>{isRTL ? "تاريخ الحضور" : "Date"}</TableHead>
                  <TableHead>{isRTL ? "وقت الحضور" : "Check In"}</TableHead>
                  <TableHead>{isRTL ? "وقت المغادرة" : "Check Out"}</TableHead>
                  <TableHead>{isRTL ? "المدة" : "Duration"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {isRTL ? "لا توجد سجلات حضور" : "No attendance records found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{record.representative_name || record.representative_id}</div>
                            <div className="text-sm text-gray-500">ID: {record.representative_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {record.representative_phone || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(record.check_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-green-600" />
                          {formatTime(record.check_in_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-red-600" />
                            {formatTime(record.check_out_time)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {calculateDuration(record.check_in_time, record.check_out_time)}
                        </div>
                        {record.total_hours && (
                          <div className="text-xs text-gray-500">
                            {record.total_hours.toFixed(1)}h total
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {isRTL ? "تفاصيل الحضور" : "Attendance Details"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "المندوب" : "Representative"}</label>
                  <p className="text-lg font-semibold">{selectedRecord.representative_name || selectedRecord.representative_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "الهاتف" : "Phone"}</label>
                  <p className="text-lg">{selectedRecord.representative_phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "وقت الحضور" : "Check In Time"}</label>
                  <p className="text-lg">{selectedRecord.check_in_time ? format(parseISO(selectedRecord.check_in_time), "PPpp") : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "وقت المغادرة" : "Check Out Time"}</label>
                  <p className="text-lg">{selectedRecord.check_out_time ? format(parseISO(selectedRecord.check_out_time), "PPpp") : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "الحالة" : "Status"}</label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "إجمالي الساعات" : "Total Hours"}</label>
                  <p className="text-lg">{selectedRecord.total_hours?.toFixed(1) || "N/A"}h</p>
                </div>
              </div>
              
              {/* Location Map */}
              <div className="col-span-2">
                <AttendanceLocationMap
                  checkInLat={selectedRecord.check_in_latitude}
                  checkInLng={selectedRecord.check_in_longitude}
                  checkOutLat={selectedRecord.check_out_latitude}
                  checkOutLng={selectedRecord.check_out_longitude}
                  representativeName={selectedRecord.representative_name}
                  className="w-full"
                />
              </div>
              
              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{isRTL ? "ملاحظات" : "Notes"}</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
