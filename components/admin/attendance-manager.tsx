"use client"

import { useEffect, useState, useMemo } from "react"
import { getAttendanceRecords, getRepresentativeLiveLocations } from "@/lib/representative-live-locations"
import { AttendanceWithRepresentative, RepresentativeWithLocation } from "@/types/representative-live-locations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle,
  XCircle,
  Coffee,
  AlertCircle,
  Users,
  Activity,
  Timer,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  Plus,
  Edit,
  Save,
  X
} from "lucide-react"
import { AttendanceLocationMap } from "@/components/ui/attendance-location-map"
import { useLanguage } from "@/contexts/language-context"
import { format, isToday, parseISO, differenceInHours, differenceInMinutes } from "date-fns"
import { cn } from "@/lib/utils"

export default function AttendanceManager() {
  const { t, isRTL } = useLanguage()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithRepresentative[]>([])
  const [representatives, setRepresentatives] = useState<RepresentativeWithLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("live")
  const [selectedRepresentative, setSelectedRepresentative] = useState<RepresentativeWithLocation | null>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [attendanceRes, representativesRes] = await Promise.all([
        getAttendanceRecords(),
        getRepresentativeLiveLocations()
      ])
      
      if (attendanceRes.error) {
        setError(attendanceRes.error)
      } else {
        setAttendanceRecords(attendanceRes.data || [])
      }
      
      if (representativesRes.error) {
        console.error('Error fetching representatives:', representativesRes.error)
      } else {
        setRepresentatives(representativesRes.data || [])
      }
    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const liveRepresentatives = useMemo(() => {
    return representatives.filter(rep => rep.is_online)
  }, [representatives])

  const todayAttendance = useMemo(() => {
    return attendanceRecords.filter(record => 
      record.check_in_time && isToday(parseISO(record.check_in_time))
    )
  }, [attendanceRecords])

  const filteredRepresentatives = useMemo(() => {
    return representatives.filter(rep => {
      const matchesSearch = 
        rep.representative_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.representative_phone?.includes(searchTerm) ||
        rep.representative_id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "online" && rep.is_online) ||
        (statusFilter === "offline" && !rep.is_online)
      
      return matchesSearch && matchesStatus
    })
  }, [representatives, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const totalReps = representatives.length
    const onlineReps = liveRepresentatives.length
    const checkedInToday = todayAttendance.filter(r => r.status === 'checked_in').length
    const checkedOutToday = todayAttendance.filter(r => r.status === 'checked_out').length
    const onBreakToday = todayAttendance.filter(r => r.status === 'break').length
    
    return { totalReps, onlineReps, checkedInToday, checkedOutToday, onBreakToday }
  }, [representatives, liveRepresentatives, todayAttendance])

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

  const getRepresentativeAttendanceStatus = (repId: string) => {
    const todayRecord = todayAttendance.find(r => r.representative_id === repId)
    return todayRecord ? todayRecord.status : 'not_checked_in'
  }

  const handleCheckIn = (representative: RepresentativeWithLocation) => {
    setSelectedRepresentative(representative)
    setShowCheckInModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
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
            <Activity className="h-8 w-8" />
            {isRTL ? "مدير الحضور" : "Attendance Manager"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isRTL ? "إدارة الحضور في الوقت الفعلي" : "Real-time attendance management"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{isRTL ? "إجمالي المندوبين" : "Total Representatives"}</p>
                <p className="text-3xl font-bold">{stats.totalReps}</p>
                <p className="text-blue-100 text-xs mt-1">{isRTL ? "مندوب" : "representatives"}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{isRTL ? "متصل الآن" : "Currently Online"}</p>
                <p className="text-3xl font-bold">{stats.onlineReps}</p>
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
                <p className="text-purple-100 text-sm font-medium">{isRTL ? "حاضر اليوم" : "Present Today"}</p>
                <p className="text-3xl font-bold">{stats.checkedInToday}</p>
                <p className="text-purple-100 text-xs mt-1">{isRTL ? "مندوب" : "representatives"}</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{isRTL ? "في الاستراحة" : "On Break"}</p>
                <p className="text-3xl font-bold">{stats.onBreakToday}</p>
                <p className="text-orange-100 text-xs mt-1">{isRTL ? "مندوب" : "representatives"}</p>
              </div>
              <Coffee className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">{isRTL ? "مباشر" : "Live"}</TabsTrigger>
          <TabsTrigger value="attendance">{isRTL ? "الحضور" : "Attendance"}</TabsTrigger>
          <TabsTrigger value="reports">{isRTL ? "التقارير" : "Reports"}</TabsTrigger>
        </TabsList>

        {/* Live Tab */}
        <TabsContent value="live" className="space-y-6">
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
                    <SelectItem value="online">{isRTL ? "متصل" : "Online"}</SelectItem>
                    <SelectItem value="offline">{isRTL ? "غير متصل" : "Offline"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Representatives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepresentatives.map((rep) => {
              const attendanceStatus = getRepresentativeAttendanceStatus(rep.representative_id)
              const isOnline = rep.is_online
              
              return (
                <Card key={rep.representative_id} className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  isOnline ? "border-green-200 bg-green-50" : "border-gray-200"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          isOnline ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <User className={cn(
                            "h-5 w-5",
                            isOnline ? "text-green-600" : "text-gray-600"
                          )} />
                        </div>
                        <div>
                          <div className="font-medium">{rep.representative_name || rep.representative_id}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {rep.representative_phone || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        )} />
                        <span className="text-xs text-gray-500">
                          {isOnline ? (isRTL ? "متصل" : "Online") : (isRTL ? "غير متصل" : "Offline")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{isRTL ? "حالة الحضور:" : "Attendance:"}</span>
                        {attendanceStatus === 'not_checked_in' ? (
                          <Badge variant="outline" className="text-gray-600">
                            {isRTL ? "لم يحضر" : "Not Checked In"}
                          </Badge>
                        ) : (
                          getStatusBadge(attendanceStatus)
                        )}
                      </div>
                      
                      {rep.last_seen && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{isRTL ? "آخر ظهور:" : "Last seen:"}</span>
                          <span className="text-sm text-gray-500">
                            {formatTime(rep.last_seen)}
                          </span>
                        </div>
                      )}
                      
                      {rep.latitude && rep.longitude && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{isRTL ? "الموقع:" : "Location:"}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {rep.latitude.toFixed(4)}, {rep.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      {attendanceStatus === 'not_checked_in' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleCheckIn(rep)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {isRTL ? "تسجيل حضور" : "Check In"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        {isRTL ? "عرض" : "View"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {isRTL ? "سجلات الحضور اليوم" : "Today's Attendance Records"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayAttendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {isRTL ? "لا توجد سجلات حضور اليوم" : "No attendance records for today"}
                  </div>
                ) : (
                  todayAttendance.map((record) => (
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
                              {record.check_out_time ? 
                                `${differenceInHours(parseISO(record.check_out_time), parseISO(record.check_in_time))}h` : 
                                "Ongoing"
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(parseISO(record.check_in_time), "MMM dd")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(record.status)}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
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

      {/* Check In Modal */}
      {showCheckInModal && selectedRepresentative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {isRTL ? "تسجيل حضور" : "Check In"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCheckInModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">{selectedRepresentative.representative_name || selectedRepresentative.representative_id}</h3>
                <p className="text-gray-500">{selectedRepresentative.representative_phone || "N/A"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{isRTL ? "الوقت الحالي" : "Current Time"}</label>
                <div className="text-lg font-mono bg-gray-100 p-3 rounded-md text-center">
                  {format(new Date(), "HH:mm:ss")}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{isRTL ? "الموقع" : "Location"}</label>
                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                  {selectedRepresentative.latitude && selectedRepresentative.longitude ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedRepresentative.latitude.toFixed(6)}, {selectedRepresentative.longitude.toFixed(6)}
                    </div>
                  ) : (
                    "Location not available"
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // Handle check in logic here
                    setShowCheckInModal(false)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isRTL ? "تأكيد الحضور" : "Confirm Check In"}
                </Button>
                <Button variant="outline" onClick={() => setShowCheckInModal(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

