"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  XCircle
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ConnectionStatus } from "@/components/ui/connection-status"
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
  getAfterSalesMetrics
} from "@/lib/after-sales"

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

  useEffect(() => {
    loadData()
  }, [])

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
        getAfterSalesMetrics(),
        getCustomerInquiries(),
        getComplaints(),
        getMaintenanceRequests(),
        getWarranties(),
        getWarrantyClaims(),
        getFollowUpServices()
      ])

      setMetrics(metricsData)
      setInquiries(inquiriesData)
      setComplaints(complaintsData)
      setMaintenanceRequests(maintenanceData)
      setWarranties(warrantiesData)
      setWarrantyClaims(claimsData)
      setFollowUpServices(followUpsData)
    } catch (error) {
      console.error('Error loading after-sales data:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("afterSalesSupport")}</h2>
          <p className="text-gray-600">{t("manageCustomerSupport")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <ConnectionStatus className="w-48" />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("newSupportCase")}
          </Button>
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
                <div className="text-2xl font-bold">{metrics?.customer_satisfaction_score || 0}/5</div>
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {inquiries.map((inquiry) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {complaints.map((complaint) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {warranties.map((warranty) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filter")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {followUpServices.map((service) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
