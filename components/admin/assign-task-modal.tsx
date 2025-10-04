"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Timer,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AssignTaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string
  taskType?: 'inquiry' | 'complaint' | 'maintenance' | 'followup'
}

interface SupportAgent {
  id: string
  name: string
  email: string
  phone: string
  role: 'support_agent' | 'senior_agent' | 'team_lead' | 'manager'
  specializations: string[]
  current_workload: number
  max_workload: number
  performance_rating: number
  is_available: boolean
  avatar?: string
}

interface TaskAssignment {
  taskId: string
  taskType: string
  taskTitle: string
  customer: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  assignedToName: string
  dueDate: string
  notes: string
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
}

export function AssignTaskModal({ 
  isOpen, 
  onClose, 
  taskId, 
  taskType 
}: AssignTaskModalProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("assign")
  const [loading, setLoading] = useState(false)
  
  // Agents data
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<SupportAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null)
  
  // Task assignment data
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [newAssignment, setNewAssignment] = useState({
    taskId: taskId || '',
    taskType: taskType || 'inquiry',
    taskTitle: '',
    customer: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    dueDate: '',
    notes: ''
  })
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAgents()
      loadAssignments()
    }
  }, [isOpen])

  useEffect(() => {
    filterAgents()
  }, [agents, searchTerm, roleFilter, availabilityFilter])

  const loadAgents = async () => {
    setLoading(true)
    try {
      // Mock agents data
      const mockAgents: SupportAgent[] = [
        {
          id: "agent_001",
          name: "أحمد محمد",
          email: "ahmed.mohamed@company.com",
          phone: "+966501234567",
          role: "senior_agent",
          specializations: ["technical_support", "warranty_claims"],
          current_workload: 8,
          max_workload: 15,
          performance_rating: 4.8,
          is_available: true
        },
        {
          id: "agent_002",
          name: "فاطمة علي",
          email: "fatima.ali@company.com",
          phone: "+966501234568",
          role: "support_agent",
          specializations: ["customer_inquiries", "complaints"],
          current_workload: 5,
          max_workload: 10,
          performance_rating: 4.5,
          is_available: true
        },
        {
          id: "agent_003",
          name: "محمد السعيد",
          email: "mohamed.alsaeed@company.com",
          phone: "+966501234569",
          role: "team_lead",
          specializations: ["maintenance_requests", "follow_up_services"],
          current_workload: 12,
          max_workload: 20,
          performance_rating: 4.9,
          is_available: true
        },
        {
          id: "agent_004",
          name: "نور الدين",
          email: "nour.aldin@company.com",
          phone: "+966501234570",
          role: "manager",
          specializations: ["all"],
          current_workload: 15,
          max_workload: 25,
          performance_rating: 5.0,
          is_available: false
        },
        {
          id: "agent_005",
          name: "سارة أحمد",
          email: "sara.ahmed@company.com",
          phone: "+966501234571",
          role: "support_agent",
          specializations: ["customer_inquiries", "technical_support"],
          current_workload: 3,
          max_workload: 10,
          performance_rating: 4.3,
          is_available: true
        }
      ]
      
      setAgents(mockAgents)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async () => {
    try {
      // Mock assignments data
      const mockAssignments: TaskAssignment[] = [
        {
          taskId: "task_001",
          taskType: "inquiry",
          taskTitle: "استفسار حول تشغيل الجهاز",
          customer: "عبدالله أحمد",
          priority: "high",
          assignedTo: "agent_001",
          assignedToName: "أحمد محمد",
          dueDate: "2024-01-20",
          notes: "عميل VIP، يحتاج متابعة فورية",
          status: "assigned"
        },
        {
          taskId: "task_002",
          taskType: "complaint",
          taskTitle: "شكوى حول جودة المنتج",
          customer: "سارة محمد",
          priority: "urgent",
          assignedTo: "agent_002",
          assignedToName: "فاطمة علي",
          dueDate: "2024-01-18",
          notes: "شكوى عاجلة، تم تصعيدها",
          status: "in_progress"
        },
        {
          taskId: "task_003",
          taskType: "maintenance",
          taskTitle: "صيانة مضخة المياه",
          customer: "خالد عبدالرحمن",
          priority: "medium",
          assignedTo: "agent_003",
          assignedToName: "محمد السعيد",
          dueDate: "2024-01-22",
          notes: "صيانة دورية مجدولة",
          status: "assigned"
        }
      ]
      
      setAssignments(mockAssignments)
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  const filterAgents = () => {
    let filtered = agents

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(agent => agent.role === roleFilter)
    }

    // Availability filter
    if (availabilityFilter === "available") {
      filtered = filtered.filter(agent => agent.is_available)
    } else if (availabilityFilter === "busy") {
      filtered = filtered.filter(agent => !agent.is_available)
    }

    setFilteredAgents(filtered)
  }

  const handleAssignTask = async () => {
    if (!selectedAgent || !newAssignment.taskTitle || !newAssignment.customer) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setIsCreating(true)
    try {
      const assignment: TaskAssignment = {
        taskId: newAssignment.taskId || `task_${Date.now()}`,
        taskType: newAssignment.taskType,
        taskTitle: newAssignment.taskTitle,
        customer: newAssignment.customer,
        priority: newAssignment.priority,
        assignedTo: selectedAgent.id,
        assignedToName: selectedAgent.name,
        dueDate: newAssignment.dueDate,
        notes: newAssignment.notes,
        status: 'assigned'
      }

      // Add to assignments list
      setAssignments(prev => [assignment, ...prev])

      // Update agent workload
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { ...agent, current_workload: agent.current_workload + 1 }
          : agent
      ))

      // Reset form
      setNewAssignment({
        taskId: '',
        taskType: 'inquiry',
        taskTitle: '',
        customer: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        notes: ''
      })
      setSelectedAgent(null)

      alert('تم تعيين المهمة بنجاح!')
    } catch (error) {
      console.error('Error assigning task:', error)
      alert('حدث خطأ أثناء تعيين المهمة')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateAssignment = (assignmentId: string, updates: Partial<TaskAssignment>) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.taskId === assignmentId 
        ? { ...assignment, ...updates }
        : assignment
    ))
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.taskId === assignmentId)
    if (assignment) {
      // Update agent workload
      setAgents(prev => prev.map(agent => 
        agent.id === assignment.assignedTo 
          ? { ...agent, current_workload: Math.max(0, agent.current_workload - 1) }
          : agent
      ))
    }
    
    setAssignments(prev => prev.filter(assignment => assignment.taskId !== assignmentId))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return "bg-purple-100 text-purple-800"
      case 'team_lead':
        return "bg-blue-100 text-blue-800"
      case 'senior_agent':
        return "bg-green-100 text-green-800"
      case 'support_agent':
        return "bg-yellow-100 text-yellow-800"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800"
      case 'in_progress':
        return "bg-blue-100 text-blue-800"
      case 'assigned':
        return "bg-yellow-100 text-yellow-800"
      case 'cancelled':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-orange-600"
    return "text-green-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <span>تعيين المهام</span>
          </DialogTitle>
          <DialogDescription>
            تعيين المهام لأعضاء فريق الدعم وإدارة الأحمال
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث عن الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="manager">مدير</SelectItem>
                  <SelectItem value="team_lead">قائد فريق</SelectItem>
                  <SelectItem value="senior_agent">وكيل أول</SelectItem>
                  <SelectItem value="support_agent">وكيل دعم</SelectItem>
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="التوفر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="busy">مشغول</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setActiveTab("assign")}>
              <Plus className="h-4 w-4 mr-2" />
              تعيين مهمة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>فريق الدعم ({filteredAgents.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredAgents.map((agent) => (
                    <div 
                      key={agent.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium truncate">{agent.name}</h4>
                            <Badge className={getRoleColor(agent.role)}>
                              {agent.role === 'manager' ? 'مدير' :
                               agent.role === 'team_lead' ? 'قائد فريق' :
                               agent.role === 'senior_agent' ? 'وكيل أول' : 'وكيل دعم'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{agent.email}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{agent.performance_rating}</span>
                            </div>
                            <div className={`text-xs ${getWorkloadColor(agent.current_workload, agent.max_workload)}`}>
                              {agent.current_workload}/{agent.max_workload}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                agent.current_workload / agent.max_workload >= 0.9 ? 'bg-red-500' :
                                agent.current_workload / agent.max_workload >= 0.7 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(agent.current_workload / agent.max_workload) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.specializations.slice(0, 2).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {agent.specializations.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.specializations.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Assignment Form/Details */}
            <div className="lg:col-span-2">
              {activeTab === "assign" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>تعيين مهمة جديدة</CardTitle>
                    <CardDescription>
                      {selectedAgent ? `تعيين المهمة لـ ${selectedAgent.name}` : 'اختر موظف من القائمة'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-type">نوع المهمة</Label>
                        <Select 
                          value={newAssignment.taskType} 
                          onValueChange={(value: any) => setNewAssignment(prev => ({ ...prev, taskType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inquiry">استفسار</SelectItem>
                            <SelectItem value="complaint">شكوى</SelectItem>
                            <SelectItem value="maintenance">صيانة</SelectItem>
                            <SelectItem value="followup">متابعة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">الأولوية</Label>
                        <Select 
                          value={newAssignment.priority} 
                          onValueChange={(value: any) => setNewAssignment(prev => ({ ...prev, priority: value }))}
                        >
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task-title">عنوان المهمة *</Label>
                      <Input
                        id="task-title"
                        value={newAssignment.taskTitle}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, taskTitle: e.target.value }))}
                        placeholder="عنوان المهمة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer">العميل *</Label>
                      <Input
                        id="customer"
                        value={newAssignment.customer}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, customer: e.target.value }))}
                        placeholder="اسم العميل"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date">تاريخ الاستحقاق</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newAssignment.dueDate}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات</Label>
                      <Textarea
                        id="notes"
                        value={newAssignment.notes}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="ملاحظات إضافية..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" onClick={() => setActiveTab("assignments")}>
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleAssignTask}
                        disabled={!selectedAgent || isCreating || !newAssignment.taskTitle || !newAssignment.customer}
                      >
                        {isCreating ? 'جاري التعيين...' : 'تعيين المهمة'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>المهام المعينة ({assignments.length})</CardTitle>
                    <CardDescription>
                      عرض وإدارة المهام المعينة لأعضاء الفريق
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignments.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مهام معينة</h3>
                          <p className="text-gray-500">لم يتم تعيين أي مهام بعد</p>
                        </div>
                      ) : (
                        assignments.map((assignment) => (
                          <div key={assignment.taskId} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{assignment.taskTitle}</h4>
                                  <Badge className={getPriorityColor(assignment.priority)}>
                                    {assignment.priority === 'urgent' ? 'عاجل' :
                                     assignment.priority === 'high' ? 'عالي' :
                                     assignment.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                  </Badge>
                                  <Badge className={getStatusColor(assignment.status)}>
                                    {assignment.status === 'completed' ? 'مكتمل' :
                                     assignment.status === 'in_progress' ? 'قيد التنفيذ' :
                                     assignment.status === 'assigned' ? 'معين' : 'ملغي'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>العميل: {assignment.customer}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>المسؤول: {assignment.assignedToName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>الاستحقاق: {assignment.dueDate}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>النوع: {assignment.taskType}</span>
                                  </div>
                                </div>

                                {assignment.notes && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>ملاحظات:</strong> {assignment.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Select 
                                  value={assignment.status} 
                                  onValueChange={(value: any) => handleUpdateAssignment(assignment.taskId, { status: value })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="assigned">معين</SelectItem>
                                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment.taskId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
