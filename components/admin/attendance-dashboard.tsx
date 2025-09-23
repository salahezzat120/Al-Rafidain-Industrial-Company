"use client"

import { useEffect, useState, useMemo } from "react"
import { getAttendanceRecords } from "@/lib/representative-live-locations"
import { AttendanceWithRepresentative } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  Search, 
  Download, 
  RefreshCw, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Coffee,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Filter,
  FileText,
  PieChart,
  Activity,
  Timer,
  Target
} from "lucide-react"
import { AttendanceLocationMap } from "@/components/ui/attendance-location-map"
import { useLanguage } from "@/contexts/language-context"
import { format, isToday, isYesterday, parseISO, differenceInHours, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { cn } from "@/lib/utils"

export default function AttendanceDashboard() {
  const { t, isRTL } = useLanguage()
  const [records, setRecords] = useState<AttendanceWithRepresentative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceWithRepresentative | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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
      
      const matchesDate = !dateFilter || 
        (record.check_in_time && isSameDay(parseISO(record.check_in_time), dateFilter))
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [records, searchTerm, statusFilter, dateFilter])

  const stats = useMemo(() => {
    const total = records.length
    const checkedIn = records.filter(r => r.status === 'checked_in').length
    const checkedOut = records.filter(r => r.status === 'checked_out').length
    const onBreak = records.filter(r => r.status === 'break').length
    const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0)
    const avgHours = total > 0 ? totalHours / total : 0
    
    // Calculate attendance rate
    const todayRecords = records.filter(r => 
      r.check_in_time && isToday(parseISO(r.check_in_time))
    )
    const attendanceRate = todayRecords.length > 0 ? 
      (todayRecords.filter(r => r.status === 'checked_in').length / todayRecords.length) * 100 : 0
    
    return { total, checkedIn, checkedOut, onBreak, totalHours, avgHours, attendanceRate }
  }, [records])

  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return weekDays.map(day => {
      const dayRecords = records.filter(r => 
        r.check_in_time && isSameDay(parseISO(r.check_in_time), day)
      )
      return {
        date: day,
        total: dayRecords.length,
        present: dayRecords.filter(r => r.status === 'checked_in').length,
        absent: dayRecords.length - dayRecords.filter(r => r.status === 'checked_in').length
      }
    })
  }, [records])

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
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="h-8 w-8" />
            {isRTL ? "لوحة تحكم الحضور" : "Attendance Dashboard"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isRTL ? "مراقبة شاملة وإدارة حضور المندوبين" : "Comprehensive monitoring and management of representative attendance"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecords}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{isRTL ? "إجمالي السجلات" : "Total Records"}</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-100 text-xs mt-1">{isRTL ? "سجل حضور" : "attendance records"}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{isRTL ? "حاضر الآن" : "Currently Present"}</p>
                <p className="text-3xl font-bold">{stats.checkedIn}</p>
                <p className="text-green-100 text-xs mt-1">{isRTL ? "مندوب" : "representatives"}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{isRTL ? "معدل الحضور" : "Attendance Rate"}</p>
                <p className="text-3xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
                <p className="text-purple-100 text-xs mt-1">{isRTL ? "اليوم" : "today"}</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{isRTL ? "إجمالي الساعات" : "Total Hours"}</p>
                <p className="text-3xl font-bold">{stats.totalHours.toFixed(1)}</p>
                <p className="text-orange-100 text-xs mt-1">{isRTL ? "ساعة عمل" : "work hours"}</p>
              </div>
              <Timer className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{isRTL ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="records">{isRTL ? "السجلات" : "Records"}</TabsTrigger>
          <TabsTrigger value="analytics">{isRTL ? "التحليلات" : "Analytics"}</TabsTrigger>
          <TabsTrigger value="reports">{isRTL ? "التقارير" : "Reports"}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {isRTL ? "الحضور الأسبوعي" : "Weekly Attendance"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                          {format(day.date, "E")}
                        </div>
                        <span className="text-sm font-medium">
                          {format(day.date, "MMM dd")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{day.present}</div>
                          <div className="text-xs text-gray-500">{isRTL ? "حاضر" : "Present"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-600">{day.absent}</div>
                          <div className="text-xs text-gray-500">{isRTL ? "غائب" : "Absent"}</div>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${day.total > 0 ? (day.present / day.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {isRTL ? "توزيع الحالات" : "Status Distribution"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{isRTL ? "حاضر" : "Present"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.checkedIn}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{isRTL ? "مغادر" : "Checked Out"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.checkedOut / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.checkedOut}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">{isRTL ? "استراحة" : "On Break"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.onBreak / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.onBreak}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
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
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={isRTL ? "فلترة حسب الحالة" : "Filter by status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? "جميع الحالات" : "All Status"}</SelectItem>
                    <SelectItem value="checked_in">{isRTL ? "حاضر" : "Checked In"}</SelectItem>
                    <SelectItem value="checked_out">{isRTL ? "مغادر" : "Checked Out"}</SelectItem>
                    <SelectItem value="break">{isRTL ? "استراحة" : "On Break"}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-48">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateFilter ? format(dateFilter, "MMM dd") : (isRTL ? "اختر التاريخ" : "Select Date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? "سجلات الحضور" : "Attendance Records"}
                <Badge variant="outline">{filteredRecords.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="space-y-2">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {isRTL ? "لا توجد سجلات حضور" : "No attendance records found"}
                    </div>
                  ) : (
                    filteredRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{record.representative_name || record.representative_id}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {record.representative_phone || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(record.check_in_time)}
                                </span>
                                {record.check_out_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(record.check_out_time)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {calculateDuration(record.check_in_time, record.check_out_time)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(record.check_in_time)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(record.status)}
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {isRTL ? "إحصائيات الأداء" : "Performance Metrics"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{isRTL ? "متوسط الساعات اليومية" : "Average Daily Hours"}</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.avgHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{isRTL ? "معدل الحضور" : "Attendance Rate"}</span>
                  <span className="text-2xl font-bold text-green-600">{stats.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{isRTL ? "إجمالي الساعات" : "Total Hours"}</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.totalHours.toFixed(1)}h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {isRTL ? "اتجاهات الحضور" : "Attendance Trends"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  {isRTL ? "الرسوم البيانية قيد التطوير" : "Charts coming soon..."}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? "تقارير الحضور" : "Attendance Reports"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {isRTL ? "التقارير التفصيلية قيد التطوير" : "Detailed reports coming soon..."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

