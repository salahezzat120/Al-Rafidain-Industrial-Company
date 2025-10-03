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
    { id: 1, title: t("customer.personalInfo"), icon: User },
    { id: 2, title: t("customer.deliveryInfo"), icon: MapPin },
    { id: 3, title: t("customer.locationTitle"), icon: Navigation },
    { id: 4, title: t("customer.reviewInformation"), icon: CheckCircle }
  ]

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: t("customer.geolocationNotSupported"),
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
        title: t("common.success"),
        description: t("customer.locationObtained"),
        })
      },
      (error) => {
        console.error("Error getting location:", error)
        let errorMessage = t("customer.locationError")
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("customer.locationAccessDenied")
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("customer.locationUnavailable")
            break
          case error.TIMEOUT:
            errorMessage = t("customer.locationTimeout")
            break
        }
        
        toast({
          title: t("common.error"),
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
      title: t("common.success"),
      description: t("customer.locationSelected"),
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

    if (!formData.name.trim()) newErrors.name = t("customer.nameRequired")
    else if (formData.name.trim().length < 2) newErrors.name = t("customer.nameMinLength")
    
    if (!formData.email.trim()) newErrors.email = t("customer.emailRequired")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("customer.invalidEmail")
    
    if (!formData.phone.trim()) newErrors.phone = t("customer.phoneRequired")
    else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = t("customer.invalidPhone")
    }
    
    if (!formData.address.trim()) newErrors.address = t("customer.addressRequired")
    else if (formData.address.trim().length < 10) newErrors.address = t("customer.addressMinLength")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.name.trim()) newErrors.name = t("customer.nameRequired")
        if (!formData.email.trim()) newErrors.email = t("customer.emailRequired")
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("customer.invalidEmail")
        if (!formData.phone.trim()) newErrors.phone = t("customer.phoneRequired")
        break
      case 2: // Delivery
        if (!formData.address.trim()) newErrors.address = t("customer.addressRequired")
        break
      case 3: // Location
        if (!formData.latitude || !formData.longitude) {
          newErrors.location = t("customer.locationRequired")
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
          title: t("common.error"),
          description: `${t("customer.createFailed")}: ${error}`,
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
          title: t("common.success"),
          description: t("customer.createdSuccessfully"),
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
        title: t("common.error"),
        description: t("customer.unexpectedError"),
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
      title: t("common.cleared"),
      description: t("customer.draftCleared"),
    })
  }

  const regenerateAvatar = () => {
    const newAvatar = generateRandomAvatar()
    setAvatarUrl(newAvatar)
    toast({
      title: t("customer.avatarUpdated"),
      description: t("customer.avatarUpdated"),
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
      title: t("common.copied"),
      description: t("customer.copyFormData"),
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
                  {t("customer.addNew")}
          </DialogTitle>
                <p className="text-gray-600 mt-1">
                  {t("customer.infoNote")}
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
                {t("common.copy")}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearDraft}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.clear")}
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
                  {t("customer.progress")}: {formProgress}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {t("customer.step")} {currentStep} {t("customer.of")} {totalSteps}
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
                  {t("customer.autoSave")}
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
                    {t("customer.personalInfo")}
                </CardTitle>
                  <p className="text-blue-100">
                    {t("customer.personalInfoDescription")}
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
                          {t("customer.avatarPreview")}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {t("customer.avatarDescription")}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={regenerateAvatar}
                          className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {t("customer.generateNewAvatar")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("customer.fullName")} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t("customer.enterFullName")}
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
                        {t("customer.emailAddress")} *
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
                        {t("customer.phoneNumber")} *
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
                        {t("customer.customerStatus")}
                      </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {t("customer.status.active")}
                            </div>
                          </SelectItem>
                          <SelectItem value="vip">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              {t("customer.status.vip")}
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              {t("customer.status.inactive")}
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
                    {t("customer.deliveryInfo")}
                </CardTitle>
                  <p className="text-green-100">
                    {t("customer.deliveryInfoDescription")}
                  </p>
              </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {t("customer.deliveryAddress")} *
                      </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder={t("customer.enterAddress")}
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
                          {t("customer.preferredTime")}
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
                                {t("customer.morning")}
                              </div>
                            </SelectItem>
                            <SelectItem value="Afternoon (1-5 PM)">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                {t("customer.afternoon")}
                              </div>
                            </SelectItem>
                            <SelectItem value="Evening (5-8 PM)">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {t("customer.evening")}
                              </div>
                            </SelectItem>
                            <SelectItem value="Flexible">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {t("customer.flexible")}
                              </div>
                            </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t("customer.notes")}
                        </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder={t("customer.notesPlaceholder")}
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
                    {t("customer.locationTitle")}
              </CardTitle>
                  <p className="text-purple-100">
                    {t("customer.locationDescription")}
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
                      {t("customer.selectOnMap")}
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
                          {t("customer.gettingLocation")}
                        </>
                      ) : (
                        <>
                          <Navigation className="h-6 w-6 mr-3" />
                          {t("customer.myLocation")}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Manual Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-semibold text-gray-700">
                        {t("customer.latitude")}
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
                        {t("customer.longitude")}
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
                              {t("customer.selectedLocation")}
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
                    {t("customer.reviewInformation")}
                  </CardTitle>
                  <p className="text-orange-100">
                    {t("customer.reviewDescription")}
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
                        {t("customer.selectedAvatar")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Info Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        {t("customer.personalInfoReview")}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.name")}:</span>
                          <p className="text-lg font-semibold">{formData.name || t("customer.notSpecified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.email")}:</span>
                          <p className="text-lg">{formData.email || t("customer.notSpecified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.phone")}:</span>
                          <p className="text-lg">{formData.phone || t("customer.notSpecified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.status")}:</span>
                          <Badge className={`ml-2 ${
                            formData.status === 'active' ? 'bg-green-100 text-green-800' :
                            formData.status === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formData.status === 'active' ? t("customer.status.active") :
                             formData.status === 'vip' ? t("customer.status.vip") :
                             t("customer.status.inactive")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        {t("customer.deliveryInfoReview")}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.address")}:</span>
                          <p className="text-lg">{formData.address || t("customer.notSpecified")}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.deliveryTime")}:</span>
                          <p className="text-lg">{formData.preferredDeliveryTime}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t("customer.location")}:</span>
                          <p className="text-lg font-mono text-sm">
                            {formData.latitude && formData.longitude 
                              ? `${formData.latitude}, ${formData.longitude}`
                              : t("customer.notSpecified")
                            }
                          </p>
                        </div>
                        {formData.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">{t("customer.notes")}:</span>
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
                  {t("customer.previous")}
                </Button>
              )}
              
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  {t("customer.unsavedChanges")}
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
                {t("customer.cancel")}
            </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  {t("customer.next")}
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
                      {t("customer.adding")}
                  </>
                ) : (
                  <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("customer.add")}
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
        title={t("customer.selectLocation")}
      />
    </Dialog>
  )
})
