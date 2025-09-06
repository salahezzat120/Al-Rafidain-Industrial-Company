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
import { User, MapPin, AlertCircle, Navigation, CheckCircle, XCircle, Loader2, Mail, Phone } from "lucide-react"
import { createCustomer, CreateCustomerData } from "@/lib/customers"
import { useToast } from "@/hooks/use-toast"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (customer: any) => void
}

export function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredDeliveryTime: "Flexible",
    status: "active",
    notes: "",
    // GPS/Geolocation fields
    latitude: "",
    longitude: "",
    // Visit tracking fields
    visitStatus: "not_visited",
    lastVisitDate: "",
    visitNotes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { toast } = useToast()

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }))
        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to retrieve your location. Please enter coordinates manually.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare customer data for Supabase
      const customerData: CreateCustomerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status as 'active' | 'vip' | 'inactive',
        preferred_delivery_time: formData.preferredDeliveryTime,
        notes: formData.notes,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        visit_status: formData.visitStatus as 'visited' | 'not_visited',
        last_visit_date: formData.lastVisitDate || undefined,
        visit_notes: formData.visitNotes,
      }

      // Save to Supabase
      const { data: newCustomer, error } = await createCustomer(customerData)

      if (error) {
        toast({
          title: "Error",
          description: `Failed to create customer: ${error}`,
          variant: "destructive",
        })
        return
      }

      if (newCustomer) {
        // Convert Supabase customer data to the format expected by the parent component
        const formattedCustomer = {
          id: newCustomer.customer_id,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          status: newCustomer.status,
          totalOrders: newCustomer.total_orders,
          totalSpent: newCustomer.total_spent,
          lastOrder: newCustomer.last_order_date || "Never",
          rating: newCustomer.rating,
          preferredDeliveryTime: newCustomer.preferred_delivery_time,
          avatar: newCustomer.avatar_url || "/placeholder.svg?height=40&width=40",
          joinDate: newCustomer.join_date || new Date().toLocaleDateString(),
          notes: newCustomer.notes || "",
          latitude: newCustomer.latitude?.toString() || "",
          longitude: newCustomer.longitude?.toString() || "",
          visitStatus: newCustomer.visit_status,
          lastVisitDate: newCustomer.last_visit_date || "",
          visitNotes: newCustomer.visit_notes || "",
        }

        onAdd(formattedCustomer)
        
        toast({
          title: "Success",
          description: "Customer created successfully!",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          preferredDeliveryTime: "Flexible",
          status: "active",
          notes: "",
          latitude: "",
          longitude: "",
          visitStatus: "not_visited",
          lastVisitDate: "",
          visitNotes: "",
        })
        setErrors({})
        onClose()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            Add New Customer
          </DialogTitle>
          <p className="text-gray-600 mt-2">Fill out the form below to add a new customer to your system</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">Personal Info</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Delivery</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Location</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Visit Status</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
                <p className="text-sm text-gray-600">Basic customer details and contact information</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter customer's full name"
                    className={`h-11 ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                  />
                  {errors.name && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="customer@email.com"
                      className={`h-11 pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={`h-11 pl-10 ${errors.phone ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Customer Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Delivery Information
                </CardTitle>
                <p className="text-sm text-gray-600">Delivery preferences and address details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter complete delivery address"
                    rows={3}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="deliveryTime">Preferred Delivery Time</Label>
                  <Select
                    value={formData.preferredDeliveryTime}
                    onValueChange={(value) => handleInputChange("preferredDeliveryTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning (9-12 PM)">Morning (9-12 PM)</SelectItem>
                      <SelectItem value="Afternoon (1-5 PM)">Afternoon (1-5 PM)</SelectItem>
                      <SelectItem value="Evening (5-8 PM)">Evening (5-8 PM)</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Special delivery instructions or customer notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GPS/Geolocation Section */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                GPS Location
              </CardTitle>
              <p className="text-sm text-gray-600">Precise location coordinates for accurate delivery routing</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="e.g., 33.3152"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="e.g., 44.3661"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full h-11 bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 hover:from-purple-600 hover:to-violet-600 disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Current Location
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {(formData.latitude && formData.longitude) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Location:</strong> {formData.latitude}, {formData.longitude}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit Tracking Section */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                Visit Status
              </CardTitle>
              <p className="text-sm text-gray-600">Track customer visit history and add detailed notes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visitStatus">Visit Status</Label>
                  <Select
                    value={formData.visitStatus}
                    onValueChange={(value) => handleInputChange("visitStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_visited">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-gray-500" />
                          Not Visited
                        </div>
                      </SelectItem>
                      <SelectItem value="visited">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Visited
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastVisitDate">Last Visit Date</Label>
                  <Input
                    id="lastVisitDate"
                    type="date"
                    value={formData.lastVisitDate}
                    onChange={(e) => handleInputChange("lastVisitDate", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="visitNotes">Visit Notes/Comments</Label>
                <Textarea
                  id="visitNotes"
                  value={formData.visitNotes}
                  onChange={(e) => handleInputChange("visitNotes", e.target.value)}
                  placeholder="Add notes about the visit, customer feedback, or special requirements..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <div className="flex-1">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Customer information will be used for delivery coordination and communication. Ensure all contact details are accurate.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex gap-3 sm:flex-shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 h-11"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 h-11 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Customer...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Add Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
