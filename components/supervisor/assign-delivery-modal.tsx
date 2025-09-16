"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AssignDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AssignDeliveryModal({ isOpen, onClose }: AssignDeliveryModalProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    customer: "",
    driver: "",
    priority: "medium",
    pickupAddress: "",
    deliveryAddress: "",
    scheduledTime: "",
    notes: "",
  })

  const availableRepresentatives = [
    { id: "1", name: "John Smith", status: "available", location: "Downtown" },
    { id: "2", name: "Sarah Johnson", status: "available", location: "North Side" },
    { id: "3", name: "Mike Wilson", status: "available", location: "East End" },
    { id: "4", name: "Lisa Brown", status: "busy", location: "South District" },
  ]

  const customers = [
    { id: "1", name: "ABC Corp", address: "123 Business St" },
    { id: "2", name: "XYZ Store", address: "456 Retail Ave" },
    { id: "3", name: "Tech Solutions", address: "789 Innovation Blvd" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Assigning delivery:", formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("supervisor.assignNewDelivery")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{t("task.customer")}</Label>
              <Select
                value={formData.customer}
                onValueChange={(value) => setFormData({ ...formData, customer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("task.selectCustomer")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{t("task.priority")}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("supervisor.lowPriority")}</SelectItem>
                  <SelectItem value="medium">{t("supervisor.mediumPriority")}</SelectItem>
                  <SelectItem value="high">{t("supervisor.highPriority")}</SelectItem>
                  <SelectItem value="urgent">{t("task.urgent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="representative">{t("task.assignRepresentative")}</Label>
            <Select value={formData.driver} onValueChange={(value) => setFormData({ ...formData, driver: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("supervisor.selectRepresentative")} />
              </SelectTrigger>
              <SelectContent>
                {availableRepresentatives.map((representative) => (
                  <SelectItem key={representative.id} value={representative.id} disabled={representative.status === "busy"}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{representative.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {representative.location}
                        </div>
                      </div>
                      <Badge variant={representative.status === "available" ? "default" : "secondary"}>{representative.status}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">{t("supervisor.pickupAddress")}</Label>
              <Input
                id="pickupAddress"
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                placeholder={t("supervisor.enterPickup")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">{t("supervisor.deliveryAddress")}</Label>
              <Input
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder={t("supervisor.enterDelivery")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">{t("supervisor.scheduledTime")}</Label>
            <Input
              id="scheduledTime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("supervisor.specialInstructions")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("supervisor.deliveryInstructions")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              <Package className="h-4 w-4 mr-2" />
              {t("supervisor.assignDelivery")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
