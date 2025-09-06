"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Bell,
  MessageSquare,
  Phone,
  Mail
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Visit, Delegate, VisitAlert } from "@/types/visits"
import { 
  getUpcomingVisits, 
  getVisitsByDelegate, 
  createVisit, 
  updateVisit,
  getUnreadAlerts,
  markAlertAsRead,
  checkLateVisits,
  checkExceededTimeVisits
} from "@/lib/visits"

export function VisitsTab() {
  const { t } = useLanguage()
  const [visits, setVisits] = useState<Visit[]>([])
  const [alerts, setAlerts] = useState<VisitAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Mock delegates data - in real app, this would come from API
  const delegates = [
    { id: "1", name: "Mike Johnson", email: "mike.johnson@company.com", phone: "+1 (555) 123-4567", role: "driver", status: "available" },
    { id: "2", name: "Sarah Wilson", email: "sarah.wilson@company.com", phone: "+1 (555) 234-5678", role: "supervisor", status: "busy" },
    { id: "3", name: "David Chen", email: "david.chen@company.com", phone: "+1 (555) 345-6789", role: "technician", status: "available" },
  ]

  const [newVisit, setNewVisit] = useState({
    delegate_id: "",
    delegate_name: "",
    customer_id: "",
    customer_name: "",
    customer_address: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    visit_type: "delivery",
    priority: "medium",
    notes: "",
    allowed_duration_minutes: 60
  })

  useEffect(() => {
    loadVisits()
    loadAlerts()
    startMonitoring()
  }, [])

  const loadVisits = async () => {
    setLoading(true)
    try {
      // In real app, this would fetch from API
      const mockVisits: Visit[] = [
        {
          id: "1",
          delegate_id: "1",
          delegate_name: "Mike Johnson",
          customer_id: "1",
          customer_name: "ABC Corporation",
          customer_address: "123 Business St, Downtown",
          scheduled_start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          scheduled_end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
          status: "scheduled",
          visit_type: "delivery",
          priority: "high",
          notes: "Urgent delivery for VIP customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          allowed_duration_minutes: 60,
          is_late: false,
          exceeds_time_limit: false
        },
        {
          id: "2",
          delegate_id: "2",
          delegate_name: "Sarah Wilson",
          customer_id: "2",
          customer_name: "XYZ Industries",
          customer_address: "456 Industrial Ave, North Zone",
          scheduled_start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          scheduled_end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          status: "late",
          visit_type: "inspection",
          priority: "medium",
          notes: "Regular maintenance inspection",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          allowed_duration_minutes: 90,
          is_late: true,
          exceeds_time_limit: false
        },
        {
          id: "3",
          delegate_id: "3",
          delegate_name: "David Chen",
          customer_id: "3",
          customer_name: "Tech Solutions Ltd",
          customer_address: "789 Innovation Blvd, East District",
          scheduled_start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          scheduled_end_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          status: "in_progress",
          visit_type: "meeting",
          priority: "low",
          notes: "Client meeting to discuss new requirements",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          allowed_duration_minutes: 60,
          actual_start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_late: false,
          exceeds_time_limit: true
        }
      ]
      setVisits(mockVisits)
    } catch (error) {
      console.error('Error loading visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      // In real app, this would fetch from API
      const mockAlerts: VisitAlert[] = [
        {
          id: "1",
          visit_id: "2",
          delegate_id: "2",
          alert_type: "late_arrival",
          severity: "high",
          message: "Delegate Sarah Wilson is late for visit at XYZ Industries",
          is_read: false,
          created_at: new Date().toISOString(),
          admin_notified: false
        },
        {
          id: "2",
          visit_id: "3",
          delegate_id: "3",
          alert_type: "time_exceeded",
          severity: "medium",
          message: "Delegate David Chen has exceeded allowed time for visit at Tech Solutions Ltd",
          is_read: false,
          created_at: new Date().toISOString(),
          admin_notified: false
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const startMonitoring = () => {
    // Check for late visits every minute
    const interval = setInterval(async () => {
      try {
        await checkLateVisits()
        await checkExceededTimeVisits()
        loadVisits()
        loadAlerts()
      } catch (error) {
        console.error('Error in monitoring:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }

  const handleCreateVisit = async () => {
    try {
      const delegate = delegates.find(d => d.id === newVisit.delegate_id)
      if (!delegate) return

      const visitData = {
        ...newVisit,
        delegate_name: delegate.name,
        customer_id: "new-customer", // In real app, this would be selected from existing customers
      }

      // In real app, this would create the visit via API
      console.log('Creating visit:', visitData)
      
      setIsCreateModalOpen(false)
      setNewVisit({
        delegate_id: "",
        delegate_name: "",
        customer_id: "",
        customer_name: "",
        customer_address: "",
        scheduled_start_time: "",
        scheduled_end_time: "",
        visit_type: "delivery",
        priority: "medium",
        notes: "",
        allowed_duration_minutes: 60
      })
      loadVisits()
    } catch (error) {
      console.error('Error creating visit:', error)
    }
  }

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.delegate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.customer_address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || visit.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const unreadAlerts = alerts.filter(alert => !alert.is_read)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("visitManagement")}</h2>
          <p className="text-gray-600">{t("monitorDelegateVisits")}</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadAlerts.length} Alerts
            </Badge>
          )}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("scheduleVisit")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("scheduleVisit")}</DialogTitle>
                <DialogDescription>
                  {t("createNewVisit")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delegate">{t("delegate")}</Label>
                  <Select value={newVisit.delegate_id} onValueChange={(value) => {
                    const delegate = delegates.find(d => d.id === value)
                    setNewVisit(prev => ({ ...prev, delegate_id: value, delegate_name: delegate?.name || "" }))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDelegate")} />
                    </SelectTrigger>
                    <SelectContent>
                      {delegates.map(delegate => (
                        <SelectItem key={delegate.id} value={delegate.id}>
                          {delegate.name} ({delegate.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">{t("customerName")}</Label>
                  <Input
                    id="customer"
                    value={newVisit.customer_name}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder={t("enterCustomerName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("customerAddress")}</Label>
                  <Input
                    id="address"
                    value={newVisit.customer_address}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_address: e.target.value }))}
                    placeholder={t("enterCustomerAddress")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t("visitType")}</Label>
                  <Select value={newVisit.visit_type} onValueChange={(value) => setNewVisit(prev => ({ ...prev, visit_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">{t("delivery")}</SelectItem>
                      <SelectItem value="pickup">{t("pickup")}</SelectItem>
                      <SelectItem value="inspection">{t("inspection")}</SelectItem>
                      <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                      <SelectItem value="meeting">{t("meeting")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select value={newVisit.priority} onValueChange={(value) => setNewVisit(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                      <SelectItem value="urgent">{t("urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">{t("duration")}</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newVisit.allowed_duration_minutes}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, allowed_duration_minutes: parseInt(e.target.value) }))}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">{t("startTime")}</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={newVisit.scheduled_start_time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">{t("endTime")}</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={newVisit.scheduled_end_time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, scheduled_end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t("additionalNotes")}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreateVisit}>
                  {t("scheduleVisit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts Section */}
      {unreadAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">Active Alerts ({unreadAlerts.length})</p>
              {unreadAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAlertAsRead(alert.id)}
                  >
                    Mark as Read
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search visits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.map(visit => (
          <Card key={visit.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{visit.customer_name}</h3>
                    <Badge className={getStatusColor(visit.status)}>
                      {visit.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(visit.priority)}>
                      {visit.priority.toUpperCase()}
                    </Badge>
                    {visit.is_late && (
                      <Badge variant="destructive">LATE</Badge>
                    )}
                    {visit.exceeds_time_limit && (
                      <Badge variant="destructive">TIME EXCEEDED</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{visit.delegate_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{visit.customer_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(visit.scheduled_start_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {visit.notes && (
                    <p className="text-sm text-gray-600 mt-2">{visit.notes}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVisit(visit)
                      setIsDetailsModalOpen(true)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visit Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer</Label>
                  <p className="text-lg font-semibold">{selectedVisit.customer_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Delegate</Label>
                  <p className="text-lg font-semibold">{selectedVisit.delegate_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Visit Type</Label>
                  <p className="capitalize">{selectedVisit.visit_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge className={getPriorityColor(selectedVisit.priority)}>
                    {selectedVisit.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Scheduled Start</Label>
                  <p>{new Date(selectedVisit.scheduled_start_time).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Scheduled End</Label>
                  <p>{new Date(selectedVisit.scheduled_end_time).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p>{selectedVisit.customer_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Allowed Duration</Label>
                  <p>{selectedVisit.allowed_duration_minutes} minutes</p>
                </div>
              </div>
              
              {selectedVisit.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="bg-gray-50 p-3 rounded">{selectedVisit.notes}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(selectedVisit.status)}>
                  {selectedVisit.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {selectedVisit.is_late && (
                  <Badge variant="destructive">LATE</Badge>
                )}
                {selectedVisit.exceeds_time_limit && (
                  <Badge variant="destructive">TIME EXCEEDED</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
