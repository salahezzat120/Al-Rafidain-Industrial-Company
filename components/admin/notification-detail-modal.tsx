"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  Calendar,
  CheckCircle,
  X,
  Info,
  TrendingUp,
  Settings,
  Package,
  Wrench,
  Bell,
  XCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

interface NotificationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  alertId: string | null
}

interface FullAlertDetails {
  id: string
  alert_id: string
  alert_type: string
  category: string
  severity: string
  priority: string
  title: string
  message: string
  description?: string
  status: string
  is_read: boolean
  is_resolved: boolean
  resolved_at?: string
  resolved_by?: string
  visit_id?: string
  delegate_id?: string
  delegate_name?: string
  delegate_phone?: string
  delegate_email?: string
  customer_id?: string
  customer_name?: string
  customer_address?: string
  vehicle_id?: string
  vehicle_plate?: string
  driver_name?: string
  driver_phone?: string
  location?: string
  scheduled_time?: string
  actual_time?: string
  delay_minutes?: number
  escalation_level?: string
  escalation_count?: number
  created_at: string
  updated_at: string
  metadata?: any
  tags?: string[]
  source_system?: string
}

export function NotificationDetailModal({ isOpen, onClose, alertId }: NotificationDetailModalProps) {
  const { t, isRTL, language } = useLanguage()
  const [alert, setAlert] = useState<FullAlertDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [delegateHasVisit, setDelegateHasVisit] = useState(false)

  useEffect(() => {
    if (isOpen && alertId) {
      loadAlertDetails()
    }
  }, [isOpen, alertId])

  // Check if delegate has an active visit
  useEffect(() => {
    const checkDelegateVisit = async () => {
      if (!alert?.delegate_id) {
        setDelegateHasVisit(false)
        return
      }

      try {
        const { data: visits, error } = await supabase
          .from('visit_management')
          .select('id')
          .eq('delegate_id', alert.delegate_id)
          .eq('status', 'in_progress')
          .limit(1)

        if (error) {
          console.error('Error checking delegate visit:', error)
          setDelegateHasVisit(false)
        } else {
          setDelegateHasVisit((visits?.length || 0) > 0)
        }
      } catch (error) {
        console.error('Error checking delegate visit:', error)
        setDelegateHasVisit(false)
      }
    }

    if (alert?.delegate_id) {
      checkDelegateVisit()
      // Refresh every 30 seconds to get updated visit status
      const interval = setInterval(checkDelegateVisit, 30000)
      return () => clearInterval(interval)
    } else {
      setDelegateHasVisit(false)
    }
  }, [alert?.delegate_id])

  const loadAlertDetails = async () => {
    if (!alertId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('unified_alerts_notifications')
        .select('*')
        .eq('id', alertId)
        .single()

      if (error) {
        console.error('Error loading alert details:', error)
        return
      }

      setAlert(data as FullAlertDetails)

      // Mark as read when opened
      if (data && !data.is_read) {
        await markAsRead(alertId)
      }
    } catch (error) {
      console.error('Error loading alert details:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setMarkingAsRead(true)
    try {
      const { error } = await supabase
        .from('unified_alerts_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error marking alert as read:', error)
      } else if (alert) {
        setAlert({ ...alert, is_read: true })
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delivery': return Truck
      case 'vehicle': return Truck
      case 'warehouse': return Package
      case 'visit': return User
      case 'system': return Settings
      case 'maintenance': return Wrench
      case 'stock': return TrendingUp
      case 'user': return User
      default: return Bell
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("alerts.notAvailable") || "غير متاح"
    return new Date(dateString).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return t("alerts.notAvailable") || "غير متاح"
    return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !alertId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : alert ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {(() => {
                    const Icon = getCategoryIcon(alert.alert_type)
                    return <Icon className="h-6 w-6 mt-1" />
                  })()}
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">{alert.title}</DialogTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {t(`alerts.severity.${alert.severity}`) || alert.severity}
                      </Badge>
                      <Badge variant="outline">
                        {t(`alerts.category.${alert.category}`) || alert.category}
                      </Badge>
                      <Badge variant="outline">
                        {t(`alerts.type.${alert.alert_type}`) || alert.alert_type}
                      </Badge>
                      {alert.status === 'resolved' && (
                        <Badge className="bg-green-100 text-green-800">
                          {t("alerts.resolved") || "تم الحل"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Main Message */}
              <div className={`p-4 rounded-lg border ${getCategoryColor(alert.category)}`}>
                <p className="text-base font-medium mb-2">{t("alerts.message") || "الرسالة"}</p>
                <p className="text-gray-700">{alert.message}</p>
                {alert.description && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </>
                )}
              </div>

              {/* Alert Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{t("alerts.basicInfo") || "المعلومات الأساسية"}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("alerts.alertId") || "معرف التنبيه"}:</span>
                      <span className="font-mono">{alert.alert_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("alerts.status") || "الحالة"}:</span>
                      <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                        {t(`alerts.status.${alert.status}`) || alert.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("alerts.priority") || "الأولوية"}:</span>
                      <span>{t(`alerts.priority.${alert.priority}`) || alert.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("alerts.createdAt") || "تاريخ الإنشاء"}:</span>
                      <span>{formatDate(alert.created_at)}</span>
                    </div>
                    {alert.updated_at && alert.updated_at !== alert.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("alerts.updatedAt") || "تاريخ التحديث"}:</span>
                        <span>{formatDate(alert.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timing Information */}
                {(alert.scheduled_time || alert.actual_time || alert.delay_minutes) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{t("alerts.timingInfo") || "معلومات التوقيت"}</h3>
                    <div className="space-y-2 text-sm">
                      {alert.scheduled_time && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.scheduledTime") || "الوقت المجدول"}:</span>
                          <span className="font-medium">{formatTime(alert.scheduled_time)}</span>
                        </div>
                      )}
                      {alert.actual_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.actualTime") || "الوقت الفعلي"}:</span>
                          <span className="font-medium">{formatTime(alert.actual_time)}</span>
                        </div>
                      )}
                      {alert.delay_minutes !== null && alert.delay_minutes !== undefined && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-400" />
                          <span className="text-gray-600">{t("alerts.delay") || "التأخير"}:</span>
                          <span className="font-medium text-orange-600">
                            {alert.delay_minutes} {t("alerts.minutes") || "دقيقة"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Delegate/Representative Information */}
              {(alert.delegate_name || alert.delegate_id || alert.delegate_phone || alert.delegate_email) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t("alerts.delegateInfo") || "معلومات المندوب"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {alert.delegate_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.name") || "الاسم"}:</span>
                          <span className="font-medium">{alert.delegate_name}</span>
                          {delegateHasVisit && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
                              {t("onVisit") || "On Visit"}
                            </Badge>
                          )}
                        </div>
                      )}
                      {alert.delegate_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{t("alerts.delegateId") || "معرف المندوب"}:</span>
                          <span className="font-mono">{alert.delegate_id}</span>
                        </div>
                      )}
                      {alert.delegate_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.phone") || "الهاتف"}:</span>
                          <a href={`tel:${alert.delegate_phone}`} className="text-blue-600 hover:underline">
                            {alert.delegate_phone}
                          </a>
                        </div>
                      )}
                      {alert.delegate_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.email") || "البريد الإلكتروني"}:</span>
                          <a href={`mailto:${alert.delegate_email}`} className="text-blue-600 hover:underline">
                            {alert.delegate_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Customer Information */}
              {(alert.customer_name || alert.customer_address) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t("alerts.customerInfo") || "معلومات العميل"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {alert.customer_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.customerName") || "اسم العميل"}:</span>
                          <span className="font-medium">{alert.customer_name}</span>
                        </div>
                      )}
                      {alert.customer_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <span className="text-gray-600">{t("alerts.address") || "العنوان"}:</span>
                            <p className="font-medium">{alert.customer_address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Vehicle Information */}
              {(alert.vehicle_plate || alert.driver_name || alert.driver_phone) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {t("alerts.vehicleInfo") || "معلومات المركبة"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {alert.vehicle_plate && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.vehiclePlate") || "لوحة المركبة"}:</span>
                          <span className="font-medium">{alert.vehicle_plate}</span>
                        </div>
                      )}
                      {alert.driver_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.driverName") || "اسم السائق"}:</span>
                          <span className="font-medium">{alert.driver_name}</span>
                        </div>
                      )}
                      {alert.driver_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{t("alerts.driverPhone") || "هاتف السائق"}:</span>
                          <a href={`tel:${alert.driver_phone}`} className="text-blue-600 hover:underline">
                            {alert.driver_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Location */}
              {alert.location && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("alerts.location") || "الموقع"}
                    </h3>
                    <p className="text-sm text-gray-700">{alert.location}</p>
                  </div>
                </>
              )}

              {/* Escalation Information */}
              {alert.escalation_level && alert.escalation_level !== 'initial' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      {t("alerts.escalationInfo") || "معلومات التصعيد"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("alerts.escalationLevel") || "مستوى التصعيد"}:</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {t(`alerts.escalation.${alert.escalation_level}`) || alert.escalation_level}
                        </Badge>
                      </div>
                      {alert.escalation_count && alert.escalation_count > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("alerts.escalationCount") || "عدد التصعيدات"}:</span>
                          <span>{alert.escalation_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Resolution Information */}
              {alert.is_resolved && alert.resolved_at && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      {t("alerts.resolutionInfo") || "معلومات الحل"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("alerts.resolvedAt") || "تم الحل في"}:</span>
                        <span>{formatDate(alert.resolved_at)}</span>
                      </div>
                      {alert.resolved_by && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("alerts.resolvedBy") || "تم الحل بواسطة"}:</span>
                          <span>{alert.resolved_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Tags */}
              {alert.tags && alert.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{t("alerts.tags") || "العلامات"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {alert.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Source System */}
              {alert.source_system && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("alerts.sourceSystem") || "نظام المصدر"}:</span>
                    <Badge variant="outline">{alert.source_system}</Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                {t("common.close") || "إغلاق"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t("alerts.notFound") || "التنبيه غير موجود"}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


