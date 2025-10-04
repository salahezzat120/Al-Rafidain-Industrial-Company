"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Headphones, 
  AlertTriangle, 
  Wrench, 
  Shield, 
  Calendar,
  Users,
  Clock,
  Star,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  StarIcon,
  User,
  Navigation
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { 
  CustomerInquiry, 
  Complaint, 
  MaintenanceRequest, 
  Warranty, 
  WarrantyClaim, 
  FollowUpService,
  AfterSalesMetrics 
} from "@/types/after-sales"
import { 
  getCustomerInquiries,
  getComplaints,
  getMaintenanceRequests,
  getWarranties,
  getWarrantyClaims,
  getFollowUpServices,
  getAfterSalesMetrics,
  createCustomerInquiry,
  createComplaint,
  createMaintenanceRequest,
  createWarranty,
  createFollowUpService
} from "@/lib/after-sales"
import { CustomerProfileModal } from "./customer-profile-modal"
import { LiveTrackingModal } from "./live-tracking-modal"
import { AssignTaskModal } from "./assign-task-modal"
import { SendMessageModal } from "./send-message-modal"

export function AfterSalesTab() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<AfterSalesMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  // Data states
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([])
  const [followUpServices, setFollowUpServices] = useState<FollowUpService[]>([])

  // New support case dialog state
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false)
  const [newCaseType, setNewCaseType] = useState<'inquiry' | 'complaint' | 'maintenance' | 'warranty' | 'followup'>('inquiry')
  const [isCreating, setIsCreating] = useState(false)

  // View and edit dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [selectedCaseType, setSelectedCaseType] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Rating state
  const [ratingCase, setRatingCase] = useState<any>(null)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // New modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  // Form data for new case
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    inquiry_type: 'general' as 'general' | 'technical' | 'billing' | 'warranty' | 'complaint' | 'maintenance',
    complaint_type: 'other' as 'product_quality' | 'delivery_issue' | 'service_quality' | 'billing_error' | 'communication' | 'other',
    request_type: 'preventive' as 'preventive' | 'corrective' | 'emergency' | 'warranty' | 'upgrade',
    service_type: 'satisfaction_survey' as 'satisfaction_survey' | 'product_training' | 'maintenance_reminder' | 'upgrade_offer' | 'feedback_collection',
    warranty_type: 'standard' as 'standard' | 'extended' | 'premium',
    product_name: '',
    order_id: '',
    scheduled_date: '',
    coverage_details: '',
    terms_conditions: ''
  })

  useEffect(() => {
    loadData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadData()
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const calculateLocalCustomerSatisfaction = () => {
    const allRatings: number[] = []
    
    // Collect ratings from all local state
    inquiries.forEach(inquiry => {
      if (inquiry.customer_satisfaction_rating && inquiry.customer_satisfaction_rating > 0) {
        allRatings.push(inquiry.customer_satisfaction_rating)
      }
    })
    
    complaints.forEach(complaint => {
      if (complaint.customer_satisfaction_rating && complaint.customer_satisfaction_rating > 0) {
        allRatings.push(complaint.customer_satisfaction_rating)
      }
    })
    
    maintenanceRequests.forEach(maintenance => {
      if (maintenance.customer_satisfaction_rating && maintenance.customer_satisfaction_rating > 0) {
        allRatings.push(maintenance.customer_satisfaction_rating)
      }
    })
    
    warranties.forEach(warranty => {
      if (warranty.customer_satisfaction_rating && warranty.customer_satisfaction_rating > 0) {
        allRatings.push(warranty.customer_satisfaction_rating)
      }
    })
    
    followUpServices.forEach(followUp => {
      if (followUp.customer_satisfaction_rating && followUp.customer_satisfaction_rating > 0) {
        allRatings.push(followUp.customer_satisfaction_rating)
      }
    })

    // Calculate average
    return allRatings.length > 0 
      ? Math.round((allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length) * 10) / 10
      : 0
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [
        metricsData,
        inquiriesData,
        complaintsData,
        maintenanceData,
        warrantiesData,
        claimsData,
        followUpsData
      ] = await Promise.all([
        getAfterSalesMetrics().catch(err => {
          console.error('Error loading metrics:', err)
          return {
            total_inquiries: 0,
            resolved_inquiries: 0,
            average_resolution_time_hours: 0,
            customer_satisfaction_score: 0,
            total_complaints: 0,
            resolved_complaints: 0,
            complaint_escalation_rate: 0,
            total_maintenance_requests: 0,
            completed_maintenance_requests: 0,
            average_maintenance_cost: 0,
            active_warranties: 0,
            warranty_claims_count: 0,
            warranty_claim_approval_rate: 0,
            scheduled_follow_ups: 0,
            completed_follow_ups: 0,
            customer_retention_rate: 0
          }
        }),
        getCustomerInquiries().catch(err => {
          console.error('Error loading inquiries:', err)
          return []
        }),
        getComplaints().catch(err => {
          console.error('Error loading complaints:', err)
          return []
        }),
        getMaintenanceRequests().catch(err => {
          console.error('Error loading maintenance:', err)
          return []
        }),
        getWarranties().catch(err => {
          console.error('Error loading warranties:', err)
          return []
        }),
        getWarrantyClaims().catch(err => {
          console.error('Error loading warranty claims:', err)
          return []
        }),
        getFollowUpServices().catch(err => {
          console.error('Error loading follow-ups:', err)
          return []
        })
      ])

      setMetrics(metricsData)
      setInquiries(inquiriesData || [])
      setComplaints(complaintsData || [])
      setMaintenanceRequests(maintenanceData || [])
      setWarranties(warrantiesData || [])
      setWarrantyClaims(claimsData || [])
      setFollowUpServices(followUpsData || [])
    } catch (error) {
      console.error('Error loading after-sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewCase = async () => {
    setIsCreating(true)
    try {
      const baseData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority
      }

      let result
      let mockData: any = {}

      try {
        switch (newCaseType) {
          case 'inquiry':
            result = await createCustomerInquiry({
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              inquiry_type: formData.inquiry_type,
              status: 'open',
              tags: [],
              attachments: []
            })
            setInquiries(prev => [result, ...prev])
            break

          case 'complaint':
            result = await createComplaint({
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              complaint_type: formData.complaint_type,
              severity: formData.severity,
              status: 'new',
              related_orders: [],
              attachments: []
            })
            setComplaints(prev => [result, ...prev])
            break

          case 'maintenance':
            result = await createMaintenanceRequest({
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              request_type: formData.request_type,
              status: 'requested',
              warranty_covered: false,
              attachments: []
            })
            setMaintenanceRequests(prev => [result, ...prev])
            break

          case 'warranty':
            result = await createWarranty({
              customer_id: `customer_${Date.now()}`,
              customer_name: formData.customer_name,
              product_id: `product_${Date.now()}`,
              product_name: formData.product_name,
              order_id: formData.order_id,
              warranty_type: formData.warranty_type,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              duration_months: 12,
              coverage_details: formData.coverage_details,
              terms_conditions: formData.terms_conditions,
              status: 'active'
            })
            setWarranties(prev => [result, ...prev])
            break

          case 'followup':
            result = await createFollowUpService({
              customer_id: `customer_${Date.now()}`,
              customer_name: formData.customer_name,
              customer_email: formData.customer_email,
              customer_phone: formData.customer_phone,
              service_type: formData.service_type,
              scheduled_date: formData.scheduled_date || new Date().toISOString(),
              status: 'scheduled',
              priority: formData.priority,
              description: formData.description,
              follow_up_required: false
            })
            setFollowUpServices(prev => [result, ...prev])
            break
        }
      } catch (dbError: any) {
        // If database tables don't exist, create mock data for demo purposes
        if (dbError.message === 'TABLE_NOT_EXISTS') {
          console.log('Database tables do not exist, creating mock data for demo')
        } else {
          console.log('Database error occurred, creating mock data for demo:', dbError.message)
        }
        
        const mockId = `mock_${Date.now()}`
        const mockCreatedAt = new Date().toISOString()
        
        switch (newCaseType) {
          case 'inquiry':
            mockData = {
              id: mockId,
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              inquiry_type: formData.inquiry_type,
              status: 'open',
              created_at: mockCreatedAt,
              updated_at: mockCreatedAt,
              tags: [],
              attachments: [],
              customer_satisfaction_rating: 0
            }
            setInquiries(prev => [mockData, ...prev])
            break

          case 'complaint':
            mockData = {
              id: mockId,
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              complaint_type: formData.complaint_type,
              severity: formData.severity,
              status: 'new',
              escalation_level: 0,
              created_at: mockCreatedAt,
              updated_at: mockCreatedAt,
              related_orders: [],
              attachments: [],
              customer_satisfaction_rating: 0
            }
            setComplaints(prev => [mockData, ...prev])
            break

          case 'maintenance':
            mockData = {
              id: mockId,
              ...baseData,
              customer_id: `customer_${Date.now()}`,
              request_type: formData.request_type,
              status: 'requested',
              warranty_covered: false,
              created_at: mockCreatedAt,
              updated_at: mockCreatedAt,
              attachments: [],
              customer_satisfaction_rating: 0
            }
            setMaintenanceRequests(prev => [mockData, ...prev])
            break

          case 'warranty':
            mockData = {
              id: mockId,
              customer_id: `customer_${Date.now()}`,
              customer_name: formData.customer_name,
              product_id: `product_${Date.now()}`,
              product_name: formData.product_name,
              order_id: formData.order_id,
              warranty_type: formData.warranty_type,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              duration_months: 12,
              coverage_details: formData.coverage_details,
              terms_conditions: formData.terms_conditions,
              status: 'active',
              claims_count: 0,
              created_at: mockCreatedAt,
              updated_at: mockCreatedAt,
              customer_satisfaction_rating: 0
            }
            setWarranties(prev => [mockData, ...prev])
            break

          case 'followup':
            mockData = {
              id: mockId,
              customer_id: `customer_${Date.now()}`,
              customer_name: formData.customer_name,
              customer_email: formData.customer_email,
              customer_phone: formData.customer_phone,
              service_type: formData.service_type,
              scheduled_date: formData.scheduled_date || new Date().toISOString(),
              status: 'scheduled',
              priority: formData.priority,
              description: formData.description,
              follow_up_required: false,
              created_at: mockCreatedAt,
              updated_at: mockCreatedAt,
              customer_satisfaction_rating: 0
            }
            setFollowUpServices(prev => [mockData, ...prev])
            break
        }
      }

      // Reset form and close dialog
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        subject: '',
        description: '',
        priority: 'medium',
        severity: 'medium',
        inquiry_type: 'general',
        complaint_type: 'other',
        request_type: 'preventive',
        service_type: 'satisfaction_survey',
        warranty_type: 'standard',
        product_name: '',
        order_id: '',
        scheduled_date: '',
        coverage_details: '',
        terms_conditions: ''
      })
      setIsNewCaseOpen(false)
      
      // Reload data to refresh metrics
      await loadData()
      
      alert('تم إنشاء حالة الدعم بنجاح! (تم حفظ البيانات محلياً للعرض)')
    } catch (error) {
      console.error('Error creating support case:', error)
      alert('حدث خطأ أثناء إنشاء حالة الدعم. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleViewCase = (caseData: any, caseType: string) => {
    setSelectedCase(caseData)
    setSelectedCaseType(caseType)
    setIsViewDialogOpen(true)
  }

  const handleEditCase = (caseData: any, caseType: string) => {
    setSelectedCase(caseData)
    setSelectedCaseType(caseType)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCase = async () => {
    setIsUpdating(true)
    try {
      // Update the case in the appropriate state
      switch (selectedCaseType) {
        case 'inquiry':
          setInquiries(prev => prev.map(item => 
            item.id === selectedCase.id ? { ...item, ...selectedCase } : item
          ))
          break
        case 'complaint':
          setComplaints(prev => prev.map(item => 
            item.id === selectedCase.id ? { ...item, ...selectedCase } : item
          ))
          break
        case 'maintenance':
          setMaintenanceRequests(prev => prev.map(item => 
            item.id === selectedCase.id ? { ...item, ...selectedCase } : item
          ))
          break
        case 'warranty':
          setWarranties(prev => prev.map(item => 
            item.id === selectedCase.id ? { ...item, ...selectedCase } : item
          ))
          break
        case 'followup':
          setFollowUpServices(prev => prev.map(item => 
            item.id === selectedCase.id ? { ...item, ...selectedCase } : item
          ))
          break
      }

      setIsEditDialogOpen(false)
      setSelectedCase(null)
      setSelectedCaseType('')
      
      alert('تم تحديث الحالة بنجاح!')
    } catch (error) {
      console.error('Error updating case:', error)
      alert('حدث خطأ أثناء تحديث الحالة. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRateCase = (caseData: any, caseType: string) => {
    setRatingCase(caseData)
    setSelectedCaseType(caseType)
    setNewRating(caseData.customer_satisfaction_rating || 0)
    setIsRatingDialogOpen(true)
  }

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true)
    try {
      // Try to save rating to database first
      try {
        const { createRating } = await import('@/lib/after-sales')
        await createRating(ratingCase.id, selectedCaseType, newRating)
        
        // If database save successful, update local state
        const updatedCase = { ...ratingCase, customer_satisfaction_rating: newRating }
        
        switch (selectedCaseType) {
          case 'inquiry':
            setInquiries(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'complaint':
            setComplaints(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'maintenance':
            setMaintenanceRequests(prev => prev.map(item => 
            item.id === ratingCase.id ? updatedCase : item
          ))
            break
          case 'warranty':
            setWarranties(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'followup':
            setFollowUpServices(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
        }
        
        alert('تم حفظ التقييم في قاعدة البيانات بنجاح!')
      } catch (dbError) {
        console.log('Database save failed, using local storage:', dbError)
        
        // Fallback to local storage if database fails
        const updatedCase = { ...ratingCase, customer_satisfaction_rating: newRating }
        
        switch (selectedCaseType) {
          case 'inquiry':
            setInquiries(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'complaint':
            setComplaints(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'maintenance':
            setMaintenanceRequests(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'warranty':
            setWarranties(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
          case 'followup':
            setFollowUpServices(prev => prev.map(item => 
              item.id === ratingCase.id ? updatedCase : item
            ))
            break
        }
        
        alert('تم حفظ التقييم محلياً بنجاح!')
      }

      setIsRatingDialogOpen(false)
      setRatingCase(null)
      setNewRating(0)
      
      // Reload data to update metrics
      await loadData()
      
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('حدث خطأ أثناء حفظ التقييم. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmittingRating(false)
    }
  }

  // New modal handlers
  const handleViewProfile = (customer: any) => {
    console.log('Opening customer profile for:', customer)
    console.log('Setting selectedCustomer to:', customer)
    setSelectedCustomer(customer)
    console.log('Setting isProfileModalOpen to true')
    setIsProfileModalOpen(true)
  }

  const handleLiveTracking = () => {
    console.log('Opening live tracking modal')
    setIsTrackingModalOpen(true)
  }

  const handleAssignTask = (taskId?: string, taskType?: string) => {
    console.log('Opening assign task modal for:', taskId, taskType)
    setIsAssignTaskModalOpen(true)
  }

  const handleSendMessage = (customer?: any) => {
    console.log('Opening send message modal for:', customer)
    if (customer) {
      console.log('Setting selectedCustomer to:', customer)
      setSelectedCustomer(customer)
    }
    console.log('Setting isMessageModalOpen to true')
    setIsMessageModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'new':
      case 'requested':
      case 'submitted':
      case 'scheduled':
        return "bg-blue-100 text-blue-800"
      case 'in_progress':
      case 'investigating':
      case 'under_review':
        return "bg-yellow-100 text-yellow-800"
      case 'resolved':
      case 'completed':
      case 'approved':
        return "bg-green-100 text-green-800"
      case 'closed':
      case 'cancelled':
      case 'rejected':
        return "bg-gray-100 text-gray-800"
      case 'escalated':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return "bg-red-100 text-red-800"
      case 'high':
        return "bg-orange-100 text-orange-800"
      case 'medium':
        return "bg-yellow-100 text-yellow-800"
      case 'low':
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return "bg-red-100 text-red-800"
      case 'high':
        return "bg-orange-100 text-orange-800"
      case 'medium':
        return "bg-yellow-100 text-yellow-800"
      case 'low':
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter functions
  const filterData = (data: any[], type: string) => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || 
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter

      // Date filter
      let matchesDate = true
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0
            break
          case 'week':
            matchesDate = daysDiff <= 7
            break
          case 'month':
            matchesDate = daysDiff <= 30
            break
          case 'older':
            matchesDate = daysDiff > 30
            break
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate
    })
  }

  const getFilteredInquiries = () => filterData(inquiries, 'inquiry')
  const getFilteredComplaints = () => filterData(complaints, 'complaint')
  const getFilteredMaintenanceRequests = () => filterData(maintenanceRequests, 'maintenance')
  const getFilteredWarranties = () => filterData(warranties, 'warranty')
  const getFilteredFollowUpServices = () => filterData(followUpServices, 'followup')

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDateFilter('all')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("afterSalesSupport")}</h2>
            <p className="text-gray-600">{t("manageCustomerSupport")}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading")}...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("afterSalesSupport")}</h2>
            <p className="text-gray-600">{t("manageCustomerSupport")}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("newSupportCase")}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء حالة دعم جديدة</DialogTitle>
                <DialogDescription>
                  اختر نوع الحالة وأدخل التفاصيل المطلوبة
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Case Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="case-type">نوع الحالة</Label>
                  <Select value={newCaseType} onValueChange={(value: any) => setNewCaseType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">استفسار عميل</SelectItem>
                      <SelectItem value="complaint">شكوى</SelectItem>
                      <SelectItem value="maintenance">طلب صيانة</SelectItem>
                      <SelectItem value="warranty">ضمان</SelectItem>
                      <SelectItem value="followup">خدمة متابعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">اسم العميل *</Label>
                    <Input
                      id="customer-name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="أدخل اسم العميل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">البريد الإلكتروني *</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">رقم الهاتف</Label>
                  <Input
                    id="customer-phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="رقم الهاتف"
                  />
                </div>

                {/* Subject and Description */}
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="موضوع الحالة"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مفصل للحالة"
                    rows={4}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type-specific fields */}
                {newCaseType === 'inquiry' && (
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">نوع الاستفسار</Label>
                    <Select value={formData.inquiry_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, inquiry_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عام</SelectItem>
                        <SelectItem value="technical">تقني</SelectItem>
                        <SelectItem value="billing">فوترة</SelectItem>
                        <SelectItem value="warranty">ضمان</SelectItem>
                        <SelectItem value="complaint">شكوى</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newCaseType === 'complaint' && (
                  <div className="space-y-2">
                    <Label htmlFor="complaint-type">نوع الشكوى</Label>
                    <Select value={formData.complaint_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, complaint_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product_quality">جودة المنتج</SelectItem>
                        <SelectItem value="delivery_issue">مشكلة في التسليم</SelectItem>
                        <SelectItem value="service_quality">جودة الخدمة</SelectItem>
                        <SelectItem value="billing_error">خطأ في الفوترة</SelectItem>
                        <SelectItem value="communication">التواصل</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newCaseType === 'maintenance' && (
                  <div className="space-y-2">
                    <Label htmlFor="request-type">نوع الطلب</Label>
                    <Select value={formData.request_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, request_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">وقائي</SelectItem>
                        <SelectItem value="corrective">تصحيحي</SelectItem>
                        <SelectItem value="emergency">طوارئ</SelectItem>
                        <SelectItem value="warranty">ضمان</SelectItem>
                        <SelectItem value="upgrade">ترقية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newCaseType === 'warranty' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">اسم المنتج</Label>
                      <Input
                        id="product-name"
                        value={formData.product_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                        placeholder="اسم المنتج"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order-id">رقم الطلب</Label>
                      <Input
                        id="order-id"
                        value={formData.order_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))}
                        placeholder="رقم الطلب"
                      />
                    </div>
                  </div>
                )}

                {newCaseType === 'followup' && (
                  <div className="space-y-2">
                    <Label htmlFor="service-type">نوع الخدمة</Label>
                    <Select value={formData.service_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, service_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satisfaction_survey">استطلاع رضا</SelectItem>
                        <SelectItem value="product_training">تدريب على المنتج</SelectItem>
                        <SelectItem value="maintenance_reminder">تذكير صيانة</SelectItem>
                        <SelectItem value="upgrade_offer">عرض ترقية</SelectItem>
                        <SelectItem value="feedback_collection">جمع ملاحظات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewCaseOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateNewCase} 
                  disabled={isCreating || !formData.customer_name || !formData.customer_email || !formData.subject || !formData.description}
                >
                  {isCreating ? 'جاري الإنشاء...' : 'إنشاء الحالة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inquiries">{t("customerInquiries")}</TabsTrigger>
          <TabsTrigger value="complaints">{t("complaints")}</TabsTrigger>
          <TabsTrigger value="maintenance">{t("maintenanceRequests")}</TabsTrigger>
          <TabsTrigger value="warranties">{t("warrantyManagement")}</TabsTrigger>
          <TabsTrigger value="followups">{t("followUpServices")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalInquiries")}</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_inquiries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.resolved_inquiries || 0} {t("resolvedInquiries")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("activeComplaints")}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_complaints || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.complaint_escalation_rate || 0}% {t("escalationRate")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("maintenanceRequests")}</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_maintenance_requests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.completed_maintenance_requests || 0} {t("completed")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("customerSatisfaction")}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.customer_satisfaction_score 
                    ? `${metrics.customer_satisfaction_score}/5` 
                    : calculateLocalCustomerSatisfaction() > 0 
                      ? `${calculateLocalCustomerSatisfaction()}/5` 
                      : '0/5'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("averageRating")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("warrantyOverview")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("activeWarranties")}</span>
                  <span className="font-semibold">{metrics?.active_warranties || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("warrantyClaims")}</span>
                  <span className="font-semibold">{metrics?.warranty_claims_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("approvalRate")}</span>
                  <span className="font-semibold">{metrics?.warranty_claim_approval_rate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("performanceMetrics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("avgResolutionTime")}</span>
                  <span className="font-semibold">{metrics?.average_resolution_time_hours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("avgMaintenanceCost")}</span>
                  <span className="font-semibold">${metrics?.average_maintenance_cost || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("customerRetention")}</span>
                  <span className="font-semibold">{metrics?.customer_retention_rate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("followUpServices")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("scheduled")}</span>
                  <span className="font-semibold">{metrics?.scheduled_follow_ups || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("completed")}</span>
                  <span className="font-semibold">{metrics?.completed_follow_ups || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("completionRate")}</span>
                  <span className="font-semibold">
                    {metrics?.scheduled_follow_ups ? 
                      Math.round((metrics.completed_follow_ups / metrics.scheduled_follow_ups) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("customerInquiries")}</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder={t("searchInquiries")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="open">مفتوحة</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="resolved">محلولة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">الأولوية</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">التاريخ</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="older">أقدم من شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {getFilteredInquiries().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries Found</h3>
                  <p className="text-gray-500">No customer inquiries have been submitted yet.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredInquiries().map((inquiry) => (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{inquiry.subject}</h4>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(inquiry.priority)}>
                          {inquiry.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{inquiry.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{inquiry.customer_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{inquiry.description}</p>
                      
                      {inquiry.assigned_to_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          Assigned to: <span className="font-medium">{inquiry.assigned_to_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCase(inquiry, 'inquiry')}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(inquiry)}
                        title="عرض الملف الشخصي"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCase(inquiry, 'inquiry')}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRateCase(inquiry, 'inquiry')}
                        title="تقييم الحالة"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("complaints")}</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder={t("searchComplaints")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="investigating">قيد التحقيق</SelectItem>
                      <SelectItem value="resolved">محلولة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">الأولوية</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">التاريخ</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="older">أقدم من شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {getFilteredComplaints().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
                  <p className="text-gray-500">No customer complaints have been submitted yet.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredComplaints().map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{complaint.subject}</h4>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getSeverityColor(complaint.severity)}>
                          {complaint.severity.toUpperCase()}
                        </Badge>
                        {complaint.escalation_level > 0 && (
                          <Badge variant="destructive">
                            ESCALATED (Level {complaint.escalation_level})
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{complaint.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{complaint.customer_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{complaint.description}</p>
                      
                      {complaint.assigned_to_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          Assigned to: <span className="font-medium">{complaint.assigned_to_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCase(complaint, 'complaint')}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(complaint)}
                        title="عرض الملف الشخصي"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCase(complaint, 'complaint')}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRateCase(complaint, 'complaint')}
                        title="تقييم الحالة"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("maintenanceRequests")}</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder={t("searchMaintenance")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="requested">مطلوبة</SelectItem>
                      <SelectItem value="scheduled">مجدولة</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">الأولوية</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">التاريخ</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="older">أقدم من شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {getFilteredMaintenanceRequests().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Requests</h3>
                  <p className="text-gray-500">No maintenance requests have been submitted yet.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredMaintenanceRequests().map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">
                          {request.equipment_name || 'Equipment Maintenance'}
                        </h4>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority.toUpperCase()}
                        </Badge>
                        {request.warranty_covered && (
                          <Badge variant="secondary">WARRANTY</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{request.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4" />
                          <span>{request.request_type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{request.description}</p>
                      
                      {request.assigned_technician_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          Technician: <span className="font-medium">{request.assigned_technician_name}</span>
                        </div>
                      )}
                      
                      {request.scheduled_date && (
                        <div className="mt-2 text-sm text-gray-600">
                          Scheduled: <span className="font-medium">
                            {new Date(request.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCase(request, 'maintenance')}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(request)}
                        title="عرض الملف الشخصي"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCase(request, 'maintenance')}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRateCase(request, 'maintenance')}
                        title="تقييم الحالة"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="warranties" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("warrantyManagement")}</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder={t("searchWarranties")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="expired">منتهي</SelectItem>
                      <SelectItem value="void">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">نوع الضمان</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="standard">عادي</SelectItem>
                      <SelectItem value="extended">ممتد</SelectItem>
                      <SelectItem value="premium">مميز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">التاريخ</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="older">أقدم من شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {getFilteredWarranties().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Warranties Found</h3>
                  <p className="text-gray-500">No warranties have been registered yet.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredWarranties().map((warranty) => (
              <Card key={warranty.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{warranty.product_name}</h4>
                        <Badge className={getStatusColor(warranty.status)}>
                          {warranty.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {warranty.warranty_type.toUpperCase()}
                        </Badge>
                        {warranty.claims_count > 0 && (
                          <Badge variant="secondary">
                            {warranty.claims_count} CLAIMS
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{warranty.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {new Date(warranty.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>{warranty.duration_months} months</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{warranty.coverage_details}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCase(warranty, 'warranty')}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(warranty)}
                        title="عرض الملف الشخصي"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCase(warranty, 'warranty')}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRateCase(warranty, 'warranty')}
                        title="تقييم الحالة"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("followUpServices")}</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder={t("searchFollowUps")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="scheduled">مجدولة</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                      <SelectItem value="cancelled">ملغية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">نوع الخدمة</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="satisfaction_survey">استطلاع رضا</SelectItem>
                      <SelectItem value="product_training">تدريب على المنتج</SelectItem>
                      <SelectItem value="maintenance_reminder">تذكير صيانة</SelectItem>
                      <SelectItem value="upgrade_offer">عرض ترقية</SelectItem>
                      <SelectItem value="feedback_collection">جمع ملاحظات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">التاريخ</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التواريخ</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="older">أقدم من شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {getFilteredFollowUpServices().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Follow-up Services</h3>
                  <p className="text-gray-500">No follow-up services have been scheduled yet.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredFollowUpServices().map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{service.description}</h4>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(service.priority)}>
                          {service.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {service.service_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{service.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {new Date(service.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{service.customer_phone}</span>
                        </div>
                      </div>
                      
                      {service.assigned_to_name && (
                        <div className="mt-2 text-sm text-gray-600">
                          Assigned to: <span className="font-medium">{service.assigned_to_name}</span>
                        </div>
                      )}
                      
                      {service.follow_up_required && service.next_follow_up_date && (
                        <div className="mt-2 text-sm text-blue-600">
                          Next follow-up: <span className="font-medium">
                            {new Date(service.next_follow_up_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCase(service, 'followup')}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(service)}
                        title="عرض الملف الشخصي"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCase(service, 'followup')}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRateCase(service, 'followup')}
                        title="تقييم الحالة"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Case Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>عرض تفاصيل الحالة</DialogTitle>
            <DialogDescription>
              عرض جميع تفاصيل حالة الدعم المحددة
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">اسم العميل</Label>
                  <p className="text-gray-700">{selectedCase.customer_name || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="font-semibold">البريد الإلكتروني</Label>
                  <p className="text-gray-700">{selectedCase.customer_email || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="font-semibold">رقم الهاتف</Label>
                  <p className="text-gray-700">{selectedCase.customer_phone || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="font-semibold">الأولوية</Label>
                  <Badge className={getPriorityColor(selectedCase.priority || 'medium')}>
                    {(selectedCase.priority || 'medium').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-semibold">الموضوع</Label>
                <p className="text-gray-700">{selectedCase.subject || 'غير محدد'}</p>
              </div>

              <div>
                <Label className="font-semibold">الوصف</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCase.description || 'غير محدد'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">الحالة</Label>
                  <Badge className={getStatusColor(selectedCase.status || 'open')}>
                    {(selectedCase.status || 'open').replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">تاريخ الإنشاء</Label>
                  <p className="text-gray-700">{new Date(selectedCase.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Type-specific fields */}
              {selectedCaseType === 'inquiry' && selectedCase.inquiry_type && (
                <div>
                  <Label className="font-semibold">نوع الاستفسار</Label>
                  <p className="text-gray-700">{selectedCase.inquiry_type}</p>
                </div>
              )}

              {selectedCaseType === 'complaint' && (
                <>
                  {selectedCase.complaint_type && (
                    <div>
                      <Label className="font-semibold">نوع الشكوى</Label>
                      <p className="text-gray-700">{selectedCase.complaint_type}</p>
                    </div>
                  )}
                  {selectedCase.severity && (
                    <div>
                      <Label className="font-semibold">الخطورة</Label>
                      <Badge className={getSeverityColor(selectedCase.severity || 'medium')}>
                        {(selectedCase.severity || 'medium').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </>
              )}

              {selectedCaseType === 'maintenance' && selectedCase.request_type && (
                <div>
                  <Label className="font-semibold">نوع الطلب</Label>
                  <p className="text-gray-700">{selectedCase.request_type}</p>
                </div>
              )}

              {selectedCaseType === 'warranty' && (
                <>
                  {selectedCase.product_name && (
                    <div>
                      <Label className="font-semibold">اسم المنتج</Label>
                      <p className="text-gray-700">{selectedCase.product_name}</p>
                    </div>
                  )}
                  {selectedCase.warranty_type && (
                    <div>
                      <Label className="font-semibold">نوع الضمان</Label>
                      <p className="text-gray-700">{selectedCase.warranty_type}</p>
                    </div>
                  )}
                </>
              )}

              {selectedCaseType === 'followup' && selectedCase.service_type && (
                <div>
                  <Label className="font-semibold">نوع الخدمة</Label>
                  <p className="text-gray-700">{selectedCase.service_type}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الحالة</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل حالة الدعم المحددة
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customer-name">اسم العميل</Label>
                  <Input
                    id="edit-customer-name"
                    value={selectedCase.customer_name || ''}
                    onChange={(e) => setSelectedCase(prev => ({ ...prev, customer_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer-email">البريد الإلكتروني</Label>
                  <Input
                    id="edit-customer-email"
                    type="email"
                    value={selectedCase.customer_email || ''}
                    onChange={(e) => setSelectedCase(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-customer-phone">رقم الهاتف</Label>
                <Input
                  id="edit-customer-phone"
                  value={selectedCase.customer_phone || ''}
                  onChange={(e) => setSelectedCase(prev => ({ ...prev, customer_phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">الموضوع</Label>
                <Input
                  id="edit-subject"
                  value={selectedCase.subject || ''}
                  onChange={(e) => setSelectedCase(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={selectedCase.description || ''}
                  onChange={(e) => setSelectedCase(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">الأولوية</Label>
                  <Select value={selectedCase.priority || 'medium'} onValueChange={(value) => setSelectedCase(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">الحالة</Label>
                  <Select value={selectedCase.status || 'open'} onValueChange={(value) => setSelectedCase(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCaseType === 'inquiry' && (
                        <>
                          <SelectItem value="open">مفتوحة</SelectItem>
                          <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="resolved">محلولة</SelectItem>
                          <SelectItem value="closed">مغلقة</SelectItem>
                        </>
                      )}
                      {selectedCaseType === 'complaint' && (
                        <>
                          <SelectItem value="new">جديدة</SelectItem>
                          <SelectItem value="investigating">قيد التحقيق</SelectItem>
                          <SelectItem value="resolved">محلولة</SelectItem>
                          <SelectItem value="closed">مغلقة</SelectItem>
                        </>
                      )}
                      {selectedCaseType === 'maintenance' && (
                        <>
                          <SelectItem value="requested">مطلوبة</SelectItem>
                          <SelectItem value="scheduled">مجدولة</SelectItem>
                          <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="completed">مكتملة</SelectItem>
                        </>
                      )}
                      {selectedCaseType === 'warranty' && (
                        <>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="expired">منتهي</SelectItem>
                          <SelectItem value="void">ملغي</SelectItem>
                        </>
                      )}
                      {selectedCaseType === 'followup' && (
                        <>
                          <SelectItem value="scheduled">مجدولة</SelectItem>
                          <SelectItem value="completed">مكتملة</SelectItem>
                          <SelectItem value="cancelled">ملغية</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleUpdateCase} 
              disabled={isUpdating}
            >
              {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تقييم الحالة</DialogTitle>
            <DialogDescription>
              قم بتقييم رضا العميل عن الخدمة المقدمة
            </DialogDescription>
          </DialogHeader>
          
          {ratingCase && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  حالة: {ratingCase.subject}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  العميل: {ratingCase.customer_name}
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`p-2 rounded-full transition-colors ${
                      star <= newRating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {newRating === 0 && 'اختر التقييم'}
                  {newRating === 1 && 'سيء جداً'}
                  {newRating === 2 && 'سيء'}
                  {newRating === 3 && 'متوسط'}
                  {newRating === 4 && 'جيد'}
                  {newRating === 5 && 'ممتاز'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmitRating} 
              disabled={isSubmittingRating || newRating === 0}
            >
              {isSubmittingRating ? 'جاري الحفظ...' : 'حفظ التقييم'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Modal Components */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        customerId={selectedCustomer?.customer_id || selectedCustomer?.id}
        customerName={selectedCustomer?.customer_name || selectedCustomer?.name}
        customerEmail={selectedCustomer?.customer_email || selectedCustomer?.email}
        customerPhone={selectedCustomer?.customer_phone || selectedCustomer?.phone}
      />

      <LiveTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
      />

      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={selectedCustomer?.customer_id || selectedCustomer?.id}
        recipientName={selectedCustomer?.customer_name || selectedCustomer?.name}
        recipientEmail={selectedCustomer?.customer_email || selectedCustomer?.email}
      />
    </div>
  )
}
