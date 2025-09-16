"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, User, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: any) => void
}

const mockCustomers = [
  { id: "C001", name: "John Doe", address: "123 Main St, Downtown, City 12345", phone: "+1 (555) 123-4567" },
  { id: "C002", name: "Jane Smith", address: "456 Oak Ave, North Zone, City 12345", phone: "+1 (555) 234-5678" },
  { id: "C003", name: "Bob Johnson", address: "789 Pine Rd, East District, City 12345", phone: "+1 (555) 345-6789" },
  { id: "C004", name: "Alice Brown", address: "321 Elm St, West Zone, City 12345", phone: "+1 (555) 456-7890" },
]

const mockRepresentatives = [
  { id: "1", name: "Mike Johnson", status: "available" },
  { id: "2", name: "Sarah Wilson", status: "available" },
  { id: "3", name: "David Chen", status: "busy" },
  { id: "4", name: "Emma Rodriguez", status: "available" },
]

export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    representativeId: "",
    priority: "medium",
    scheduledFor: "",
    estimatedTime: "",
    items: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = t("task.titleRequired")
    if (!formData.customerId) newErrors.customerId = t("task.customerRequired")
    if (!formData.scheduledFor) newErrors.scheduledFor = t("task.scheduledRequired")
    if (!formData.estimatedTime) newErrors.estimatedTime = t("task.estimatedRequired")
    if (!formData.items.trim()) newErrors.items = t("task.itemsRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const selectedCustomer = mockCustomers.find((c) => c.id === formData.customerId)
    const selectedRepresentative = formData.representativeId ? mockRepresentatives.find((r) => r.id === formData.representativeId) : null

    const newTask = {
      title: formData.title,
      customer: selectedCustomer,
      representative: selectedRepresentative
        ? {
            id: selectedRepresentative.id,
            name: selectedRepresentative.name,
            avatar: "/placeholder.svg?height=32&width=32",
          }
        : null,
      status: selectedRepresentative ? "assigned" : "pending",
      priority: formData.priority,
      estimatedTime: formData.estimatedTime,
      distance: "8.5 km", // Mock distance
      scheduledFor: formData.scheduledFor,
      items: formData.items.split(",").map((item) => item.trim()),
      notes: formData.notes,
    }

    onCreate(newTask)
    setFormData({
      title: "",
      customerId: "",
      representativeId: "",
      priority: "medium",
      scheduledFor: "",
      estimatedTime: "",
      items: "",
      notes: "",
    })
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const availableRepresentatives = mockRepresentatives.filter((representative) => representative.status === "available")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("task.createNew")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("task.taskDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("task.title")} *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Electronics Delivery"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="priority">{t("task.priority")}</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("task.low")}</SelectItem>
                      <SelectItem value="medium">{t("task.medium")}</SelectItem>
                      <SelectItem value="high">{t("task.high")}</SelectItem>
                      <SelectItem value="urgent">{t("task.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="items">{t("task.items")} *</Label>
                  <Textarea
                    id="items"
                    value={formData.items}
                    onChange={(e) => handleInputChange("items", e.target.value)}
                    placeholder={t("task.itemsPlaceholder")}
                    rows={3}
                    className={errors.items ? "border-red-500" : ""}
                  />
                  {errors.items && <p className="text-sm text-red-600 mt-1">{errors.items}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">{t("task.specialInstructions")}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder={t("task.instructionsPlaceholder")}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("task.assignment")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">{t("task.customer")} *</Label>
                  <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
                    <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("task.selectCustomer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.address.split(",")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && <p className="text-sm text-red-600 mt-1">{errors.customerId}</p>}
                </div>

                <div>
                  <Label htmlFor="representative">{t("task.assignRepresentative")}</Label>
                  <Select
                    value={formData.representativeId || "unassigned"}
                    onValueChange={(value) => handleInputChange("representativeId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Leave unassigned or select representative" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">{t("task.unassigned")}</SelectItem>
                      {availableRepresentatives.map((representative) => (
                        <SelectItem key={representative.id} value={representative.id}>
                          {representative.name} ({t("task.available")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableRepresentatives.length === 0 && (
                    <p className="text-sm text-yellow-600 mt-1">{t("task.noRepresentativesAvailable")}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="scheduledFor">{t("task.scheduledDateTime")} *</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                    className={errors.scheduledFor ? "border-red-500" : ""}
                  />
                  {errors.scheduledFor && <p className="text-sm text-red-600 mt-1">{errors.scheduledFor}</p>}
                </div>

                <div>
                  <Label htmlFor="estimatedTime">{t("task.estimatedDuration")} *</Label>
                  <Select
                    value={formData.estimatedTime}
                    onValueChange={(value) => handleInputChange("estimatedTime", value)}
                  >
                    <SelectTrigger className={errors.estimatedTime ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("task.selectEstimatedTime")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 mins">{t("task.15mins")}</SelectItem>
                      <SelectItem value="30 mins">{t("task.30mins")}</SelectItem>
                      <SelectItem value="45 mins">{t("task.45mins")}</SelectItem>
                      <SelectItem value="60 mins">{t("task.60mins")}</SelectItem>
                      <SelectItem value="90 mins">{t("task.90mins")}</SelectItem>
                      <SelectItem value="120 mins">{t("task.120mins")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estimatedTime && <p className="text-sm text-red-600 mt-1">{errors.estimatedTime}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formData.representativeId !== "unassigned" ? t("task.taskWillBeAssigned") : t("task.taskWillBePending")}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("task.creatingTask") : t("task.createTask")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
