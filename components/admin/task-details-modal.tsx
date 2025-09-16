"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Package,
  User,
  MapPin,
  Clock,
  Phone,
  Mail,
  Truck,
  Save,
  X,
  Navigation,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface TaskDetailsModalProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onUpdate: (task: any) => void
}

const mockRepresentatives = [
  { id: "1", name: "Mike Johnson", status: "available" },
  { id: "2", name: "Sarah Wilson", status: "available" },
  { id: "3", name: "David Chen", status: "busy" },
  { id: "4", name: "Emma Rodriguez", status: "available" },
]

export function TaskDetailsModal({ task, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)

  if (!task) return null

  const handleSave = () => {
    onUpdate(editedTask)
    setIsEditing(false)
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

  const taskHistory = [
    {
      timestamp: "2024-01-16T09:00:00Z",
      action: "Task created",
      user: "Admin",
      details: "Task created and assigned priority",
    },
    {
      timestamp: "2024-01-16T09:15:00Z",
      action: "Representative assigned",
      user: task.representative?.name || "Representative",
      details: `Assigned to ${task.representative?.name || "representative"}`,
    },
    {
      timestamp: "2024-01-16T10:30:00Z",
      action: "Task started",
      user: task.representative?.name || "Representative",
      details: "Representative started the delivery",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Package className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">{task.title}</h2>
                <p className="text-sm text-gray-600">Task ID: {task.id}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Task Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ").toUpperCase()}</Badge>
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <Label>Items to Deliver</Label>
                    <div className="mt-1">
                      {task.items.map((item: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm mr-2 mb-1"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Scheduled Time</Label>
                    <p className="text-sm font-medium mt-1">{new Date(task.scheduledFor).toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Estimated Time</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{task.estimatedTime}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Distance</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{task.distance}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={editedTask.notes}
                        onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{task.notes || "No special instructions"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Assigned Representative</Label>
                    {isEditing ? (
                      <Select
                        value={editedTask.representative?.id || "unassigned"}
                        onValueChange={(value) => {
                          const selectedRepresentative = mockRepresentatives.find((r) => r.id === value)
                          setEditedTask({
                            ...editedTask,
                            representative: selectedRepresentative
                              ? {
                                  id: selectedRepresentative.id,
                                  name: selectedRepresentative.name,
                                  avatar: "/placeholder.svg?height=32&width=32",
                                }
                              : null,
                            status: selectedRepresentative ? "assigned" : "pending",
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select representative" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {mockRepresentatives
                            .filter((r) => r.status === "available")
                            .map((representative) => (
                              <SelectItem key={representative.id} value={representative.id}>
                                {representative.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : task.representative ? (
                      <div className="flex items-center gap-3 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.representative.avatar || "/placeholder.svg"} alt={task.representative.name} />
                          <AvatarFallback>
                            {task.representative.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{task.representative.name}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Unassigned</p>
                    )}
                  </div>

                  <div>
                    <Label>Task Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedTask.status}
                        onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        {task.status.replace("-", " ").toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label>Priority</Label>
                    {isEditing ? (
                      <Select
                        value={editedTask.priority}
                        onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}
                      >
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
                    ) : (
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button className="w-full bg-transparent" variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      View Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Customer Name</Label>
                  <p className="text-lg font-medium mt-1">{task.customer.name}</p>
                </div>

                <div>
                  <Label>Delivery Address</Label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm font-medium">{task.customer.address}</p>
                  </div>
                </div>

                <div>
                  <Label>Contact Information</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{task.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{task.customer.id}@email.com</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600 mb-4">Track driver location and delivery progress in real-time</p>
                  <Button>
                    <Navigation className="h-4 w-4 mr-2" />
                    Open Map View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Task History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-1 bg-blue-100 rounded-full">
                        {entry.action.includes("completed") ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : entry.action.includes("problem") ? (
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{entry.action}</span>
                          <span className="text-xs text-gray-500">by {entry.user}</span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
