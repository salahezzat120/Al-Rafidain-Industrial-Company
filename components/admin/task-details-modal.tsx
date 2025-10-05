"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, User, AlertCircle, Edit, Trash2, Save, X, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { updateDeliveryTask, deleteDeliveryTask } from "@/lib/delivery-tasks"
import { getRepresentatives } from "@/lib/supabase-utils"
import { ProofPhotosDisplay } from "@/components/ui/proof-photos-display"
import { OpenStreetMapDisplay } from "@/components/ui/openstreetmap-display"
import type { DeliveryTask, UpdateDeliveryTaskData } from "@/types/delivery-tasks"

interface TaskDetailsModalProps {
  task: DeliveryTask | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (task: DeliveryTask) => void
}

// Representative interface
interface Representative {
  id: string;
  name: string;
  status: string;
}

export function TaskDetailsModal({ task, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [isLoadingRepresentatives, setIsLoadingRepresentatives] = useState(false)

  // Load representatives from Supabase
  const loadRepresentatives = useCallback(async () => {
    try {
      setIsLoadingRepresentatives(true)
      console.log('🔄 Loading representatives...')
      
      const result = await getRepresentatives()
      console.log('📋 Raw representatives result:', result)
      console.log('📋 Result type:', typeof result)
      
      // Handle the result format from supabase-utils
      if (result.error) {
        console.error('❌ Error from getRepresentatives:', result.error)
        setRepresentatives([])
        return
      }
      
      const representativesData = result.data
      console.log('📋 Representatives data:', representativesData)
      console.log('📋 Data type:', typeof representativesData)
      console.log('📋 Is array:', Array.isArray(representativesData))
      
      // Ensure representativesData is an array
      if (!Array.isArray(representativesData)) {
        console.error('❌ Representatives data is not an array:', representativesData)
        setRepresentatives([])
        return
      }
      
      if (representativesData.length === 0) {
        console.log('📋 No representatives found')
        setRepresentatives([])
        return
      }
      
      console.log('📋 Representatives data length:', representativesData.length)
      
      const mappedRepresentatives = representativesData.map(rep => ({
        id: rep.id?.toString() || '',
        name: rep.name || '',
        status: rep.status || 'available'
      }))
      
      console.log('📋 Mapped representatives:', mappedRepresentatives)
      setRepresentatives(mappedRepresentatives)
    } catch (error) {
      console.error('❌ Error loading representatives:', error)
      setRepresentatives([]) // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load representatives",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRepresentatives(false)
    }
  }, [toast])

  // Load representatives when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRepresentatives()
    }
  }, [isOpen, loadRepresentatives])

  const [editData, setEditData] = useState<UpdateDeliveryTaskData>({
    title: "",
    description: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    representative_id: "",
    representative_name: "",
    status: "pending",
    priority: "medium",
    estimated_duration: "",
    scheduled_for: "",
    notes: "",
  })

  // Initialize edit data when task changes
  useState(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description || "",
        customer_name: task.customer_name,
        customer_address: task.customer_address,
        customer_phone: task.customer_phone || "",
        representative_id: task.representative_id || "",
        representative_name: task.representative_name || "",
        status: task.status,
        priority: task.priority,
        estimated_duration: task.estimated_duration || "",
        scheduled_for: task.scheduled_for ? new Date(task.scheduled_for).toISOString().slice(0, 16) : "",
        notes: task.notes || "",
      })
    }
  })

  const handleSave = async () => {
    if (!task) return

    setIsSaving(true)
    try {
      const updatedTask = await updateDeliveryTask(task.id, editData)
      onUpdate(updatedTask)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    setIsDeleting(true)
    try {
      await deleteDeliveryTask(task.id)
      onClose()
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

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Task Details - {task.task_id}
            </DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                Task Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{task.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}>
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
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  {isEditing ? (
                    <Select value={editData.priority} onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value as any }))}>
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
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimated_duration">Estimated Duration</Label>
                  {isEditing ? (
                    <Input
                      id="estimated_duration"
                      value={editData.estimated_duration}
                      onChange={(e) => setEditData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                      placeholder="e.g., 30 mins"
                    />
                  ) : (
                    <p className="text-sm">{task.estimated_duration || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{task.description || 'No description'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  {isEditing ? (
                    <Input
                      id="customer_name"
                      value={editData.customer_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{task.customer_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customer_phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="customer_phone"
                      value={editData.customer_phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">{task.customer_phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="customer_address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="customer_address"
                    value={editData.customer_address}
                    onChange={(e) => setEditData(prev => ({ ...prev, customer_address: e.target.value }))}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{task.customer_address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="representative">Assigned Representative</Label>
                    {isEditing ? (
                      <Select value={editData.representative_id || "unassigned"} onValueChange={(value) => {
                        if (value === "unassigned") {
                          setEditData(prev => ({ 
                            ...prev, 
                            representative_id: "",
                            representative_name: ""
                          }))
                        } else {
                          const rep = representatives.find(r => r.id === value)
                          setEditData(prev => ({ 
                            ...prev, 
                            representative_id: value,
                            representative_name: rep?.name || ""
                          }))
                        }
                      }} disabled={isLoadingRepresentatives}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingRepresentatives ? "Loading..." : "Select representative"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {isLoadingRepresentatives ? (
                            <SelectItem value="loading" disabled>
                              Loading representatives...
                            </SelectItem>
                          ) : representatives.length === 0 ? (
                            <SelectItem value="no-representatives" disabled>
                              No representatives available
                            </SelectItem>
                          ) : (
                            representatives.map((rep) => (
                              <SelectItem key={rep.id} value={rep.id}>
                                {rep.name} ({rep.status === 'active' ? 'Available' : rep.status})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{task.representative_name || 'Unassigned'}</p>
                    )}
                  </div>

                <div>
                  <Label htmlFor="scheduled_for">Scheduled For</Label>
                  {isEditing ? (
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={editData.scheduled_for}
                      onChange={(e) => setEditData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm">
                      {task.scheduled_for ? new Date(task.scheduled_for).toLocaleString() : 'Not scheduled'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Special instructions or notes..."
                  />
                ) : (
                  <p className="text-sm">{task.notes || 'No notes'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          {(task.start_latitude && task.start_longitude) || (task.end_latitude && task.end_longitude) ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('taskDetails.locationInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OpenStreetMapDisplay
                  startLocation={task.start_latitude && task.start_longitude ? {
                    latitude: task.start_latitude,
                    longitude: task.start_longitude,
                    address: task.start_address,
                    timestamp: task.start_timestamp,
                    label: 'Start Location'
                  } : undefined}
                  endLocation={task.end_latitude && task.end_longitude ? {
                    latitude: task.end_latitude,
                    longitude: task.end_longitude,
                    address: task.end_address,
                    timestamp: task.end_timestamp,
                    label: 'End Location'
                  } : undefined}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Task Items */}
          {task.items && task.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-500">
                          Code: {item.product_code} | Qty: {item.quantity} {item.unit_of_measurement}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.total_price.toLocaleString()} {task.currency}</div>
                        <div className="text-sm text-gray-500">{item.unit_price.toLocaleString()} {task.currency} each</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Value:</span>
                      <span>{task.total_value.toLocaleString()} {task.currency}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proof Photos - Only show for completed tasks */}
          {task.status === 'completed' && task.proof_photos && task.proof_photos.length > 0 && (
            <ProofPhotosDisplay
              photos={task.proof_photos}
              taskId={task.task_id}
              taskTitle={task.title}
              className="mb-6"
            />
          )}

          {/* Task History */}
          {task.status_history && task.status_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.status_history.map((history, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Badge className={getStatusColor(history.status)}>{history.status}</Badge>
                      <div className="flex-1">
                        <div className="text-sm">{history.notes || `Status changed to ${history.status}`}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(history.changed_at).toLocaleString()} by {history.changed_by || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}