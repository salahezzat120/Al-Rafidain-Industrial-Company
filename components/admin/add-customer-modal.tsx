"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  MapPin, 
  AlertCircle, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Mail, 
  Phone, 
  Globe,
  Building,
  Clock,
  Star,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Image,
  RotateCcw
} from "lucide-react"
import { createCustomer, CreateCustomerData, generateRandomAvatar } from "@/lib/customers"
import { useToast } from "@/hooks/use-toast"
import { LocationPicker } from "@/components/ui/location-picker"
import { useLanguage } from "@/contexts/language-context"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (customer: any) => void
}

export const AddCustomerModal = React.memo(function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const { t, isRTL } = useLanguage()
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
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [autoSave, setAutoSave] = useState(false)
  const { toast } = useToast()

  const totalSteps = 4
  const steps = [
    { id: 1, title: isRTL ? "المعلومات الشخصية" : "Personal Info", icon: User },
    { id: 2, title: isRTL ? "التوصيل" : "Delivery", icon: MapPin },
    { id: 3, title: isRTL ? "الموقع" : "Location", icon: Navigation },
    { id: 4, title: isRTL ? "المراجعة" : "Review", icon: CheckCircle }
  ]

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: isRTL ? "الموقع الجغرافي غير مدعوم في هذا المتصفح" : "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        setSelectedLocation(location)
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }))
        setIsGettingLocation(false)
        toast({
          title: "Success",
          description: isRTL ? "تم الحصول على موقعك بنجاح" : "Location obtained successfully!",
        })
      },
      (error) => {
        console.error("Error getting location:", error)
        let errorMessage = isRTL ? "تعذر الحصول على موقعك. يرجى تحديد الموقع يدوياً." : "Unable to retrieve your location. Please select location manually."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = isRTL ? "تم رفض إذن الموقع. يرجى السماح بالوصول إلى الموقع." : "Location access denied. Please allow location access."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = isRTL ? "معلومات الموقع غير متاحة." : "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = isRTL ? "انتهت مهلة طلب الموقع." : "Location request timed out."
            break
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setSelectedLocation(location)
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      address: location.address || prev.address
    }))
    setShowLocationPicker(false)
    toast({
      title: "Success",
      description: isRTL ? "تم تحديد الموقع بنجاح" : "Location selected successfully!",
    })
  }

  const clearLocation = () => {
    setSelectedLocation(null)
    setFormData(prev => ({
      ...prev,
      latitude: "",
      longitude: ""
    }))
  }

  // Calculate form progress
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== "").length
    const totalFields = Object.keys(formData).length
    setFormProgress(Math.round((filledFields / totalFields) * 100))
  }, [formData])

  // Auto-save functionality - temporarily disabled to fix re-render issue
  // useEffect(() => {
  //   if (isDirty && autoSave) {
  //     const timer = setTimeout(() => {
  //       localStorage.setItem('customer-draft', JSON.stringify(formData))
  //       toast({
  //         title: "Auto-saved",
  //         description: isRTL ? "تم حفظ المسودة تلقائياً" : "Draft auto-saved",
  //       })
  //     }, 2000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [formData, isDirty, autoSave, toast, isRTL])

  // Generate initial avatar when modal opens
  useEffect(() => {
    if (isOpen && !avatarUrl) {
      setAvatarUrl(generateRandomAvatar())
    }
  }, [isOpen, avatarUrl])

  // Load draft on mount
  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem('customer-draft')
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          setFormData(parsedDraft)
          setIsDirty(true)
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required"
    else if (formData.name.trim().length < 2) newErrors.name = isRTL ? "الاسم يجب أن يكون أكثر من حرفين" : "Name must be at least 2 characters"
    
    if (!formData.email.trim()) newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = isRTL ? "تنسيق البريد الإلكتروني غير صحيح" : "Invalid email format"
    
    if (!formData.phone.trim()) newErrors.phone = isRTL ? "رقم الهاتف مطلوب" : "Phone is required"
    else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = isRTL ? "رقم الهاتف غير صحيح" : "Invalid phone number format"
    }
    
    if (!formData.address.trim()) newErrors.address = isRTL ? "العنوان مطلوب" : "Address is required"
    else if (formData.address.trim().length < 10) newErrors.address = isRTL ? "العنوان يجب أن يكون أكثر تفصيلاً" : "Address must be more detailed"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.name.trim()) newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required"
        if (!formData.email.trim()) newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = isRTL ? "تنسيق البريد الإلكتروني غير صحيح" : "Invalid email format"
        if (!formData.phone.trim()) newErrors.phone = isRTL ? "رقم الهاتف مطلوب" : "Phone is required"
        break
      case 2: // Delivery
        if (!formData.address.trim()) newErrors.address = isRTL ? "العنوان مطلوب" : "Address is required"
        break
      case 3: // Location
        if (!formData.latitude || !formData.longitude) {
          newErrors.location = isRTL ? "الموقع مطلوب للتوصيل الدقيق" : "Location is required for accurate delivery"
        }
        break
    }

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
        avatar_url: avatarUrl,
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
    setAvatarUrl("")
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
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || validateStep(step - 1)) {
      setCurrentStep(step)
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('customer-draft')
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
    setAvatarUrl("")
    setIsDirty(false)
    setCurrentStep(1)
    setErrors({})
    toast({
      title: "Cleared",
      description: isRTL ? "تم مسح المسودة" : "Draft cleared",
    })
  }

  const regenerateAvatar = () => {
    const newAvatar = generateRandomAvatar()
    setAvatarUrl(newAvatar)
    toast({
      title: "Avatar Updated",
      description: isRTL ? "تم تحديث الصورة الشخصية" : "Avatar regenerated successfully!",
    })
  }

  const copyFormData = () => {
    const formText = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.address}
Status: ${formData.status}
Delivery Time: ${formData.preferredDeliveryTime}
Location: ${formData.latitude}, ${formData.longitude}
Notes: ${formData.notes}
    `.trim()
    
    navigator.clipboard.writeText(formText)
    toast({
      title: "Copied",
      description: isRTL ? "تم نسخ بيانات النموذج" : "Form data copied to clipboard",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <User className="h-8 w-8 text-white" />
            </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  {isRTL ? "إضافة عميل جديد" : "Add New Customer"}
          </DialogTitle>
                <p className="text-gray-600 mt-1">
                  {isRTL ? "املأ النموذج لإضافة عميل جديد إلى النظام" : "Fill out the form to add a new customer to your system"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyFormData}
                className="h-9"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isRTL ? "نسخ" : "Copy"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearDraft}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isRTL ? "مسح" : "Clear"}
              </Button>
            </div>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enhanced Progress Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {isRTL ? "التقدم" : "Progress"}: {formProgress}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {isRTL ? "الخطوة" : "Step"} {currentStep} {isRTL ? "من" : "of"} {totalSteps}
                </Badge>
            </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSave(!autoSave)}
                  className={`h-8 ${autoSave ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isRTL ? "حفظ تلقائي" : "Auto-save"}
                </Button>
            </div>
          </div>

            <Progress value={formProgress} className="h-2" />
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                const isClickable = step.id <= currentStep || validateStep(step.id - 1)
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => isClickable && goToStep(step.id)}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700 shadow-md' 
                          : isCompleted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : isClickable
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        <Icon className="h-4 w-4" />
                  </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </button>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[500px]">
            {currentStep === 1 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <User className="h-6 w-6" />
                    {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                </CardTitle>
                  <p className="text-blue-100">
                    {isRTL ? "أدخل المعلومات الأساسية للعميل" : "Enter basic customer information"}
                  </p>
              </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Avatar Preview Section */}
                  <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                          <AvatarImage src={avatarUrl} alt="Customer Avatar" />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {isRTL ? "الصورة الشخصية" : "Customer Avatar"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {isRTL ? "سيتم إنشاء صورة شخصية عشوائية تلقائياً" : "A random avatar will be automatically generated"}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={regenerateAvatar}
                          className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isRTL ? "توليد صورة جديدة" : "Generate New Avatar"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isRTL ? "الاسم الكامل" : "Full Name"} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={isRTL ? "أدخل الاسم الكامل للعميل" : "Enter customer's full name"}
                        className={`h-12 text-lg ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                  />
                  {errors.name && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {isRTL ? "البريد الإلكتروني" : "Email Address"} *
                  </Label>
                  <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="customer@email.com"
                          className={`h-12 pl-12 text-lg ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                    />
                  </div>
                  {errors.email && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {isRTL ? "رقم الهاتف" : "Phone Number"} *
                  </Label>
                  <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                          className={`h-12 pl-12 text-lg ${errors.phone ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                    />
                  </div>
                  {errors.phone && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {isRTL ? "حالة العميل" : "Customer Status"}
                      </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {isRTL ? "نشط" : "Active"}
                            </div>
                          </SelectItem>
                          <SelectItem value="vip">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              {isRTL ? "مميز" : "VIP"}
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              {isRTL ? "غير نشط" : "Inactive"}
                            </div>
                          </SelectItem>
                    </SelectContent>
                  </Select>
                    </div>
                </div>
              </CardContent>
            </Card>
            )}

            {currentStep === 2 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <MapPin className="h-6 w-6" />
                    {isRTL ? "معلومات التوصيل" : "Delivery Information"}
                </CardTitle>
                  <p className="text-green-100">
                    {isRTL ? "أدخل تفاصيل التوصيل والتفضيلات" : "Enter delivery details and preferences"}
                  </p>
              </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {isRTL ? "عنوان التوصيل" : "Delivery Address"} *
                      </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder={isRTL ? "أدخل عنوان التوصيل الكامل" : "Enter complete delivery address"}
                        rows={4}
                        className={`text-lg ${errors.address ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-green-500"}`}
                      />
                      {errors.address && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          {errors.address}
                        </div>
                      )}
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryTime" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {isRTL ? "وقت التوصيل المفضل" : "Preferred Delivery Time"}
                        </Label>
                  <Select
                    value={formData.preferredDeliveryTime}
                    onValueChange={(value) => handleInputChange("preferredDeliveryTime", value)}
                  >
                          <SelectTrigger className="h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                            <SelectItem value="Morning (9-12 PM)">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                {isRTL ? "صباحاً (9-12)" : "Morning (9-12 PM)"}
                              </div>
                            </SelectItem>
                            <SelectItem value="Afternoon (1-5 PM)">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                {isRTL ? "بعد الظهر (1-5)" : "Afternoon (1-5 PM)"}
                              </div>
                            </SelectItem>
                            <SelectItem value="Evening (5-8 PM)">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {isRTL ? "مساءً (5-8)" : "Evening (5-8 PM)"}
                              </div>
                            </SelectItem>
                            <SelectItem value="Flexible">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {isRTL ? "مرن" : "Flexible"}
                              </div>
                            </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {isRTL ? "ملاحظات" : "Notes"}
                        </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder={isRTL ? "تعليمات التوصيل الخاصة أو ملاحظات العميل" : "Special delivery instructions or customer notes"}
                          rows={4}
                          className="text-lg border-gray-300 focus:border-green-500"
                  />
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
            )}

            {currentStep === 3 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Navigation className="h-6 w-6" />
                    {isRTL ? "الموقع الجغرافي" : "GPS Location"}
              </CardTitle>
                  <p className="text-purple-100">
                    {isRTL ? "حدد الموقع الدقيق للتوصيل" : "Set precise location for delivery"}
                  </p>
            </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Location Selection Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLocationPicker(true)}
                      className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 text-lg font-semibold"
                    >
                      <Globe className="h-6 w-6 mr-3" />
                      {isRTL ? "تحديد على الخريطة" : "Select on Map"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="h-16 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-lg font-semibold"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          {isRTL ? "جاري الحصول..." : "Getting..."}
                        </>
                      ) : (
                        <>
                          <Navigation className="h-6 w-6 mr-3" />
                          {isRTL ? "موقعي الحالي" : "My Location"}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Manual Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-semibold text-gray-700">
                        {isRTL ? "خط العرض" : "Latitude"}
                      </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="e.g., 33.3152"
                        className="h-12 text-lg"
                  />
                </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-semibold text-gray-700">
                        {isRTL ? "خط الطول" : "Longitude"}
                      </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="e.g., 44.3661"
                        className="h-12 text-lg"
                  />
                </div>
                  </div>

                  {/* Selected Location Display */}
                  {selectedLocation && (
                    <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-green-800">
                              {isRTL ? "الموقع المحدد" : "Selected Location"}
                            </p>
                            <p className="text-sm text-green-600 font-mono">
                              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                            </p>
                            {selectedLocation.address && (
                              <p className="text-sm text-gray-600 mt-1">
                                {selectedLocation.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearLocation}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {errors.location && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      {errors.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CheckCircle className="h-6 w-6" />
                    {isRTL ? "مراجعة البيانات" : "Review Information"}
                  </CardTitle>
                  <p className="text-orange-100">
                    {isRTL ? "راجع البيانات قبل الحفظ" : "Review information before saving"}
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Avatar Preview in Review */}
                  <div className="flex justify-center mb-8">
                    <div className="text-center">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-xl mx-auto mb-4">
                        <AvatarImage src={avatarUrl} alt="Customer Avatar" />
                        <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-gray-600">
                        {isRTL ? "الصورة الشخصية المحددة" : "Selected Avatar"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Info Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "الاسم:" : "Name:"}</span>
                          <p className="text-lg font-semibold">{formData.name || (isRTL ? "غير محدد" : "Not specified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "البريد الإلكتروني:" : "Email:"}</span>
                          <p className="text-lg">{formData.email || (isRTL ? "غير محدد" : "Not specified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "الهاتف:" : "Phone:"}</span>
                          <p className="text-lg">{formData.phone || (isRTL ? "غير محدد" : "Not specified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "الحالة:" : "Status:"}</span>
                          <Badge className={`ml-2 ${
                            formData.status === 'active' ? 'bg-green-100 text-green-800' :
                            formData.status === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formData.status === 'active' ? (isRTL ? 'نشط' : 'Active') :
                             formData.status === 'vip' ? (isRTL ? 'مميز' : 'VIP') :
                             (isRTL ? 'غير نشط' : 'Inactive')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        {isRTL ? "معلومات التوصيل" : "Delivery Information"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "العنوان:" : "Address:"}</span>
                          <p className="text-lg">{formData.address || (isRTL ? "غير محدد" : "Not specified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "وقت التوصيل:" : "Delivery Time:"}</span>
                          <p className="text-lg">{formData.preferredDeliveryTime}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{isRTL ? "الموقع:" : "Location:"}</span>
                          <p className="text-lg font-mono text-sm">
                            {formData.latitude && formData.longitude 
                              ? `${formData.latitude}, ${formData.longitude}`
                              : (isRTL ? "غير محدد" : "Not specified")
                            }
                          </p>
                        </div>
                        {formData.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">{isRTL ? "ملاحظات:" : "Notes:"}</span>
                            <p className="text-lg">{formData.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>


          {/* Navigation and Actions */}
          <div className="flex items-center justify-between pt-6 border-t bg-gray-50 -m-6 mt-0 p-6">
            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-12 px-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isRTL ? "السابق" : "Previous"}
                </Button>
              )}
              
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  {isRTL ? "تغييرات غير محفوظة" : "Unsaved changes"}
            </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-12 px-6"
              >
                {isRTL ? "إلغاء" : "Cancel"}
            </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  {isRTL ? "التالي" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isRTL ? "جاري الإضافة..." : "Adding Customer..."}
                  </>
                ) : (
                  <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isRTL ? "إضافة العميل" : "Add Customer"}
                  </>
                )}
            </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation || undefined}
        title={isRTL ? "تحديد موقع العميل" : "Select Customer Location"}
      />
    </Dialog>
  )
})
