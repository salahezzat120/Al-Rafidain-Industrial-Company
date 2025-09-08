'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
  TrendingUp,
  BarChart3,
  FileText,
  Coffee,
  Moon,
  Sun,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, Attendance, CreateAttendanceData, UpdateAttendanceData, AttendanceStats } from '@/types/employees'
import { getEmployeeAttendance, createAttendance, updateAttendance, getAttendanceStats } from '@/lib/employees'

interface AttendanceModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AttendanceModal({ employee, open, onOpenChange }: AttendanceModalProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const [newAttendance, setNewAttendance] = useState<CreateAttendanceData>({
    employee_id: employee.id,
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    break_start_time: '',
    break_end_time: '',
    total_hours: 0,
    overtime_hours: 0,
    status: 'present',
    notes: ''
  })

  useEffect(() => {
    if (open) {
      fetchAttendance()
      fetchStats()
    }
  }, [open, employee.id, dateRange])

  const fetchAttendance = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await getEmployeeAttendance(employee.id, dateRange.start, dateRange.end)
      if (error) {
        setError(error)
        toast.error('Failed to fetch attendance')
        return
      }
      setAttendances(data || [])
    } catch (err) {
      setError('An unexpected error occurred')
      toast.error('Failed to fetch attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await getAttendanceStats(employee.id, dateRange.start, dateRange.end)
      if (error) {
        console.error('Failed to fetch stats:', error)
        return
      }
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleAddAttendance = async () => {
    if (!newAttendance.date) {
      toast.error('Please select a date')
      return
    }

    setIsSaving(true)
    try {
      const { data, error } = await createAttendance(newAttendance)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setAttendances(prev => [data, ...prev])
        setNewAttendance({
          employee_id: employee.id,
          date: new Date().toISOString().split('T')[0],
          check_in_time: '',
          check_out_time: '',
          break_start_time: '',
          break_end_time: '',
          total_hours: 0,
          overtime_hours: 0,
          status: 'present',
          notes: ''
        })
        fetchStats()
        toast.success('Attendance record added successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateAttendance = async (attendance: Attendance) => {
    setIsSaving(true)
    try {
      const updateData: UpdateAttendanceData = {
        id: attendance.id,
        date: attendance.date,
        check_in_time: attendance.check_in_time,
        check_out_time: attendance.check_out_time,
        break_start_time: attendance.break_start_time,
        break_end_time: attendance.break_end_time,
        total_hours: attendance.total_hours,
        overtime_hours: attendance.overtime_hours,
        status: attendance.status,
        notes: attendance.notes
      }

      const { data, error } = await updateAttendance(updateData)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setAttendances(prev => prev.map(a => a.id === attendance.id ? data : a))
        setEditingAttendance(null)
        fetchStats()
        toast.success('Attendance record updated successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'half_day': return 'bg-blue-100 text-blue-800'
      case 'sick_leave': return 'bg-purple-100 text-purple-800'
      case 'vacation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />
      case 'late': return <Clock className="h-4 w-4" />
      case 'absent': return <X className="h-4 w-4" />
      case 'half_day': return <Sun className="h-4 w-4" />
      case 'sick_leave': return <User className="h-4 w-4" />
      case 'vacation': return <Moon className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A'
    return new Date(time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const calculateHours = (checkIn: string, checkOut: string, breakStart?: string, breakEnd?: string) => {
    if (!checkIn || !checkOut) return 0
    
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    let totalMs = end.getTime() - start.getTime()
    
    if (breakStart && breakEnd) {
      const breakStartTime = new Date(breakStart)
      const breakEndTime = new Date(breakEnd)
      const breakMs = breakEndTime.getTime() - breakStartTime.getTime()
      totalMs -= breakMs
    }
    
    return Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management - {employee.first_name} {employee.last_name}
          </DialogTitle>
          <DialogDescription>
            Track and manage employee attendance records
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Present</span>
                </div>
                <div className="text-2xl font-bold">{stats.presentDays}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}% rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Hours</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.overtimeHours.toFixed(1)}h overtime
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Attendance Rate</span>
                </div>
                <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalDays} total days
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Absences</span>
                </div>
                <div className="text-2xl font-bold">{stats.absentDays}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.sickLeaveDays + stats.vacationDays} leave days
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Attendance Record
            </CardTitle>
            <CardDescription>Record a new attendance entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAttendance.date}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={newAttendance.status} onValueChange={(value) => setNewAttendance(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                    <SelectItem value="sick_leave">Sick Leave</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_hours">Total Hours</Label>
                <Input
                  id="total_hours"
                  type="number"
                  step="0.25"
                  value={newAttendance.total_hours || ''}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, total_hours: e.target.value ? Number(e.target.value) : 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_time">Check In Time</Label>
                <Input
                  id="check_in_time"
                  type="time"
                  value={newAttendance.check_in_time}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, check_in_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_time">Check Out Time</Label>
                <Input
                  id="check_out_time"
                  type="time"
                  value={newAttendance.check_out_time}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, check_out_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="break_start_time">Break Start Time</Label>
                <Input
                  id="break_start_time"
                  type="time"
                  value={newAttendance.break_start_time}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, break_start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break_end_time">Break End Time</Label>
                <Input
                  id="break_end_time"
                  type="time"
                  value={newAttendance.break_end_time}
                  onChange={(e) => setNewAttendance(prev => ({ ...prev, break_end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAttendance.notes}
                onChange={(e) => setNewAttendance(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about attendance..."
                rows={2}
              />
            </div>

            <Button onClick={handleAddAttendance} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Attendance Record
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Attendance Records
            </CardTitle>
            <CardDescription>
              {attendances.length} record{attendances.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : attendances.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No attendance records</h3>
                <p className="text-muted-foreground">Add attendance records to track employee hours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendances.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{new Date(attendance.date).toLocaleDateString()}</h4>
                        <Badge className={getStatusColor(attendance.status)}>
                          {getStatusIcon(attendance.status)}
                          <span className="ml-1 capitalize">{attendance.status.replace('_', ' ')}</span>
                        </Badge>
                        {attendance.total_hours && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {attendance.total_hours}h
                          </Badge>
                        )}
                        {attendance.overtime_hours > 0 && (
                          <Badge variant="outline" className="text-xs text-orange-600">
                            <Zap className="h-3 w-3 mr-1" />
                            +{attendance.overtime_hours}h OT
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Check In:</span> {formatTime(attendance.check_in_time)}
                        </div>
                        <div>
                          <span className="font-medium">Check Out:</span> {formatTime(attendance.check_out_time)}
                        </div>
                        <div>
                          <span className="font-medium">Break:</span> {formatTime(attendance.break_start_time)} - {formatTime(attendance.break_end_time)}
                        </div>
                        <div>
                          <span className="font-medium">Notes:</span> {attendance.notes || 'None'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingAttendance === attendance.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateAttendance(attendance)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAttendance(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAttendance(attendance.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
