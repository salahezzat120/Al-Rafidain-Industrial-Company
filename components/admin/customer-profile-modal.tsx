"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  MessageSquare, 
  AlertTriangle, 
  Wrench, 
  Shield,
  Clock,
  TrendingUp,
  History,
  Settings,
  Edit,
  Send,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { 
  CustomerInquiry, 
  Complaint, 
  MaintenanceRequest, 
  Warranty, 
  FollowUpService 
} from "@/types/after-sales"

interface CustomerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
}

interface CustomerProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  satisfactionRating: number
  preferredLanguage: string
  communicationPreference: string
  lastContact: string
  status: 'active' | 'inactive' | 'vip' | 'blocked'
  tags: string[]
  notes: string
}

export function CustomerProfileModal({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName, 
  customerEmail, 
  customerPhone 
}: CustomerProfileModalProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  
  // Customer profile data
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  
  // Customer history data
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [followUpServices, setFollowUpServices] = useState<FollowUpService[]>([])
  
  // Quick actions
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerProfile()
    }
  }, [isOpen, customerId])

  const loadCustomerProfile = async () => {
    setLoading(true)
    try {
      // Load customer profile data
      const mockProfile: CustomerProfile = {
        id: customerId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: "الرياض، المملكة العربية السعودية",
        company: "شركة الصناعات البلاستيكية",
        joinDate: "2023-01-15",
        totalOrders: 24,
        totalSpent: 125000,
        satisfactionRating: 4.2,
        preferredLanguage: "العربية",
        communicationPreference: "هاتف",
        lastContact: "2024-01-15",
        status: 'active',
        tags: ["VIP", "مؤسسة", "صيانة دورية"],
        notes: "عميل مميز، يفضل التواصل بالهاتف، يحتاج متابعة دورية"
      }
      setProfile(mockProfile)

      // Load customer history
      await Promise.all([
        loadCustomerInquiries(),
        loadCustomerComplaints(),
        loadCustomerMaintenance(),
        loadCustomerWarranties(),
        loadCustomerFollowUps()
      ])
    } catch (error) {
      console.error('Error loading customer profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerInquiries = async () => {
    try {
      // Mock data for demonstration
      const mockInquiries: CustomerInquiry[] = [
        {
          id: "inq_001",
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          inquiry_type: "technical",
          subject: "استفسار حول تشغيل الجهاز",
          description: "أحتاج مساعدة في تشغيل الجهاز الجديد",
          priority: "medium",
          status: "resolved",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T15:00:00Z",
          resolved_at: "2024-01-10T15:00:00Z",
          customer_satisfaction_rating: 5,
          tags: ["تقني", "جهاز جديد"]
        }
      ]
      setInquiries(mockInquiries)
    } catch (error) {
      console.error('Error loading customer inquiries:', error)
    }
  }

  const loadCustomerComplaints = async () => {
    try {
      // Mock data for demonstration
      const mockComplaints: Complaint[] = [
        {
          id: "comp_001",
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          complaint_type: "delivery_issue",
          subject: "تأخير في التسليم",
          description: "الطلب تأخر عن الموعد المحدد",
          severity: "medium",
          status: "resolved",
          created_at: "2024-01-05T09:00:00Z",
          updated_at: "2024-01-05T14:00:00Z",
          resolved_at: "2024-01-05T14:00:00Z",
          customer_satisfaction_rating: 4,
          escalation_level: 0
        }
      ]
      setComplaints(mockComplaints)
    } catch (error) {
      console.error('Error loading customer complaints:', error)
    }
  }

  const loadCustomerMaintenance = async () => {
    try {
      // Mock data for demonstration
      const mockMaintenance: MaintenanceRequest[] = [
        {
          id: "maint_001",
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          equipment_name: "مضخة المياه",
          request_type: "preventive",
          description: "صيانة دورية للمضخة",
          priority: "medium",
          status: "completed",
          created_at: "2024-01-08T08:00:00Z",
          updated_at: "2024-01-08T16:00:00Z",
          completed_date: "2024-01-08T16:00:00Z",
          warranty_covered: true,
          customer_satisfaction_rating: 5
        }
      ]
      setMaintenanceRequests(mockMaintenance)
    } catch (error) {
      console.error('Error loading customer maintenance:', error)
    }
  }

  const loadCustomerWarranties = async () => {
    try {
      // Mock data for demonstration
      const mockWarranties: Warranty[] = [
        {
          id: "warr_001",
          customer_id: customerId,
          customer_name: customerName,
          product_id: "prod_001",
          product_name: "مضخة مياه صناعية",
          order_id: "order_001",
          warranty_type: "standard",
          start_date: "2023-06-01T00:00:00Z",
          end_date: "2024-06-01T00:00:00Z",
          duration_months: 12,
          coverage_details: "تغطية كاملة للأجزاء والعمالة",
          terms_conditions: "الضمان يغطي الأعطال الطبيعية فقط",
          status: "active",
          claims_count: 1,
          created_at: "2023-06-01T00:00:00Z",
          updated_at: "2023-06-01T00:00:00Z"
        }
      ]
      setWarranties(mockWarranties)
    } catch (error) {
      console.error('Error loading customer warranties:', error)
    }
  }

  const loadCustomerFollowUps = async () => {
    try {
      // Mock data for demonstration
      const mockFollowUps: FollowUpService[] = [
        {
          id: "follow_001",
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          service_type: "satisfaction_survey",
          scheduled_date: "2024-01-20T10:00:00Z",
          status: "scheduled",
          priority: "medium",
          description: "استطلاع رضا العميل",
          follow_up_required: false,
          created_at: "2024-01-15T00:00:00Z",
          updated_at: "2024-01-15T00:00:00Z"
        }
      ]
      setFollowUpServices(mockFollowUps)
    } catch (error) {
      console.error('Error loading customer follow-ups:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    setIsSendingMessage(true)
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add message to customer history (in real app, this would save to database)
      console.log('Message sent:', newMessage)
      
      setNewMessage("")
      alert('تم إرسال الرسالة بنجاح!')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('حدث خطأ أثناء إرسال الرسالة')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'resolved':
      case 'completed':
        return "bg-green-100 text-green-800"
      case 'inactive':
      case 'cancelled':
        return "bg-gray-100 text-gray-800"
      case 'vip':
        return "bg-purple-100 text-purple-800"
      case 'blocked':
        return "bg-red-100 text-red-800"
      case 'open':
      case 'new':
      case 'requested':
      case 'scheduled':
        return "bg-blue-100 text-blue-800"
      case 'in_progress':
      case 'investigating':
        return "bg-yellow-100 text-yellow-800"
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات العميل...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="h-6 w-6" />
            <span>ملف العميل - {customerName}</span>
          </DialogTitle>
          <DialogDescription>
            عرض تفاصيل العميل وتاريخ التعامل معه
          </DialogDescription>
        </DialogHeader>

        {profile && (
          <div className="space-y-6">
            {/* Customer Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(profile.status)}>
                          {profile.status === 'active' ? 'نشط' : 
                           profile.status === 'vip' ? 'VIP' : 
                           profile.status === 'inactive' ? 'غير نشط' : 'محظور'}
                        </Badge>
                        <Badge variant="outline">
                          {profile.satisfactionRating}/5 ⭐
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("communication")}>
                      <Send className="h-4 w-4 mr-2" />
                      إرسال رسالة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">الاستفسارات</p>
                      <p className="text-lg font-semibold">{inquiries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">الشكاوى</p>
                      <p className="text-lg font-semibold">{complaints.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">طلبات الصيانة</p>
                      <p className="text-lg font-semibold">{maintenanceRequests.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">الضمانات</p>
                      <p className="text-lg font-semibold">{warranties.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="history">التاريخ</TabsTrigger>
                <TabsTrigger value="communication">التواصل</TabsTrigger>
                <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
                <TabsTrigger value="notes">الملاحظات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>معلومات الاتصال</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{profile.address}</span>
                        </div>
                      )}
                      {profile.company && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{profile.company}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Customer Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>إحصائيات العميل</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>تاريخ الانضمام:</span>
                        <span className="font-medium">{new Date(profile.joinDate).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الطلبات:</span>
                        <span className="font-medium">{profile.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي المبلغ:</span>
                        <span className="font-medium">{profile.totalSpent.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تقييم الرضا:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{profile.satisfactionRating}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>آخر تواصل:</span>
                        <span className="font-medium">{new Date(profile.lastContact).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tags */}
                {profile.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>العلامات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  {/* Inquiries */}
                  {inquiries.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>الاستفسارات ({inquiries.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{inquiry.subject}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(inquiry.priority)}>
                                    {inquiry.priority}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{inquiry.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{new Date(inquiry.created_at).toLocaleDateString('ar-SA')}</span>
                                {inquiry.customer_satisfaction_rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{inquiry.customer_satisfaction_rating}/5</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Complaints */}
                  {complaints.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span>الشكاوى ({complaints.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {complaints.map((complaint) => (
                            <div key={complaint.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{complaint.subject}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(complaint.status)}>
                                    {complaint.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(complaint.severity)}>
                                    {complaint.severity}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{new Date(complaint.created_at).toLocaleDateString('ar-SA')}</span>
                                {complaint.customer_satisfaction_rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{complaint.customer_satisfaction_rating}/5</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Maintenance Requests */}
                  {maintenanceRequests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Wrench className="h-5 w-5" />
                          <span>طلبات الصيانة ({maintenanceRequests.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {maintenanceRequests.map((request) => (
                            <div key={request.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{request.equipment_name || 'طلب صيانة'}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(request.priority)}>
                                    {request.priority}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{new Date(request.created_at).toLocaleDateString('ar-SA')}</span>
                                {request.customer_satisfaction_rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{request.customer_satisfaction_rating}/5</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>إرسال رسالة</CardTitle>
                    <CardDescription>
                      إرسال رسالة مباشرة للعميل
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الرسالة</label>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        إلى: {profile.email}
                      </div>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !newMessage.trim()}
                      >
                        {isSendingMessage ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تفضيلات العميل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">اللغة المفضلة</label>
                        <p className="text-gray-600">{profile.preferredLanguage}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">طريقة التواصل المفضلة</label>
                        <p className="text-gray-600">{profile.communicationPreference}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ملاحظات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الملاحظات</label>
                      <p className="text-gray-600 whitespace-pre-wrap">{profile.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}