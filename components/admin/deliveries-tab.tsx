"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Clock, Package, Filter, Download, User, Truck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTaskModal } from "./create-task-modal"
import { TaskDetailsModal } from "./task-details-modal"
import { useLanguage } from "@/contexts/language-context"

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
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (task: any) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

  const handleCreateTask = (newTask: any) => {
    const task = {
      id: `T${String(Date.now()).slice(-3)}`,
      ...newTask,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [task, ...prev])
  }

  const handleUpdateTask = (updatedTask: any) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
    setIsDetailsModalOpen(false)
  }

  const getTaskStats = () => {
    const pending = tasks.filter((t) => t.status === "pending").length
    const assigned = tasks.filter((t) => t.status === "assigned").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const completed = tasks.filter((t) => t.status === "completed").length

    return { pending, assigned, inProgress, completed }
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("deliveryTaskManagement")}</h2>
          <p className="text-gray-600">{t("createAssignTrackTasks")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
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
                <p className="text-xl font-bold">{stats.inProgress}</p>
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchTasksPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t("filter")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                    <p className="text-sm text-gray-500">ID: {task.id}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">{task.customer.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{task.customer.address.split(",")[0]}</span>
                    </div>
                  </div>

                  <div>
                    {task.driver ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.driver.avatar || "/placeholder.svg"} alt={task.driver.name} />
                          <AvatarFallback className="text-xs">
                            {task.driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{task.driver.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">{t("unassigned")}</span>
                    )}
                  </div>

                  <div>
                    <Badge className={getStatusColor(task.status)}>{t(task.status.replace("-", ""))}</Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(task.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Clock className="h-3 w-3" />
                      {task.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {task.distance}
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
                        <DropdownMenuItem>{t("assignRepresentative")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("updateStatus")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("trackLocation")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">{t("cancelTask")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
