"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, User, AlertCircle, Search, Plus, Minus, ShoppingCart, Warehouse, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { createDeliveryTask } from "@/lib/delivery-tasks"
import { getWarehouses, getProductsForDelivery, getCustomers, getRepresentatives } from "@/lib/warehouse"
import type { CreateDeliveryTaskData, CreateTaskItemData } from "@/types/delivery-tasks"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: any) => void
}

interface SelectedProduct {
  id: number
  name: string
  code: string
  quantity: number
  price: number
  currency: string
  unit: string
  warehouse: string
  availableStock: number
}


// Customer data will be loaded from database

// Representative data will be loaded from database

// Warehouse interface
interface Warehouse {
  id: number;
  warehouse_name: string;
  warehouse_name_ar: string;
  location: string;
  location_ar: string;
  manager_name?: string;
  manager_name_ar?: string;
  contact_phone?: string;
  contact_email?: string;
  capacity?: number;
  current_utilization?: number;
  status: string;
  created_at: string;
  updated_at: string;
}


export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    representativeId: "",
    priority: "medium",
    scheduledFor: "",
    estimatedTime: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false)
  
  // Product selection state
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"details" | "products">("details")
  
  // Product data state
  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  
  // Customer data state
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  
  // Representative data state
  const [representatives, setRepresentatives] = useState<any[]>([])
  const [isLoadingRepresentatives, setIsLoadingRepresentatives] = useState(false)
  

  // Load warehouses from Supabase
  const loadWarehouses = useCallback(async () => {
    try {
      setIsLoadingWarehouses(true)
      const warehousesData = await getWarehouses()
      setWarehouses(warehousesData)
    } catch (error) {
      console.error('Error loading warehouses:', error)
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive",
      })
    } finally {
      setIsLoadingWarehouses(false)
    }
  }, [toast])

  // Load products from Supabase
  const loadProducts = useCallback(async () => {
    try {
      console.log('🔄 Loading products...')
      setIsLoadingProducts(true)
      const productsData = await getProductsForDelivery()
      console.log('📦 Products loaded:', productsData?.length || 0)
      console.log('📋 Products data:', productsData)
      setProducts(productsData)
      setFilteredProducts(productsData)
    } catch (error) {
      console.error('❌ Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }, [toast])

  // Load customers from Supabase
  const loadCustomers = useCallback(async () => {
    try {
      console.log('🔄 Loading customers...')
      setIsLoadingCustomers(true)
      const customersData = await getCustomers()
      console.log('👥 Customers loaded:', customersData?.length || 0)
      console.log('📋 Customers data:', customersData)
      setCustomers(customersData)
    } catch (error) {
      console.error('❌ Error loading customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [toast])

  // Load representatives from Supabase
  const loadRepresentatives = useCallback(async () => {
    try {
      console.log('🔄 Loading representatives...')
      setIsLoadingRepresentatives(true)
      const representativesData = await getRepresentatives()
      console.log('📋 Raw representatives data:', representativesData)
      console.log('📋 Data type:', typeof representativesData)
      console.log('📋 Is array:', Array.isArray(representativesData))
      
      // Handle direct array format from warehouse.ts
      if (Array.isArray(representativesData)) {
        console.log('👨‍💼 Representatives loaded:', representativesData.length)
        console.log('📋 Representatives data:', representativesData)
        setRepresentatives(representativesData)
      } else {
        console.error('❌ Representatives data is not an array:', representativesData)
        setRepresentatives([])
      }
    } catch (error) {
      console.error('❌ Error loading representatives:', error)
      setRepresentatives([])
      toast({
        title: "Error",
        description: "Failed to load representatives",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRepresentatives(false)
    }
  }, [toast])


  // Load warehouses, products, customers, and representatives when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWarehouses()
      loadProducts()
      loadCustomers()
      loadRepresentatives()
    }
  }, [isOpen, loadWarehouses, loadProducts, loadCustomers, loadRepresentatives])

  // Filter products based on search term and warehouse
  useEffect(() => {
    console.log('🔍 Filtering products...')
    console.log('📊 Total products:', products.length)
    console.log('🔍 Search term:', productSearchTerm)
    console.log('🏢 Selected warehouse:', selectedWarehouse)
    
    const filtered = products.filter(product => {
      // Handle quick filter buttons
      if (productSearchTerm === 'low stock') {
        return product.stock > 0 && product.stock <= 5
      }
      if (productSearchTerm === 'out of stock') {
        return product.stock <= 0
      }
      
      // Regular search functionality
      const matchesSearch = productSearchTerm === '' || 
        product.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.product_code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.main_group?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sub_group?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(productSearchTerm.toLowerCase())
      
      const matchesWarehouse = selectedWarehouse === "all" || 
        product.warehouses?.includes(warehouses.find(w => w.id.toString() === selectedWarehouse)?.warehouse_name || '')
      
      return matchesSearch && matchesWarehouse
    })
    
    console.log('✅ Filtered products:', filtered.length)
    setFilteredProducts(filtered)
  }, [products, productSearchTerm, selectedWarehouse, warehouses])

  // Handle product selection with duplicate prevention
  const handleAddProduct = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "No Stock Available",
        description: "This product is out of stock",
        variant: "destructive",
      })
      return
    }

    // Prevent duplicate additions by checking if product is already being processed
    const existingProduct = selectedProducts.find(p => p.id === product.id)
    if (existingProduct) {
      // If product exists, just increase quantity (don't add duplicate)
      setSelectedProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, quantity: Math.min(p.quantity + 1, p.availableStock) }
          : p
      ))
      console.log('📦 Product quantity increased:', product.product_name, 'New quantity:', existingProduct.quantity + 1)
    } else {
      // Add new product only if it doesn't exist
      const newProduct: SelectedProduct = {
        id: product.id,
        name: product.product_name,
        code: product.product_code || '',
        quantity: 1,
        price: product.selling_price || product.cost_price || 0,
        currency: 'IQD',
        unit: product.unit || 'pcs',
        warehouse: product.warehouses || 'Main Warehouse',
        availableStock: product.stock
      }
      setSelectedProducts(prev => [...prev, newProduct])
      console.log('📦 New product added:', product.product_name)
    }
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(0, Math.min(quantity, p.availableStock)) } : p
    ))
  }

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const getTotalValue = () => {
    return selectedProducts.reduce((total, product) => total + (product.price * product.quantity), 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = t("task.titleRequired")
    if (!formData.customerId) newErrors.customerId = t("task.customerRequired")
    if (!formData.scheduledFor) newErrors.scheduledFor = t("task.scheduledRequired")
    if (!formData.estimatedTime) newErrors.estimatedTime = t("task.estimatedRequired")
    // Items field removed - products are selected in the products tab

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('⚠️ Form submission already in progress, ignoring duplicate submission')
      return
    }

    // Debounce protection - prevent rapid clicking
    const now = Date.now()
    if (now - lastSubmitTime < 2000) { // 2 second debounce
      console.log('⚠️ Form submission too soon, please wait before submitting again')
      toast({
        title: "Please Wait",
        description: "Please wait a moment before submitting again",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) return

    setIsSubmitting(true)
    setLastSubmitTime(now)

    try {
      const selectedCustomer = customers.find((c) => c.id === formData.customerId)
      const selectedRepresentative = formData.representativeId ? representatives.find((r) => r.id === formData.representativeId) : null

      if (!selectedCustomer) {
        toast({
          title: "Error",
          description: "Please select a customer",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Prepare task items from selected products
      console.log('🔍 Selected products for task items:', selectedProducts);
      
      const taskItems: CreateTaskItemData[] = selectedProducts.map(product => ({
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: product.quantity,
        unit_price: product.price,
        total_price: product.price * product.quantity,
        unit_of_measurement: product.unit,
        warehouse_id: null, // No warehouse ID for now - will be set later
        warehouse_name: product.warehouse || 'Unknown Warehouse'
      }))
      
      console.log('📦 Task items created from products:', taskItems);

      // If no products selected, create items from the text input
      if (taskItems.length === 0 && formData.items.trim()) {
        const textItems = formData.items.split(",").map((item) => item.trim())
        textItems.forEach((item, index) => {
          taskItems.push({
            product_id: null, // No product ID for text items
            product_name: item,
            product_code: `TEXT-${index + 1}`,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            unit_of_measurement: 'pcs',
            warehouse_id: null, // No warehouse ID for text items
            warehouse_name: 'Text Item'
          })
        })
      }

      const taskData: CreateDeliveryTaskData = {
        title: formData.title,
        description: formData.notes,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_address: selectedCustomer.address,
        customer_phone: selectedCustomer.phone,
        representative_id: selectedRepresentative?.id,
        representative_name: selectedRepresentative?.name,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        estimated_duration: formData.estimatedTime,
        scheduled_for: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : undefined,
        notes: formData.notes,
        items: taskItems,
        total_value: getTotalValue(),
        currency: 'IQD'
      }
      
      console.log('📋 Final task data to create:', taskData);

      const newTask = await createDeliveryTask(taskData)

      toast({
        title: "Success",
        description: "Delivery task created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        customerId: "",
        representativeId: "",
        priority: "medium",
        scheduledFor: "",
        estimatedTime: "",
        notes: "",
      })
      setSelectedProducts([])
      setProductSearchTerm("")
      setSelectedWarehouse("all")
      setActiveTab("details")
      setErrors({})
      // Reload warehouses to ensure fresh data
      loadWarehouses()
      
      onCreate(newTask)
      onClose()

    } catch (error) {
      console.error('Error creating delivery task:', error)
      toast({
        title: "Error",
        description: "Failed to create delivery task. Please try again.",
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

  const availableRepresentatives = representatives.filter((representative) => 
    representative.status === "active" || representative.status === "on-route"
  )
  
  // Debug logging for representatives
  console.log('🔍 Representatives debug:', {
    isLoadingRepresentatives,
    totalRepresentatives: representatives.length,
    availableRepresentatives: availableRepresentatives.length,
    representatives: representatives,
    availableRepresentatives: availableRepresentatives,
    shouldShowNoRepsMessage: !isLoadingRepresentatives && availableRepresentatives.length === 0
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("task.createNew")}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <User className="h-4 w-4 inline mr-2" />
            Task Details
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("products")}
          >
            <ShoppingCart className="h-4 w-4 inline mr-2" />
            Select Products ({selectedProducts.length})
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "details" && (
            <div className="space-y-3">
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

                  {/* Items field removed - products are selected in the Products tab */}

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
                        {isLoadingCustomers ? (
                          <SelectItem value="loading" disabled>
                            Loading customers...
                          </SelectItem>
                        ) : customers.length === 0 ? (
                          <SelectItem value="no-customers" disabled>
                            No customers found
                          </SelectItem>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.address.split(",")[0]}
                            </SelectItem>
                          ))
                        )}
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
                        {isLoadingRepresentatives ? (
                          <SelectItem value="loading" disabled>
                            Loading representatives...
                          </SelectItem>
                        ) : availableRepresentatives.length === 0 ? (
                          <SelectItem value="no-representatives" disabled>
                            No available representatives
                          </SelectItem>
                        ) : (
                          availableRepresentatives.map((representative) => (
                            <SelectItem key={representative.id} value={representative.id}>
                              {representative.name} ({representative.status === 'active' ? 'Available' : 'On Route'})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!isLoadingRepresentatives && availableRepresentatives.length === 0 && (
                      <p className="text-sm text-yellow-600 mt-1">{t("task.noRepresentativesAvailable")}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="scheduledFor">{t("task.scheduledDateTime")} *</Label>
                    <div className="space-y-2">
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                        className={errors.scheduledFor ? "border-red-500" : ""}
                        min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const now = new Date()
                            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
                            handleInputChange("scheduledFor", tomorrow.toISOString().slice(0, 16))
                          }}
                        >
                          Tomorrow
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const now = new Date()
                            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                            handleInputChange("scheduledFor", nextWeek.toISOString().slice(0, 16))
                          }}
                        >
                          Next Week
                        </Button>
                      </div>
                    </div>
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
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Product Search and Filter */}
              <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-900">Product Search & Filters</span>
                      <p className="text-sm text-gray-600 font-normal mt-1">
                        Find and select products for your delivery task
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="productSearch" className="text-sm font-semibold text-gray-700">
                        Search Products
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="productSearch"
                          placeholder="Search by name, code, or category..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                        />
                        {productSearchTerm && (
                          <button
                            onClick={() => setProductSearchTerm('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="warehouseFilter" className="text-sm font-semibold text-gray-700">
                        Filter by Warehouse
                      </Label>
                      <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={isLoadingWarehouses}>
                        <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                          <SelectValue placeholder={isLoadingWarehouses ? "Loading..." : "All Warehouses"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Warehouses</SelectItem>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.warehouse_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Quick Filters */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Quick Filters</Label>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant={productSearchTerm === '' ? "default" : "outline"}
                        size="lg"
                        onClick={() => setProductSearchTerm('')}
                        className="px-6 py-3 rounded-xl font-semibold"
                      >
                        All Products
                      </Button>
                      <Button
                        variant={productSearchTerm === 'low stock' ? "default" : "outline"}
                        size="lg"
                        onClick={() => setProductSearchTerm(productSearchTerm === 'low stock' ? '' : 'low stock')}
                        className="px-6 py-3 rounded-xl font-semibold"
                      >
                        Low Stock
                      </Button>
                      <Button
                        variant={productSearchTerm === 'out of stock' ? "default" : "outline"}
                        size="lg"
                        onClick={() => setProductSearchTerm(productSearchTerm === 'out of stock' ? '' : 'out of stock')}
                        className="px-6 py-3 rounded-xl font-semibold"
                      >
                        Out of Stock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Products Summary */}
              {selectedProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Selected Products ({selectedProducts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              Code: {product.code} | {product.warehouse} | Stock: {product.availableStock} {product.unit}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{product.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                                disabled={product.quantity >= product.availableStock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{(product.price * product.quantity).toLocaleString()} {product.currency}</div>
                              <div className="text-sm text-gray-500">{product.price.toLocaleString()} {product.currency}/{product.unit}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total Value:</span>
                          <span>{getTotalValue().toLocaleString()} IQD</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Products */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-gray-900">Available Products</span>
                        <p className="text-sm text-gray-600 font-normal mt-1">
                          Select products for your delivery task
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {filteredProducts.length} products
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingProducts ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Loading products...</p>
                      <p className="text-sm">Please wait while we fetch the latest inventory</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                      <p className="text-sm mb-4">Try adjusting your search or filters</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setProductSearchTerm('');
                          setSelectedWarehouse('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="space-y-2">
                        {filteredProducts.map((product) => {
                          const isSelected = selectedProducts.some(p => p.id === product.id);
                          const isOutOfStock = product.stock <= 0;
                          const isLowStock = product.stock > 0 && product.stock <= 5;
                          const selectedProduct = selectedProducts.find(p => p.id === product.id);
                          const price = product.selling_price || product.cost_price || 0;
                          
                            return (
                              <div 
                                key={product.id} 
                                className={`group relative bg-white border rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-gray-200 hover:border-blue-300'
                                } ${isOutOfStock ? 'opacity-60' : ''}`}
                              >
                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                              )}

                              {/* Product Header */}
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                                    {product.product_name}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {product.product_code || 'N/A'} • {product.main_group}
                                  </p>
                                </div>
                                <Badge 
                                  variant={
                                    isOutOfStock ? "destructive" : 
                                    isLowStock ? "secondary" : 
                                    "default"
                                  }
                                  className="text-xs px-2 py-1"
                                >
                                  {product.stock} {product.unit || 'pcs'}
                                </Badge>
                              </div>

                              {/* Product Details */}
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">Price:</span>
                                <span className="font-semibold text-sm text-green-600">
                                  {price.toLocaleString()} IQD
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between">
                                {isSelected ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateQuantity(product.id, (selectedProduct?.quantity || 0) - 1)}
                                      disabled={!selectedProduct || selectedProduct.quantity <= 1}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-xs font-semibold text-blue-800 min-w-[1.5rem] text-center">
                                      {selectedProduct?.quantity || 0}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateQuantity(product.id, (selectedProduct?.quantity || 0) + 1)}
                                      disabled={isOutOfStock}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddProduct(product)}
                                    disabled={isOutOfStock}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                                  >
                                    {isOutOfStock ? 'Out of Stock' : 'Add'}
                                  </Button>
                                )}
                                {isSelected && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    {((selectedProduct?.quantity || 0) * price).toLocaleString()} IQD
                                  </span>
                                )}
                              </div>

                              {/* Stock Warning */}
                              {isLowStock && !isOutOfStock && (
                                <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                                  <div className="flex items-center">
                                    <span className="text-orange-600 mr-2">⚠️</span>
                                    <span className="text-sm text-orange-700 font-medium">
                                      Only {product.stock} units remaining
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Out of Stock Overlay */}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-xl flex items-center justify-center">
                                  <div className="text-center text-white">
                                    <div className="text-2xl mb-2">❌</div>
                                    <p className="font-semibold">Out of Stock</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected Products Summary */}
          {selectedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Selected Products ({selectedProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.code} • {product.quantity} {product.unit} • {product.price} IQD each
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{(product.price * product.quantity).toLocaleString()} IQD</div>
                        <div className="text-sm text-gray-500">Qty: {product.quantity}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total Order Value:</span>
                      <span className="text-green-600">{getTotalValue().toLocaleString()} IQD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formData.representativeId !== "unassigned" ? t("task.taskWillBeAssigned") : t("task.taskWillBePending")}
              <span className="block mt-2 text-sm text-blue-600">
                💡 Add products to your order, then click "Create Task" when ready
              </span>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              {activeTab === "details" && (
                <Button type="button" onClick={() => setActiveTab("products")}>
                  Select Products →
                </Button>
              )}
              {activeTab === "products" && (
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  ← Back to Details
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className={selectedProducts.length > 0 ? "bg-green-600 hover:bg-green-700" : ""}>
                {isSubmitting ? t("task.creatingTask") : t("task.createTask")}
                {selectedProducts.length > 0 && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    {selectedProducts.length} products
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
