"use client"

import { useState, useEffect, useRef } from "react"
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
  Mail,
  Edit,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { 
  createVisit, 
  updateVisit, 
  getAllVisits,
  getUnreadAlerts,
  markAlertAsRead,
  checkLateVisits,
  checkExceededTimeVisits
} from "@/lib/visit-management-single"
import { getRepresentativeById } from "@/lib/warehouse"
import { getCustomerById } from "@/lib/customers"
import { CustomerSelectionDropdown } from "@/components/admin/customer-selection-dropdown"

interface VisitManagementRecord {
  id: string
  visit_id: string
  delegate_id: string
  delegate_name: string
  delegate_email?: string
  delegate_phone?: string
  delegate_role: string
  delegate_status: string
  customer_id: string
  customer_name: string
  customer_address: string
  customer_phone?: string
  customer_email?: string
  scheduled_start_time: string
  scheduled_end_time: string
  actual_start_time?: string
  actual_end_time?: string
  visit_type: string
  priority: string
  status: string
  allowed_duration_minutes: number
  is_late: boolean
  exceeds_time_limit: boolean
  notes?: string
  alert_type?: string
  alert_severity?: string
  alert_message?: string
  is_alert_read: boolean
  admin_notified: boolean
  internal_message?: string
  message_type?: string
  message_priority?: string
  is_message_read: boolean
  chat_message?: string
  chat_sender_id?: string
  chat_sender_name?: string
  chat_sender_role?: string
  chat_message_type?: string
  current_location?: string
  coverage_areas?: string[]
  transportation_type?: string
  license_number?: string
  emergency_contact?: string
  vehicle?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  read_at?: string
}

export function VisitManagementSingleTab() {
  const { t, isRTL } = useLanguage()
  const [visits, setVisits] = useState<VisitManagementRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<VisitManagementRecord | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("visits")
  
  // Scroll functionality state
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const createModalRef = useRef<HTMLDivElement>(null)
  const detailsModalRef = useRef<HTMLDivElement>(null)

  // Function to generate unique Visit ID
  const generateVisitId = () => {
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `V${timestamp}${random}`
  }

  // Function to lookup representative data
  const lookupRepresentative = async (delegateId: string) => {
    if (newVisit.delegate_role === 'representative' && delegateId.trim()) {
      try {
        console.log('🔍 Looking up representative with ID:', delegateId)
        const representative = await getRepresentativeById(delegateId)
        
        if (representative) {
          console.log('✅ Found representative:', representative)
          setNewVisit(prev => ({
            ...prev,
            delegate_name: representative.name || '',
            delegate_email: representative.email || '',
            delegate_phone: representative.phone || ''
          }))
          // Mark fields as auto-filled
          setAutoFilledFields(prev => ({
            ...prev,
            delegate_name: true,
            delegate_email: true,
            delegate_phone: true
          }))
        } else {
          console.log('❌ Representative not found with ID:', delegateId)
          // Clear the fields if representative not found
          setNewVisit(prev => ({
            ...prev,
            delegate_name: '',
            delegate_email: '',
            delegate_phone: ''
          }))
        }
      } catch (error) {
        console.error('❌ Error looking up representative:', error)
      }
    }
  }

  // Function to handle customer selection from dropdown
  const handleCustomerSelect = (customer: any) => {
    console.log('🔍 Customer selected:', customer)
    setSelectedCustomer(customer)
    
    if (customer) {
      // Auto-fill customer data
      setNewVisit(prev => ({
        ...prev,
        customer_id: customer.customer_id || '',
        customer_name: customer.name || '',
        customer_address: customer.address || '',
        customer_phone: customer.phone || '',
        customer_email: customer.email || ''
      }))
      
      // Mark fields as auto-filled
      setAutoFilledFields(prev => ({
        ...prev,
        customer_name: true,
        customer_address: true,
        customer_phone: true,
        customer_email: true
      }))
    } else {
      // Clear customer data if no customer selected
      setNewVisit(prev => ({
        ...prev,
        customer_id: '',
        customer_name: '',
        customer_address: '',
        customer_phone: '',
        customer_email: ''
      }))
      
      // Reset auto-filled flags
      setAutoFilledFields(prev => ({
        ...prev,
        customer_name: false,
        customer_address: false,
        customer_phone: false,
        customer_email: false
      }))
    }
  }

  // Function to lookup customer data (legacy - for manual ID entry)
  const lookupCustomer = async (customerId: string) => {
    if (customerId.trim()) {
      try {
        console.log('🔍 Looking up customer with ID:', customerId)
        const { data: customer, error } = await getCustomerById(customerId)
        
        if (customer && !error) {
          console.log('✅ Found customer:', customer)
          setNewVisit(prev => ({
            ...prev,
            customer_name: customer.name || '',
            customer_address: customer.address || '',
            customer_phone: customer.phone || '',
            customer_email: customer.email || ''
          }))
          // Mark fields as auto-filled
          setAutoFilledFields(prev => ({
            ...prev,
            customer_name: true,
            customer_address: true,
            customer_phone: true,
            customer_email: true
          }))
        } else {
          console.log('❌ Customer not found with ID:', customerId, 'Error:', error)
          
          // Clear the fields if customer not found
          setNewVisit(prev => ({
            ...prev,
            customer_name: '',
            customer_address: '',
            customer_phone: '',
            customer_email: ''
          }))
        }
      } catch (error) {
        console.error('❌ Error looking up customer:', error)
        
        // Clear fields on error
        setNewVisit(prev => ({
          ...prev,
          customer_name: '',
          customer_address: '',
          customer_phone: '',
          customer_email: ''
        }))
      }
    }
  }

  const [newVisit, setNewVisit] = useState({
    visit_id: generateVisitId(),
    delegate_id: "",
    delegate_name: "",
    delegate_email: "",
    delegate_phone: "",
    delegate_role: "representative",
    customer_id: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    customer_email: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    visit_type: "delivery",
    priority: "medium",
    notes: "",
    allowed_duration_minutes: 60
  })

  // Track which fields were auto-filled
  const [autoFilledFields, setAutoFilledFields] = useState({
    customer_name: false,
    customer_address: false,
    customer_phone: false,
    customer_email: false,
    delegate_name: false,
    delegate_email: false,
    delegate_phone: false
  })

  // Selected customer from dropdown
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  useEffect(() => {
    console.log('🔄 VisitManagementSingleTab: Component mounted, loading visits...')
    loadVisits()
    startMonitoring()
  }, [])

  // Track scroll progress for create modal
  useEffect(() => {
    const handleScroll = () => {
      if (createModalRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = createModalRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const modal = createModalRef.current;
    if (modal) {
      modal.addEventListener('scroll', handleScroll);
      return () => modal.removeEventListener('scroll', handleScroll);
    }
  }, [isCreateModalOpen]);

  // Show scroll hint when create modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      const timer = setTimeout(() => {
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCreateModalOpen]);

  const scrollToTop = () => {
    if (createModalRef.current) {
      createModalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (createModalRef.current) {
      createModalRef.current.scrollTo({ top: createModalRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToBottom();
      }
    }
  };

  const loadVisits = async () => {
    setLoading(true)
    try {
      const data = await getAllVisits()
      console.log('Loaded visits from database:', data)
      setVisits(data || [])
    } catch (error) {
      console.error('Error loading visits:', error)
      // Check if it's a Supabase client error
      if (error instanceof Error && error.message.includes('Supabase client is not available')) {
        console.log('🔧 Supabase client not available - showing setup instructions')
      }
      // Fallback to empty array if database is not available
      setVisits([])
    } finally {
      setLoading(false)
    }
  }

  const startMonitoring = () => {
    // Check for late visits every minute
    const interval = setInterval(async () => {
      try {
        await checkLateVisits()
        await checkExceededTimeVisits()
        loadVisits()
      } catch (error) {
        console.error('Error in monitoring:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }

  const handleCreateVisit = async () => {
    try {
      const visitData = {
        ...newVisit,
        delegate_status: 'available',
        status: 'scheduled',
        is_late: false,
        exceeds_time_limit: false,
        is_alert_read: false,
        admin_notified: false,
        is_message_read: false
      }

      await createVisit(visitData)
      
      setIsCreateModalOpen(false)
      setNewVisit({
        visit_id: generateVisitId(),
        delegate_id: "",
        delegate_name: "",
        delegate_email: "",
        delegate_phone: "",
        delegate_role: "representative",
        customer_id: "",
        customer_name: "",
        customer_address: "",
        customer_phone: "",
        customer_email: "",
        scheduled_start_time: "",
        scheduled_end_time: "",
        visit_type: "delivery",
        priority: "medium",
        notes: "",
        allowed_duration_minutes: 60
      })
      // Reset auto-filled flags
      setAutoFilledFields({
        customer_name: false,
        customer_address: false,
        customer_phone: false,
        customer_email: false,
        delegate_name: false,
        delegate_email: false,
        delegate_phone: false
      })
      setSelectedCustomer(null)
      loadVisits()
    } catch (error) {
      console.error('Error creating visit:', error)
    }
  }

  const handleStatusChange = async (visitId: string, status: string) => {
    try {
      await updateVisit(visitId, { status })
      loadVisits()
    } catch (error) {
      console.error('Error updating visit status:', error)
    }
  }

  const handleMarkAlertAsRead = async (visitId: string) => {
    try {
      await markAlertAsRead(visitId)
      loadVisits()
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
      visit.customer_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || visit.status === filterStatus
    const matchesType = filterType === "all" || visit.visit_type === filterType
    const matchesPriority = filterPriority === "all" || visit.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const unreadAlerts = visits.filter(visit => visit.alert_type && !visit.is_alert_read)

  console.log('🎯 VisitManagementSingleTab: Rendering with', visits.length, 'visits')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إدارة الزيارات' : 'Visit Management'}
          </h2>
          <p className="text-gray-600">
            {isRTL ? 'إدارة جميع الزيارات والمندوبين والاتصالات في مكان واحد' : 'Manage all visits, delegates, and communications in one place'}
          </p>
          <p className="text-sm text-gray-500">
            {isRTL ? 'سجلات قاعدة البيانات:' : 'Database records:'} {visits.length}
          </p>
        </div>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadAlerts.length} {isRTL ? 'تنبيهات' : 'Alerts'}
            </Badge>
          )}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة زيارة' : 'Add Visit'}
              </Button>
            </DialogTrigger>
            <DialogContent 
              ref={createModalRef} 
              onKeyDown={handleKeyDown}
              className="max-w-6xl max-h-[95vh] overflow-hidden"
            >
              {/* Scroll progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-30 rounded-t-[20px]">
                <div 
                  className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-150 ease-out rounded-t-[20px]"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
              
              <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
                <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? 'إضافة زيارة جديدة' : 'Add New Visit'}
                </DialogTitle>
                <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? 'إنشاء زيارة جديدة مع معلومات المندوب والعميل' : 'Create a new visit with delegate and customer information'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-6">
                <div className="py-6">
                  <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit_id" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'معرف الزيارة (يتم إنشاؤه تلقائياً)' : 'Visit ID (Auto-generated)'}
                  </Label>
                  <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Input
                      id="visit_id"
                      value={newVisit.visit_id}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                      placeholder={isRTL ? 'يتم إنشاؤه تلقائياً' : 'Auto-generated'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewVisit(prev => ({ ...prev, visit_id: generateVisitId() }))}
                      title={isRTL ? 'إنشاء معرف زيارة جديد' : 'Generate new Visit ID'}
                    >
                      🔄
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegate_id" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'معرف المندوب' : 'Delegate ID'}
                  </Label>
                  <Input
                    id="delegate_id"
                    value={newVisit.delegate_id}
                    onChange={(e) => {
                      const value = e.target.value
                      setNewVisit(prev => ({ ...prev, delegate_id: value }))
                      // Trigger lookup when delegate role is representative
                      if (newVisit.delegate_role === 'representative') {
                        lookupRepresentative(value)
                      }
                    }}
                    placeholder="REP001"
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegate_name" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'اسم المندوب' : 'Delegate Name'} {autoFilledFields.delegate_name ? (isRTL ? '(تم ملؤه تلقائياً)' : '(Auto-filled)') : ''}
                  </Label>
                  <Input
                    id="delegate_name"
                    value={newVisit.delegate_name}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, delegate_name: e.target.value }))}
                    placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
                    readOnly={autoFilledFields.delegate_name}
                    className={`${autoFilledFields.delegate_name ? 'bg-gray-50' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegate_email" className={isRTL ? 'text-right' : 'text-left'}>
                    {isRTL ? 'بريد المندوب الإلكتروني' : 'Delegate Email'} {autoFilledFields.delegate_email ? (isRTL ? '(تم ملؤه تلقائياً)' : '(Auto-filled)') : ''}
                  </Label>
                  <Input
                    id="delegate_email"
                    type="email"
                    value={newVisit.delegate_email}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, delegate_email: e.target.value }))}
                    placeholder="john@company.com"
                    readOnly={autoFilledFields.delegate_email}
                    className={autoFilledFields.delegate_email ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegate_phone">Delegate Phone {autoFilledFields.delegate_phone ? '(Auto-filled)' : ''}</Label>
                  <Input
                    id="delegate_phone"
                    value={newVisit.delegate_phone}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, delegate_phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    readOnly={autoFilledFields.delegate_phone}
                    className={autoFilledFields.delegate_phone ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegate_role">Delegate Role</Label>
                  <Select value={newVisit.delegate_role} onValueChange={(value) => {
                    setNewVisit(prev => ({ ...prev, delegate_role: value }))
                    // Trigger lookup if role is representative and delegate_id is provided
                    if (value === 'representative' && newVisit.delegate_id.trim()) {
                      lookupRepresentative(newVisit.delegate_id)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="representative">Representative</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <CustomerSelectionDropdown
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={handleCustomerSelect}
                    placeholder="Select customer..."
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name {autoFilledFields.customer_name ? '(Auto-filled)' : ''}</Label>
                  <Input
                    id="customer_name"
                    value={newVisit.customer_name}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="ABC Corporation"
                    readOnly={autoFilledFields.customer_name}
                    className={autoFilledFields.customer_name ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_address">Customer Address {autoFilledFields.customer_address ? '(Auto-filled)' : ''}</Label>
                  <Input
                    id="customer_address"
                    value={newVisit.customer_address}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_address: e.target.value }))}
                    placeholder="123 Business St, Downtown"
                    readOnly={autoFilledFields.customer_address}
                    className={autoFilledFields.customer_address ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Customer Phone {autoFilledFields.customer_phone ? '(Auto-filled)' : ''}</Label>
                  <Input
                    id="customer_phone"
                    value={newVisit.customer_phone}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="+1 (555) 987-6543"
                    readOnly={autoFilledFields.customer_phone}
                    className={autoFilledFields.customer_phone ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Customer Email {autoFilledFields.customer_email ? '(Auto-filled)' : ''}</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={newVisit.customer_email}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, customer_email: e.target.value }))}
                    placeholder="customer@example.com"
                    readOnly={autoFilledFields.customer_email}
                    className={autoFilledFields.customer_email ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit_type">Visit Type</Label>
                  <Select value={newVisit.visit_type} onValueChange={(value) => setNewVisit(prev => ({ ...prev, visit_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newVisit.priority} onValueChange={(value) => setNewVisit(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newVisit.allowed_duration_minutes}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, allowed_duration_minutes: parseInt(e.target.value) }))}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={newVisit.scheduled_start_time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={newVisit.scheduled_end_time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, scheduled_end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
                  </div>
                </div>
              </div>
              
              <DialogFooter className="px-6">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleCreateVisit}>
                  {isRTL ? 'إنشاء الزيارة' : 'Create Visit'}
                </Button>
              </DialogFooter>
              
              {/* Scroll hint overlay */}
              {showScrollHint && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-30 animate-in fade-in duration-500">
                  <div className="bg-white/95 px-6 py-4 rounded-xl shadow-xl border border-gray-200 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="font-medium">{isRTL ? 'مرر لأسفل لرؤية جميع أقسام النموذج' : 'Scroll down to see all form sections'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll indicator - only show when at top */}
              {scrollProgress < 10 && !showScrollHint && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 backdrop-blur-sm animate-in fade-in duration-300 z-30">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="font-medium">{isRTL ? 'مرر للاستكشاف' : 'Scroll to explore'}</span>
                </div>
              )}
              
              {/* Scroll navigation buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-40">
                {/* Scroll to top - only show when scrolled down */}
                {scrollProgress > 5 && (
                  <Button
                    onClick={scrollToTop}
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
                    title={isRTL ? 'التمرير إلى الأعلى (Ctrl+Home)' : 'Scroll to top (Ctrl+Home)'}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                )}
                
                {/* Scroll to bottom - only show when not at bottom */}
                {scrollProgress < 95 && (
                  <Button
                    onClick={scrollToBottom}
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
                    title={isRTL ? 'التمرير إلى الأسفل (Ctrl+End)' : 'Scroll to bottom (Ctrl+End)'}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                )}
              </div>
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
              <p className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'التنبيهات النشطة' : 'Active Alerts'} ({unreadAlerts.length})
              </p>
              {unreadAlerts.map(visit => (
                <div key={visit.id} className={`flex items-center justify-between p-2 bg-white rounded border ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm font-medium">
                      {visit.alert_message ? (
                        visit.alert_message.includes('exceeded allowed time') ? (
                          isRTL ? 
                            `المندوب ${visit.delegate_name} تجاوز الوقت المسموح للزيارة في ${visit.customer_name}` :
                            `Delegate ${visit.delegate_name} has exceeded allowed time for visit at ${visit.customer_name}`
                        ) : visit.alert_message.includes('is late for visit') ? (
                          isRTL ? 
                            `المندوب ${visit.delegate_name} متأخر للزيارة في ${visit.customer_name}` :
                            `Delegate ${visit.delegate_name} is late for visit at ${visit.customer_name}`
                        ) : visit.alert_message
                      ) : (
                        isRTL ? 'تنبيه غير محدد' : 'Unspecified alert'
                      )}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(visit.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAlertAsRead(visit.id)}
                    className={isRTL ? 'mr-2' : 'ml-2'}
                  >
                    {isRTL ? 'تمييز كمقروء' : 'Mark as Read'}
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search visits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading visits...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && filteredVisits.length === 0 && (
        <div className="text-center p-8">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No visits found</h3>
            <p className="text-sm">Create your first visit to get started</p>
          </div>
        </div>
      )}

      {/* Supabase Setup Message */}
      {!loading && filteredVisits.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Database Connection Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>To use the Visit Management system, you need to:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file with your Supabase credentials</li>
                  <li>Run the database setup script in Supabase SQL Editor</li>
                  <li>Restart your development server</li>
                </ol>
                <p className="mt-2">
                  <strong>Quick fix:</strong> Check the <code className="bg-yellow-100 px-1 rounded">QUICK_FIX_INSTRUCTIONS.md</code> file for detailed steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits List */}
      {!loading && filteredVisits.length > 0 && (
        <div className="space-y-4">
          {filteredVisits.map(visit => (
          <Card key={visit.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{visit.visit_id} - {visit.customer_name}</h3>
                    <Badge className={getStatusColor(visit.status)}>
                      {visit.status === 'in_progress' ? (isRTL ? 'قيد التنفيذ' : 'IN PROGRESS') :
                       visit.status === 'completed' ? (isRTL ? 'مكتمل' : 'COMPLETED') :
                       visit.status === 'scheduled' ? (isRTL ? 'مجدول' : 'SCHEDULED') :
                       visit.status === 'cancelled' ? (isRTL ? 'ملغي' : 'CANCELLED') :
                       visit.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(visit.priority)}>
                      {visit.priority === 'high' ? (isRTL ? 'عالي' : 'HIGH') :
                       visit.priority === 'medium' ? (isRTL ? 'متوسط' : 'MEDIUM') :
                       visit.priority === 'low' ? (isRTL ? 'منخفض' : 'LOW') :
                       visit.priority.toUpperCase()}
                    </Badge>
                    {visit.is_late && (
                      <Badge variant="destructive">
                        {isRTL ? 'متأخر' : 'LATE'}
                      </Badge>
                    )}
                    {visit.exceeds_time_limit && (
                      <Badge variant="destructive">
                        {isRTL ? 'تجاوز الوقت' : 'TIME EXCEEDED'}
                      </Badge>
                    )}
                    {visit.alert_type && !visit.is_alert_read && (
                      <Badge variant="destructive">
                        {isRTL ? 'تنبيه' : 'ALERT'}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{visit.delegate_name} ({visit.delegate_role})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{visit.customer_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Start: {new Date(visit.scheduled_start_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        End: {new Date(visit.scheduled_end_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-gray-600 mt-2">{visit.notes}</p>
                  )}
                  {visit.alert_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className={`text-sm text-red-800 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'تنبيه:' : 'Alert:'} {
                          visit.alert_message.includes('exceeded allowed time') ? (
                            isRTL ? 
                              `المندوب ${visit.delegate_name} تجاوز الوقت المسموح للزيارة في ${visit.customer_name}` :
                              `Delegate ${visit.delegate_name} has exceeded allowed time for visit at ${visit.customer_name}`
                          ) : visit.alert_message.includes('is late for visit') ? (
                            isRTL ? 
                              `المندوب ${visit.delegate_name} متأخر للزيارة في ${visit.customer_name}` :
                              `Delegate ${visit.delegate_name} is late for visit at ${visit.customer_name}`
                          ) : visit.alert_message
                        }
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={visit.status} onValueChange={(value) => handleStatusChange(visit.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVisit(visit)
                      setIsDetailsModalOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Visit Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent 
          ref={detailsModalRef} 
          className="max-w-6xl max-h-[95vh] overflow-hidden"
        >
          {/* Scroll progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-30 rounded-t-[20px]">
            <div 
              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-150 ease-out rounded-t-[20px]"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          
          <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isRTL ? 'تفاصيل الزيارة' : 'Visit Details'} - {selectedVisit?.visit_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-6">
              <div className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Visit ID</Label>
                  <p className="text-lg font-semibold">{selectedVisit.visit_id}</p>
                </div>
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
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedVisit.status)}>
                    {selectedVisit.status.replace('_', ' ').toUpperCase()}
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
                {selectedVisit.actual_start_time && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Actual Start</Label>
                    <p>{new Date(selectedVisit.actual_start_time).toLocaleString()}</p>
                  </div>
                )}
                {selectedVisit.actual_end_time && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Actual End</Label>
                    <p>{new Date(selectedVisit.actual_end_time).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p>{selectedVisit.customer_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Duration</Label>
                  <p>{selectedVisit.allowed_duration_minutes} minutes</p>
                </div>
              </div>
              
              {selectedVisit.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="bg-gray-50 p-3 rounded">{selectedVisit.notes}</p>
                </div>
              )}

              {selectedVisit.alert_message && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Alert</Label>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-red-800 font-medium">{selectedVisit.alert_message}</p>
                  </div>
                </div>
              )}

              {selectedVisit.internal_message && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Internal Message</Label>
                  <p className="bg-blue-50 p-3 rounded">{selectedVisit.internal_message}</p>
                </div>
              )}

              {selectedVisit.chat_message && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Chat Message</Label>
                  <p className="bg-green-50 p-3 rounded">{selectedVisit.chat_message}</p>
                </div>
              )}
              </div>
            </div>
          )}
          
          {/* Scroll navigation buttons for details modal */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-40">
            {/* Scroll to top - only show when scrolled down */}
            {scrollProgress > 5 && (
              <Button
                onClick={() => {
                  if (detailsModalRef.current) {
                    detailsModalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
                title={isRTL ? 'التمرير إلى الأعلى (Ctrl+Home)' : 'Scroll to top (Ctrl+Home)'}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}
            
            {/* Scroll to bottom - only show when not at bottom */}
            {scrollProgress < 95 && (
              <Button
                onClick={() => {
                  if (detailsModalRef.current) {
                    detailsModalRef.current.scrollTo({ top: detailsModalRef.current.scrollHeight, behavior: 'smooth' });
                  }
                }}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
                title={isRTL ? 'التمرير إلى الأسفل (Ctrl+End)' : 'Scroll to bottom (Ctrl+End)'}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
