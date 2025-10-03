"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Navigation,
  Calendar,
  Timer,
  Activity,
  Zap
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LiveTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  trackingId?: string
  trackingType?: 'delivery' | 'maintenance' | 'support' | 'all'
}

interface TrackingItem {
  id: string
  type: 'delivery' | 'maintenance' | 'support'
  title: string
  customer: string
  status: 'pending' | 'in_progress' | 'on_route' | 'arrived' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location: {
    current: string
    destination: string
    coordinates?: { lat: number; lng: number }
  }
  estimatedTime: string
  actualTime?: string
  assignedTo: {
    id: string
    name: string
    phone: string
    avatar?: string
  }
  progress: number
  lastUpdate: string
  nextStep?: string
  notes?: string
}

export function LiveTrackingModal({ 
  isOpen, 
  onClose, 
  trackingId, 
  trackingType = 'all' 
}: LiveTrackingModalProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("map")
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // Tracking data
  const [trackingItems, setTrackingItems] = useState<TrackingItem[]>([])
  const [selectedItem, setSelectedItem] = useState<TrackingItem | null>(null)
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  useEffect(() => {
    if (isOpen) {
      loadTrackingData()
      
      // Set up auto-refresh
      if (autoRefresh) {
        const interval = setInterval(() => {
          loadTrackingData()
          setLastRefresh(new Date())
        }, refreshInterval * 1000)
        
        return () => clearInterval(interval)
      }
    }
  }, [isOpen, autoRefresh, refreshInterval])

  const loadTrackingData = async () => {
    setLoading(true)
    try {
      // Mock tracking data
      const mockData: TrackingItem[] = [
        {
          id: "track_001",
          type: "delivery",
          title: "تسليم طلب #12345",
          customer: "أحمد محمد",
          status: "on_route",
          priority: "high",
          location: {
            current: "شارع الملك فهد، الرياض",
            destination: "حي النرجس، الرياض",
            coordinates: { lat: 24.7136, lng: 46.6753 }
          },
          estimatedTime: "14:30",
          assignedTo: {
            id: "driver_001",
            name: "محمد السائق",
            phone: "+966501234567"
          },
          progress: 75,
          lastUpdate: new Date().toISOString(),
          nextStep: "الوصول للوجهة خلال 15 دقيقة"
        },
        {
          id: "track_002",
          type: "maintenance",
          title: "صيانة مضخة المياه",
          customer: "شركة الصناعات البلاستيكية",
          status: "in_progress",
          priority: "urgent",
          location: {
            current: "مصنع الشركة، الرياض",
            destination: "مصنع الشركة، الرياض"
          },
          estimatedTime: "16:00",
          assignedTo: {
            id: "tech_001",
            name: "علي الفني",
            phone: "+966501234568"
          },
          progress: 60,
          lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextStep: "استكمال فحص الأجزاء",
          notes: "تم فحص المحرك، جاري فحص الأنابيب"
        },
        {
          id: "track_003",
          type: "support",
          title: "دعم فني - مشكلة في الجهاز",
          customer: "سارة أحمد",
          status: "in_progress",
          priority: "medium",
          location: {
            current: "مكتب الدعم الفني",
            destination: "عن بُعد"
          },
          estimatedTime: "15:45",
          assignedTo: {
            id: "support_001",
            name: "فاطمة الدعم",
            phone: "+966501234569"
          },
          progress: 40,
          lastUpdate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          nextStep: "تشخيص المشكلة عن بُعد"
        },
        {
          id: "track_004",
          type: "delivery",
          title: "تسليم طلب #12346",
          customer: "خالد عبدالرحمن",
          status: "completed",
          priority: "medium",
          location: {
            current: "تم التسليم",
            destination: "حي العليا، الرياض"
          },
          estimatedTime: "13:00",
          actualTime: "12:45",
          assignedTo: {
            id: "driver_002",
            name: "يوسف السائق",
            phone: "+966501234570"
          },
          progress: 100,
          lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ]

      // Filter by tracking type
      const filteredData = trackingType === 'all' 
        ? mockData 
        : mockData.filter(item => item.type === trackingType)

      setTrackingItems(filteredData)
      
      // Select specific item if trackingId provided
      if (trackingId) {
        const item = filteredData.find(item => item.id === trackingId)
        setSelectedItem(item || null)
      }
    } catch (error) {
      console.error('Error loading tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800"
      case 'in_progress':
      case 'on_route':
        return "bg-blue-100 text-blue-800"
      case 'arrived':
        return "bg-yellow-100 text-yellow-800"
      case 'pending':
        return "bg-gray-100 text-gray-800"
      case 'cancelled':
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <Truck className="h-5 w-5" />
      case 'maintenance':
        return <Wrench className="h-5 w-5" />
      case 'support':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
      case 'on_route':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'arrived':
        return <MapPin className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Timer className="h-5 w-5 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} يوم`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="h-6 w-6" />
              <span>التتبع المباشر</span>
              {autoRefresh && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Zap className="h-4 w-4" />
                  <span>تحديث تلقائي</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadTrackingData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <div className="text-xs text-gray-500">
                آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            تتبع حالة الطلبات والخدمات في الوقت الفعلي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="auto-refresh" className="text-sm">
                  التحديث التلقائي
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm">فترة التحديث:</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value={10}>10 ثوان</option>
                  <option value={30}>30 ثانية</option>
                  <option value={60}>دقيقة</option>
                  <option value={300}>5 دقائق</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {trackingItems.length} عنصر نشط
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map">الخريطة</TabsTrigger>
              <TabsTrigger value="list">قائمة التتبع</TabsTrigger>
              <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>خريطة التتبع</CardTitle>
                  <CardDescription>
                    عرض مواقع العناصر النشطة على الخريطة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">خريطة التتبع</p>
                      <p className="text-sm text-gray-500">
                        سيتم عرض المواقع على الخريطة هنا
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="space-y-4">
                {trackingItems.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عناصر للتتبع</h3>
                      <p className="text-gray-500">لا توجد عناصر نشطة للتتبع حالياً</p>
                    </CardContent>
                  </Card>
                ) : (
                  trackingItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getTypeIcon(item.type)}
                              <h4 className="font-semibold">{item.title}</h4>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status === 'completed' ? 'مكتمل' :
                                 item.status === 'in_progress' ? 'قيد التنفيذ' :
                                 item.status === 'on_route' ? 'في الطريق' :
                                 item.status === 'arrived' ? 'وصل' :
                                 item.status === 'pending' ? 'معلق' : 'ملغي'}
                              </Badge>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority === 'urgent' ? 'عاجل' :
                                 item.priority === 'high' ? 'عالي' :
                                 item.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span>{item.customer}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>{item.location.current}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span>{item.assignedTo.name}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>متوقع: {item.estimatedTime}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span>{item.assignedTo.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Timer className="h-4 w-4 text-gray-500" />
                                  <span>{formatTimeAgo(item.lastUpdate)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>التقدم</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {item.nextStep && (
                              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                <strong>الخطوة التالية:</strong> {item.nextStep}
                              </div>
                            )}

                            {item.notes && (
                              <div className="text-sm text-gray-600 mt-2">
                                <strong>ملاحظات:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              تفاصيل
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الجدول الزمني</CardTitle>
                  <CardDescription>
                    عرض التحديثات الأخيرة لجميع العناصر
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(item.lastUpdate)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            العميل: {item.customer} | المسؤول: {item.assignedTo.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status === 'completed' ? 'مكتمل' :
                               item.status === 'in_progress' ? 'قيد التنفيذ' :
                               item.status === 'on_route' ? 'في الطريق' :
                               item.status === 'arrived' ? 'وصل' :
                               item.status === 'pending' ? 'معلق' : 'ملغي'}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority === 'urgent' ? 'عاجل' :
                               item.priority === 'high' ? 'عالي' :
                               item.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}