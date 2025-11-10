"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Clock, Package, Filter, Download, User, Truck, Trash2, Calendar, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CreateTaskModal } from "./create-task-modal"
import { TaskDetailsModal } from "./task-details-modal"
import { ProofPhotosInline } from "@/components/ui/proof-photos-display"
import { useLanguage } from "@/contexts/language-context"
import { getDeliveryTasks, getDeliveryTaskStats, deleteDeliveryTask } from "@/lib/delivery-tasks"
import { exportDeliveryTasksToExcel } from "@/lib/excel-export"
import { useToast } from "@/hooks/use-toast"
import type { DeliveryTask } from "@/types/delivery-tasks"

const mockTasks = [
  {
    id: "T001",
    title: "Electronics Delivery",
    customer: {
      id: "C001",
      name: "John Doe",
      address: "123 Main St, Downtown, City 12345",
      phone: "+1 (555) 123-4567",
    },
    driver: {
      id: "1",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "in-progress",
    priority: "high",
    estimatedTime: "45 mins",
    distance: "12.5 km",
    createdAt: "2024-01-16T09:00:00Z",
    scheduledFor: "2024-01-16T10:30:00Z",
    items: ["Laptop", "Mouse", "Keyboard"],
    notes: "Handle with care - fragile items",
  },
  {
    id: "T002",
    title: "Grocery Delivery",
    customer: {
      id: "C002",
      name: "Jane Smith",
      address: "456 Oak Ave, North Zone, City 12345",
      phone: "+1 (555) 234-5678",
    },
    driver: {
      id: "2",
      name: "Sarah Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "assigned",
    priority: "medium",
    estimatedTime: "30 mins",
    distance: "8.2 km",
    createdAt: "2024-01-16T08:30:00Z",
    scheduledFor: "2024-01-16T11:00:00Z",
    items: ["Groceries", "Fresh produce"],
    notes: "Customer prefers contactless delivery",
  },
  {
    id: "T003",
    title: "Document Delivery",
    customer: {
      id: "C003",
      name: "Bob Johnson",
      address: "789 Pine Rd, East District, City 12345",
      phone: "+1 (555) 345-6789",
    },
    driver: null,
    status: "pending",
    priority: "urgent",
    estimatedTime: "20 mins",
    distance: "5.1 km",
    createdAt: "2024-01-16T10:00:00Z",
    scheduledFor: "2024-01-16T12:00:00Z",
    items: ["Legal documents", "Contracts"],
    notes: "Requires signature confirmation",
  },
  {
    id: "T004",
    title: "Furniture Delivery",
    customer: {
      id: "C004",
      name: "Alice Brown",
      address: "321 Elm St, West Zone, City 12345",
      phone: "+1 (555) 456-7890",
    },
    driver: {
      id: "3",
      name: "David Chen",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "completed",
    priority: "low",
    estimatedTime: "60 mins",
    distance: "15.8 km",
    createdAt: "2024-01-16T07:00:00Z",
    scheduledFor: "2024-01-16T09:00:00Z",
    items: ["Office chair", "Desk lamp"],
    notes: "Assembly required",
  },
]

export function DeliveriesTab() {
  const { t, isRTL } = useLanguage()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [tasks, setTasks] = useState<DeliveryTask[]>([])
  const [selectedTask, setSelectedTask] = useState<DeliveryTask | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [taskToDelete, setTaskToDelete] = useState<DeliveryTask | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    in_progress: 0,
    completed: 0
  })
  // Add real-time location tracking for assigned representatives
  const [representativeLocations, setRepresentativeLocations] = useState<Record<string, {lat: number, lng: number, timestamp: string}>>({})
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  
  // Date filtering states
  const [dateFilter, setDateFilter] = useState<string>("all") // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")

  // Load delivery tasks from Supabase with pagination
  const loadDeliveryTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getDeliveryTasks()
      setTasks(data)
      setFilteredTasks(data)
      
      // Load real-time locations for assigned representatives
      await loadRepresentativeLocations(data)
    } catch (error) {
      console.error('Error loading delivery tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load delivery tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load representative locations for real-time tracking
  const loadRepresentativeLocations = useCallback(async (tasks: DeliveryTask[]) => {
    try {
      setIsLocationLoading(true)
      
      // Get unique representative IDs from assigned tasks
      const assignedRepresentativeIds = [...new Set(
        tasks
          .filter(task => task.representative_id && task.status === 'in_progress')
          .map(task => task.representative_id)
      )]

      if (assignedRepresentativeIds.length === 0) {
        setRepresentativeLocations({})
        setIsLocationLoading(false)
        return
      }

      // Fetch live locations for assigned representatives (only locations updated within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: locations, error } = await supabase
        .from('representative_live_locations')
        .select('representative_id, latitude, longitude, timestamp')
        .in('representative_id', assignedRepresentativeIds)
        .gte('timestamp', thirtyMinutesAgo)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error loading representative locations:', error)
        setIsLocationLoading(false)
        return
      }

      if (locations) {
        const locationMap: Record<string, {lat: number, lng: number, timestamp: string}> = {}
        locations.forEach(loc => {
          if (loc.latitude && loc.longitude) {
            locationMap[loc.representative_id] = {
              lat: loc.latitude,
              lng: loc.longitude,
              timestamp: loc.timestamp
            }
          }
        })
        setRepresentativeLocations(locationMap)
      }
      
      setIsLocationLoading(false)
    } catch (error) {
      console.error('Error loading representative locations:', error)
      setIsLocationLoading(false)
    }
  }, [supabase])

  // Set up real-time location updates
  useEffect(() => {
    // Initial load
    loadRepresentativeLocations(filteredTasks)

    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      loadRepresentativeLocations(filteredTasks)
    }, 30000)

    setLocationUpdateInterval(interval)

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [filteredTasks, loadRepresentativeLocations])

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval)
      }
    }
  }, [locationUpdateInterval])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getDeliveryTaskStats()
      setStats({
        pending: statsData.pending,
        assigned: statsData.assigned,
        in_progress: statsData.in_progress,
        completed: statsData.completed
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [fetchTasks, fetchStats])

  const handleExportTasks = () => {
    try {
      const dateRange = getDateRange()
      let tasksToExport = tasks

      if (dateRange && dateRange.start && dateRange.end) {
        tasksToExport = tasks.filter(task => {
          const taskDate = new Date(task.created_at)
          const fromDate = new Date(dateRange.start!)
          const toDate = new Date(dateRange.end!)
          return taskDate >= fromDate && taskDate <= toDate
        })
      }

      if (tasksToExport.length === 0) {
        toast({
          title: "No tasks to export",
          description: "No tasks found for the selected date range",
          variant: "destructive",
        })
        return
      }

      exportDeliveryTasksToExcel(tasksToExport, {
        filename: `delivery-tasks-${dateFilter}`,
        sheetName: 'Delivery Tasks'
      })

      toast({
        title: "Success",
        description: `Exported ${tasksToExport.length} delivery tasks`,
      })
    } catch (error) {
      console.error('Error exporting tasks:', error)
      toast({
        title: "Export failed",
        description: "Failed to export delivery tasks",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
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
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get date range based on filter - improved with better validation
  const getDateRange = () => {
    const now = new Date()
    switch (dateFilter) {
      case "today":
        return {
          start: startOfDay(now).toISOString(),
          end: endOfDay(now).toISOString()
        }
      case "week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          end: endOfWeek(now, { weekStartsOn: 1 }).toISOString()
        }
      case "month":
        return {
          start: startOfMonth(now).toISOString(),
          end: endOfMonth(now).toISOString()
        }
      case "custom":
        try {
          const startDate = customStartDate ? new Date(customStartDate) : null
          const endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : null
          
          // Validate custom dates
          if (startDate && isNaN(startDate.getTime())) {
            console.warn('Invalid custom start date:', customStartDate)
            return { start: null, end: null }
          }
          if (endDate && isNaN(endDate.getTime())) {
            console.warn('Invalid custom end date:', customEndDate)
            return { start: null, end: null }
          }
          
          // Ensure end date is after start date
          if (startDate && endDate && endDate < startDate) {
            console.warn('End date before start date, swapping')
            return { 
              start: endDate.toISOString(), 
              end: startDate.toISOString() 
            }
          }
          
          return {
            start: startDate ? startDate.toISOString() : null,
            end: endDate ? endDate.toISOString() : null
          }
        } catch (error) {
          console.error('Custom date range error:', error)
          return { start: null, end: null }
        }
      default:
        return { start: null, end: null }
    }
  }

  // Filter tasks based on search and date filter
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    // Date filter - improved logic with better date field selection
    if (dateFilter === "all") return true
    
    const dateRange = getDateRange()
    if (!dateRange.start || !dateRange.end) return true
    
    // Use created_at as primary date field, fallback to scheduled_for
    const taskDateStr = task.created_at || task.scheduled_for
    if (!taskDateStr) return true
    
    try {
      const taskDate = new Date(taskDateStr)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      
      // Validate dates
      if (isNaN(taskDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid date found:', { taskDateStr, dateRange })
        return true // Include task if date parsing fails
      }
      
      return taskDate >= startDate && taskDate <= endDate
    } catch (error) {
      console.error('Date filtering error:', error)
      return true // Include task on error
    }
  })

  // Helper function to escape CSV values properly
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Replace newlines and quotes
    return str.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')
  }

  // Helper function to translate status and priority
  const translateStatus = (status: string): string => {
    if (!isRTL) return status
    const translations: { [key: string]: string } = {
      'pending': 'قيد الانتظار',
      'assigned': 'مُسند',
      'in-progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    }
    return translations[status] || status
  }

  const translatePriority = (priority: string): string => {
    if (!isRTL) return priority
    const translations: { [key: string]: string } = {
      'urgent': 'عاجل',
      'high': 'عالية',
      'medium': 'متوسطة',
      'low': 'منخفضة'
    }
    return translations[priority] || priority
  }

  // Export function
  const handleExport = () => {
    if (filteredTasks.length === 0) {
      toast({
        title: isRTL ? "لا توجد بيانات للتصدير" : "No data to export",
        description: isRTL ? "لا توجد مهام للتصدير" : "No tasks to export",
        variant: "destructive",
      })
      return
    }

    // Prepare CSV content with Arabic support
    const headers = [
      isRTL ? "رقم المهمة" : "Task ID",
      isRTL ? "العنوان" : "Title",
      isRTL ? "العميل" : "Customer",
      isRTL ? "عنوان العميل" : "Customer Address",
      isRTL ? "هاتف العميل" : "Customer Phone",
      isRTL ? "المندوب" : "Representative",
      isRTL ? "الحالة" : "Status",
      isRTL ? "الأولوية" : "Priority",
      isRTL ? "القيمة الإجمالية" : "Total Value",
      isRTL ? "العملة" : "Currency",
      isRTL ? "تاريخ الإنشاء" : "Created At",
      isRTL ? "تاريخ الجدولة" : "Scheduled For",
      isRTL ? "تاريخ الإكمال" : "Completed At",
      isRTL ? "المدة المقدرة" : "Estimated Duration",
      isRTL ? "الملاحظات" : "Notes"
    ]

    const csvRows = [
      headers.join(','),
      ...filteredTasks.map(task => [
        `"${escapeCSV(task.task_id)}"`,
        `"${escapeCSV(task.title)}"`,
        `"${escapeCSV(task.customer_name)}"`,
        `"${escapeCSV(task.customer_address)}"`,
        `"${escapeCSV(task.customer_phone)}"`,
        `"${escapeCSV(task.representative_name || (isRTL ? 'غير مُسند' : 'Unassigned'))}"`,
        `"${escapeCSV(translateStatus(task.status))}"`,
        `"${escapeCSV(translatePriority(task.priority))}"`,
        `"${escapeCSV(task.total_value || 0)}"`,
        `"${escapeCSV(task.currency || 'IQD')}"`,
        `"${task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
        `"${task.scheduled_for ? format(new Date(task.scheduled_for), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
        `"${task.completed_at ? format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
        `"${escapeCSV(task.estimated_duration)}"`,
        `"${escapeCSV(task.notes)}"`
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Add UTF-8 BOM for proper Arabic display in Excel
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    let filename = isRTL ? `مهام_التوصيل_${format(new Date(), 'yyyy-MM-dd')}.csv` : `delivery_tasks_${format(new Date(), 'yyyy-MM-dd')}.csv`
    if (dateFilter !== "all") {
      const filterLabel = dateFilter === "today" ? (isRTL ? "اليوم" : "today") : 
                         dateFilter === "week" ? (isRTL ? "أسبوع" : "week") : 
                         dateFilter === "month" ? (isRTL ? "شهر" : "month") : 
                         (isRTL ? "مخصص" : "custom")
      filename = isRTL ? `مهام_التوصيل_${filterLabel}_${format(new Date(), 'yyyy-MM-dd')}.csv` : 
                `delivery_tasks_${filterLabel}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    }
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: isRTL ? "تم التصدير بنجاح" : "Export successful",
      description: isRTL ? `تم تصدير ${filteredTasks.length} مهمة` : `Exported ${filteredTasks.length} tasks`,
    })
  }

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter("all")
    setCustomStartDate("")
    setCustomEndDate("")
  }

  const handleViewDetails = (task: DeliveryTask) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: DeliveryTask['status'], notes?: string) => {
    try {
      // Update the task locally first for immediate UI feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}),
                updated_at: new Date().toISOString()
              }
            : task
        )
      )

      // Refresh stats to reflect the status change
      await fetchStats()

      toast({
        title: "Success",
        description: `Task status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
      // Revert the local change on error
      await fetchTasks()
    }
  }

  const handleAssignRepresentative = (task: DeliveryTask) => {
    // Open representative assignment modal with pre-filled task data
    setSelectedTask(task)
    setIsCreateModalOpen(true)
    toast({
      title: "Assign Representative",
      description: `Assign representative to delivery task #${task.id.slice(-6)}`,
    })
  }

  const handleCancelTask = (task: DeliveryTask) => {
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      await deleteDeliveryTask(taskToDelete.id)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id))
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateTask = async (newTask: DeliveryTask) => {
    try {
      await fetchTasks() // Refresh the tasks list
      await fetchStats() // Refresh the stats
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error) {
      console.error('Error refreshing tasks:', error)
    }
  }

  const handleUpdateTask = (updatedTask: DeliveryTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
    setIsDetailsModalOpen(false)
    fetchStats() // Refresh stats after update
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("deliveryTaskManagement")}</h2>
          <p className="text-gray-600">{t("createAssignTrackTasks")}</p>
        </div>
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isLocationLoading && (
            <Badge variant="secondary" className="animate-pulse">
              📍 Updating locations...
            </Badge>
          )}
          <Button variant="outline" onClick={handleExport} className={isRTL ? 'flex-row-reverse' : ''}>
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("export")}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className={isRTL ? 'flex-row-reverse' : ''}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("createTask")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("pendingTasks")}</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("assigned")}</p>
                <p className="text-xl font-bold">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("inProgress")}</p>
                <p className="text-xl font-bold">{stats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("completed")}</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
              <Input
                placeholder={t("searchTasksPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                  <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("filter")}
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className={`ml-2 ${isRTL ? 'mr-2 ml-0' : ''}`}>
                      {dateFilter === "today" ? (isRTL ? "اليوم" : "Today") :
                       dateFilter === "week" ? (isRTL ? "أسبوع" : "Week") :
                       dateFilter === "month" ? (isRTL ? "شهر" : "Month") :
                       (isRTL ? "مخصص" : "Custom")}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h4 className="font-medium">{isRTL ? "تصفية حسب التاريخ" : "Filter by Date"}</h4>
                    {dateFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDateFilter}
                        className={isRTL ? 'flex-row-reverse' : ''}
                      >
                        <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? "مسح" : "Clear"}
                      </Button>
                    )}
                  </div>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر الفترة" : "Select period"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? "جميع التواريخ" : "All Dates"}</SelectItem>
                      <SelectItem value="today">{isRTL ? "اليوم" : "Today"}</SelectItem>
                      <SelectItem value="week">{isRTL ? "هذا الأسبوع" : "This Week"}</SelectItem>
                      <SelectItem value="month">{isRTL ? "هذا الشهر" : "This Month"}</SelectItem>
                      <SelectItem value="custom">{isRTL ? "فترة مخصصة" : "Custom Range"}</SelectItem>
                    </SelectContent>
                  </Select>

                  {dateFilter === "custom" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {isRTL ? "تاريخ البداية" : "Start Date"}
                        </label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {isRTL ? "تاريخ النهاية" : "End Date"}
                        </label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </div>
                  )}

                  {dateFilter !== "all" && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        {isRTL ? "سيتم تصدير المهام المفلترة فقط" : "Only filtered tasks will be exported"}
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{isRTL ? "لا توجد مهام" : "No tasks found"}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p className="text-sm text-gray-600">
                  {isRTL ? `تم العثور على ${filteredTasks.length} من ${tasks.length} مهمة` : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
                </p>
                {dateFilter !== "all" && (
                  <Badge variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                    <Calendar className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {dateFilter === "today" ? (isRTL ? "اليوم" : "Today") :
                     dateFilter === "week" ? (isRTL ? "هذا الأسبوع" : "This Week") :
                     dateFilter === "month" ? (isRTL ? "هذا الشهر" : "This Month") :
                     (isRTL ? "فترة مخصصة" : "Custom Range")}
                  </Badge>
                )}
              </div>
              {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {t(task.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">ID: {task.task_id}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">{task.customer_name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{task.customer_address.split(",")[0]}</span>
                    </div>
                  </div>

                  <div>
                    {task.representative_name ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" alt={task.representative_name} />
                          <AvatarFallback className="text-xs">
                            {task.representative_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{task.representative_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">{t("unassigned")}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>{t(task.status.replace("-", ""))}</Badge>
                      {task.representative_id && (
                        <Badge variant="outline" className="text-xs">
                          Rep: {task.representative_id.slice(0, 8)}
                        </Badge>
                      )}
                      {task.representative_id && representativeLocations[task.representative_id] && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          🟢 Live Location
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.scheduled_for ? new Date(task.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : 'Not scheduled'}
                    </p>
                    {/* Show proof photos inline for completed tasks */}
                    {task.status === 'completed' && task.proof_photos && task.proof_photos.length > 0 && (
                      <div className="mt-2">
                        <ProofPhotosInline photos={task.proof_photos} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Clock className="h-3 w-3" />
                      {task.estimated_duration || 'Not set'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="h-3 w-3" />
                      {task.total_value ? `${task.total_value.toLocaleString()} ${task.currency}` : 'No items'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(task)}>{t("viewDetails")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignRepresentative(task)}>{t("assignRepresentative")}</DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>{t("updateStatus")}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'pending')}>
                              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                              {t("pending")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'assigned')}>
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {t("assigned")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                              {t("inProgress")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {t("completed")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')} className="text-red-600">
                              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                              {t("cancelled")}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem>{t("trackLocation")}</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCancelTask(task)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("cancelTask")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onUpdate={handleUpdateTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteTaskConfirmation")} "{taskToDelete?.title}"? {t("deleteTaskWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
