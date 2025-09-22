"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  MapPin, 
  AlertCircle, 
  Mail, 
  Phone, 
  Building,
  Star,
  Calendar,
  Save,
  X,
  Map,
  Navigation,
  RotateCcw
} from "lucide-react"
import { createCustomer, CreateCustomerData, checkEmailExists, generateRandomAvatar } from "@/lib/customers"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { MapPicker } from "./map-picker"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (customer: any) => void
}

export function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const { t, isRTL } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as "active" | "vip" | "inactive",
    total_orders: 0,
    total_spent: 0,
    last_order_date: "",
    rating: 0,
    preferred_delivery_time: "Flexible",
    avatar_url: "",
    join_date: new Date().toISOString().split('T')[0],
    notes: "",
    latitude: null as number | null,
    longitude: null as number | null,
    visit_status: "not_visited" as "visited" | "not_visited",
    last_visit_date: "",
    visit_notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude: number
    longitude: number
  } | null>(null)
  const [avatarKey, setAvatarKey] = useState(0)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        total_orders: 0,
        total_spent: 0,
        last_order_date: "",
        rating: 0,
        preferred_delivery_time: "Flexible",
        avatar_url: generateRandomAvatar(), // Automatically generate random avatar
        join_date: new Date().toISOString().split('T')[0],
        notes: "",
        latitude: null,
        longitude: null,
        visit_status: "not_visited",
        last_visit_date: "",
        visit_notes: "",
      })
      setErrors({})
      setSelectedLocation(null)
      setAvatarKey(0)
    }
  }, [isOpen])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = isRTL ? "الاسم يجب أن يكون أكثر من حرفين" : "Name must be at least 2 characters"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL ? "تنسيق البريد الإلكتروني غير صحيح" : "Invalid email format"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = isRTL ? "رقم الهاتف مطلوب" : "Phone is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = isRTL ? "رقم الهاتف غير صحيح" : "Invalid phone number format"
    }
    
    if (!formData.address.trim()) {
      newErrors.address = isRTL ? "العنوان مطلوب" : "Address is required"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = isRTL ? "العنوان يجب أن يكون أكثر تفصيلاً" : "Address must be more detailed"
    }

    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = isRTL ? "التقييم يجب أن يكون بين 0 و 5" : "Rating must be between 0 and 5"
    }

    if (formData.total_orders < 0) {
      newErrors.total_orders = isRTL ? "عدد الطلبات لا يمكن أن يكون سالباً" : "Total orders cannot be negative"
    }

    if (formData.total_spent < 0) {
      newErrors.total_spent = isRTL ? "إجمالي المبلغ المنفق لا يمكن أن يكون سالباً" : "Total spent cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, isRTL])

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  const regenerateAvatar = useCallback(() => {
    const newAvatar = generateRandomAvatar()
    setFormData(prev => ({ ...prev, avatar_url: newAvatar }))
    setAvatarKey(prev => prev + 1) // Force avatar re-render
    toast({
      title: "Avatar Updated",
      description: isRTL ? "تم تحديث الصورة الشخصية" : "Avatar regenerated successfully!",
    })
  }, [isRTL, toast])

  // Debounced email validation
  useEffect(() => {
    if (formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email)) {
      const timeoutId = setTimeout(async () => {
        setIsCheckingEmail(true)
        const { exists, error } = await checkEmailExists(formData.email.trim())
        setIsCheckingEmail(false)
        
        if (!error && exists) {
          setErrors(prev => ({ 
            ...prev, 
            email: isRTL ? "البريد الإلكتروني مستخدم بالفعل" : "Email address is already in use" 
          }))
        } else if (errors.email && errors.email.includes("already in use")) {
          setErrors(prev => ({ ...prev, email: "" }))
        }
      }, 1000) // 1 second delay

      return () => clearTimeout(timeoutId)
    }
  }, [formData.email, isRTL, errors.email])

  const handleLocationSelect = useCallback((location: { address: string; latitude: number; longitude: number }) => {
    setSelectedLocation(location)
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    }))
    setShowMapPicker(false)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Check if email already exists
      const { exists: emailExists, error: emailCheckError } = await checkEmailExists(formData.email.trim())
      
      if (emailCheckError) {
        console.error('Error checking email:', emailCheckError)
        toast({
          title: "Error",
          description: isRTL ? "خطأ في التحقق من البريد الإلكتروني" : "Error checking email",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      
      if (emailExists) {
        toast({
          title: "Error",
          description: isRTL ? "البريد الإلكتروني مستخدم بالفعل" : "Email address is already in use",
          variant: "destructive",
        })
        setErrors(prev => ({ ...prev, email: isRTL ? "البريد الإلكتروني مستخدم بالفعل" : "Email address is already in use" }))
        setIsSubmitting(false)
        return
      }
      const customerData: CreateCustomerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        status: formData.status,
        total_orders: formData.total_orders,
        total_spent: formData.total_spent,
        last_order_date: formData.last_order_date || null,
        rating: formData.rating,
        preferred_delivery_time: formData.preferred_delivery_time,
        avatar_url: formData.avatar_url || null,
        join_date: formData.join_date,
        notes: formData.notes || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        visit_status: formData.visit_status,
        last_visit_date: formData.last_visit_date || null,
        visit_notes: formData.visit_notes || null,
      }

      const { data: newCustomer, error: createError } = await createCustomer(customerData)
      
      if (createError) {
        throw new Error(createError)
      }

      if (newCustomer) {
        toast({
          title: "Success",
          description: isRTL ? "تم إضافة العميل بنجاح" : "Customer added successfully",
        })

        onAdd(newCustomer)
        onClose()
      } else {
        throw new Error("Failed to create customer")
      }

    } catch (error: any) {
      console.error('Error creating customer:', error)
      
      let errorMessage = isRTL ? "فشل في إضافة العميل" : "Failed to add customer"
      
      // Handle specific error cases
      if (error.message) {
        if (error.message.includes("duplicate key value violates unique constraint \"customers_email_key\"")) {
          errorMessage = isRTL ? "البريد الإلكتروني مستخدم بالفعل" : "Email address is already in use"
          setErrors(prev => ({ ...prev, email: isRTL ? "البريد الإلكتروني مستخدم بالفعل" : "Email address is already in use" }))
        } else if (error.message.includes("duplicate key value violates unique constraint \"customers_customer_id_key\"")) {
          errorMessage = isRTL ? "معرف العميل مستخدم بالفعل" : "Customer ID is already in use"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, toast, isRTL, onAdd, onClose])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
    }
  }, [isSubmitting, onClose])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isRTL ? "إضافة عميل جديد" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      {isRTL ? "الاسم الكامل" : "Full Name"} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={isRTL ? "أدخل الاسم الكامل" : "Enter full name"}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">
                      {isRTL ? "البريد الإلكتروني" : "Email Address"} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email address"}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                    {isCheckingEmail && (
                      <p className="text-sm text-blue-500 mt-1">
                        {isRTL ? "جاري التحقق من البريد الإلكتروني..." : "Checking email availability..."}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      {isRTL ? "رقم الهاتف" : "Phone Number"} *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder={isRTL ? "أدخل رقم الهاتف" : "Enter phone number"}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">
                      {isRTL ? "الحالة" : "Status"}
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{isRTL ? "نشط" : "Active"}</SelectItem>
                        <SelectItem value="vip">{isRTL ? "عميل مميز" : "VIP"}</SelectItem>
                        <SelectItem value="inactive">{isRTL ? "غير نشط" : "Inactive"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isRTL ? "معلومات الموقع" : "Location Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">
                    {isRTL ? "عنوان التوصيل" : "Delivery Address"} *
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder={isRTL ? "أدخل عنوان التوصيل الكامل" : "Enter complete delivery address"}
                      rows={3}
                      className={`flex-1 ${errors.address ? "border-red-500" : ""}`}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMapPicker(true)}
                        className="h-10"
                      >
                        <Map className="h-4 w-4 mr-2" />
                        {isRTL ? "اختر على الخريطة" : "Select on Map"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const { latitude, longitude } = position.coords
                                // Reverse geocoding to get address
                                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                                  .then(response => response.json())
                                  .then(data => {
                                    const address = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
                                    handleLocationSelect({ address, latitude, longitude })
                                  })
                                  .catch(() => {
                                    handleLocationSelect({ 
                                      address: `${latitude}, ${longitude}`, 
                                      latitude, 
                                      longitude 
                                    })
                                  })
                              },
                              () => {
                                toast({
                                  title: "Error",
                                  description: "Failed to get current location",
                                  variant: "destructive",
                                })
                              }
                            )
                          }
                        }}
                        className="h-10"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {isRTL ? "موقعي الحالي" : "My Location"}
                      </Button>
                    </div>
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                  
                  {selectedLocation && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Selected Location:</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">{selectedLocation.address}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {isRTL ? "معلومات العمل" : "Business Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="total_orders">
                      {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                    </Label>
                    <Input
                      id="total_orders"
                      type="number"
                      min="0"
                      value={formData.total_orders}
                      onChange={(e) => handleInputChange("total_orders", parseInt(e.target.value) || 0)}
                      className={errors.total_orders ? "border-red-500" : ""}
                    />
                    {errors.total_orders && (
                      <p className="text-sm text-red-500 mt-1">{errors.total_orders}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="total_spent">
                      {isRTL ? "إجمالي المبلغ المنفق" : "Total Spent"}
                    </Label>
                    <Input
                      id="total_spent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_spent}
                      onChange={(e) => handleInputChange("total_spent", parseFloat(e.target.value) || 0)}
                      className={errors.total_spent ? "border-red-500" : ""}
                    />
                    {errors.total_spent && (
                      <p className="text-sm text-red-500 mt-1">{errors.total_spent}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rating">
                      {isRTL ? "التقييم" : "Rating"} (0-5)
                    </Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleInputChange("rating", parseFloat(e.target.value) || 0)}
                      className={errors.rating ? "border-red-500" : ""}
                    />
                    {errors.rating && (
                      <p className="text-sm text-red-500 mt-1">{errors.rating}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="last_order_date">
                      {isRTL ? "تاريخ آخر طلب" : "Last Order Date"}
                    </Label>
                    <Input
                      id="last_order_date"
                      type="date"
                      value={formData.last_order_date}
                      onChange={(e) => handleInputChange("last_order_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="join_date">
                      {isRTL ? "تاريخ الانضمام" : "Join Date"}
                    </Label>
                    <Input
                      id="join_date"
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => handleInputChange("join_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred_delivery_time">
                      {isRTL ? "وقت التوصيل المفضل" : "Preferred Delivery Time"}
                    </Label>
                    <Select value={formData.preferred_delivery_time} onValueChange={(value) => handleInputChange("preferred_delivery_time", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flexible">{isRTL ? "مرن" : "Flexible"}</SelectItem>
                        <SelectItem value="Morning">{isRTL ? "صباحاً" : "Morning"}</SelectItem>
                        <SelectItem value="Afternoon">{isRTL ? "بعد الظهر" : "Afternoon"}</SelectItem>
                        <SelectItem value="Evening">{isRTL ? "مساءً" : "Evening"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {isRTL ? "معلومات الزيارة" : "Visit Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit_status">
                      {isRTL ? "حالة الزيارة" : "Visit Status"}
                    </Label>
                    <Select value={formData.visit_status} onValueChange={(value) => handleInputChange("visit_status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_visited">{isRTL ? "لم يتم الزيارة" : "Not Visited"}</SelectItem>
                        <SelectItem value="visited">{isRTL ? "تمت الزيارة" : "Visited"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="last_visit_date">
                      {isRTL ? "تاريخ آخر زيارة" : "Last Visit Date"}
                    </Label>
                    <Input
                      id="last_visit_date"
                      type="date"
                      value={formData.last_visit_date}
                      onChange={(e) => handleInputChange("last_visit_date", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="visit_notes">
                      {isRTL ? "ملاحظات الزيارة" : "Visit Notes"}
                    </Label>
                    <Textarea
                      id="visit_notes"
                      value={formData.visit_notes}
                      onChange={(e) => handleInputChange("visit_notes", e.target.value)}
                      placeholder={isRTL ? "أدخل ملاحظات الزيارة" : "Enter visit notes"}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {isRTL ? "معلومات إضافية" : "Additional Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                    <User className="h-4 w-4" />
                    {isRTL ? "الصورة الشخصية" : "Customer Avatar"}
                  </Label>
                  
                  {/* Avatar Preview Section */}
                  <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg" key={avatarKey}>
                          <AvatarImage src={formData.avatar_url} alt="Customer Avatar" />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-4">
                          {isRTL ? "سيتم إنشاء صورة شخصية عشوائية تلقائياً" : "A random avatar is automatically generated"}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            regenerateAvatar()
                          }}
                          className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isRTL ? "توليد صورة جديدة" : "Generate New Avatar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">
                    {isRTL ? "ملاحظات" : "Notes"}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder={isRTL ? "أدخل ملاحظات إضافية" : "Enter additional notes"}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isRTL ? "جاري الإضافة..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isRTL ? "إضافة العميل" : "Add Customer"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation}
        />
      )}
    </>
  )
}
