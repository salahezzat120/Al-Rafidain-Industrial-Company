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
import { Package, User, AlertCircle, Search, Plus, Minus, ShoppingCart, Warehouse } from "lucide-react"
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

  // Handle product selection
  const handleAddProduct = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "No Stock Available",
        description: "This product is out of stock",
        variant: "destructive",
      })
      return
    }

    const existingProduct = selectedProducts.find(p => p.id === product.id)
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, quantity: Math.min(p.quantity + 1, p.availableStock) }
          : p
      ))
    } else {
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

    if (!validateForm()) return

    setIsSubmitting(true)

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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "details" && (
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Product Search & Filters
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Find and select products for your delivery task
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productSearch" className="text-sm font-medium">
                        Search Products
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="productSearch"
                          placeholder="Search by name, code, or category..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-10 h-10"
                        />
                        {productSearchTerm && (
                          <button
                            onClick={() => setProductSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warehouseFilter" className="text-sm font-medium">
                        Filter by Warehouse
                      </Label>
                      <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={isLoadingWarehouses}>
                        <SelectTrigger className="h-10">
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={productSearchTerm === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductSearchTerm('')}
                    >
                      All Products
                    </Button>
                    <Button
                      variant={productSearchTerm === 'low stock' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductSearchTerm(productSearchTerm === 'low stock' ? '' : 'low stock')}
                    >
                      Low Stock
                    </Button>
                    <Button
                      variant={productSearchTerm === 'out of stock' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductSearchTerm(productSearchTerm === 'out of stock' ? '' : 'out of stock')}
                    >
                      Out of Stock
                    </Button>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Available Products</span>
                    <Badge variant="outline" className="text-xs">
                      {filteredProducts.length} products
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <p>No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.some(p => p.id === product.id);
                        const isOutOfStock = product.stock <= 0;
                        const isLowStock = product.stock > 0 && product.stock <= 5;
                        
                        return (
                          <div 
                            key={product.id} 
                            className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                            } ${isOutOfStock ? 'opacity-60' : ''}`}
                          >
                            {/* Product Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                  {product.product_name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  Code: {product.product_code || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.main_group}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge 
                                  variant={
                                    isOutOfStock ? "destructive" : 
                                    isLowStock ? "secondary" : 
                                    "default"
                                  }
                                  className="text-xs"
                                >
                                  {product.stock} {product.unit || 'pcs'}
                                </Badge>
                                {isLowStock && !isOutOfStock && (
                                  <span className="text-xs text-orange-600 font-medium">Low Stock</span>
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Price:</span>
                                <span className="font-medium text-sm">
                                  {product.selling_price?.toLocaleString() || product.cost_price?.toLocaleString() || '0'} IQD
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Unit:</span>
                                <span className="text-xs text-gray-600">{product.unit || 'pcs'}</span>
                              </div>
                              {product.warehouses && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">Warehouse:</span>
                                  <span className="text-xs text-gray-600 truncate max-w-20">
                                    {product.warehouses}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {isSelected ? (
                                <div className="flex-1 flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateQuantity(product.id, selectedProducts.find(p => p.id === product.id)?.quantity - 1 || 0)}
                                    disabled={!selectedProducts.find(p => p.id === product.id) || selectedProducts.find(p => p.id === product.id)?.quantity <= 1}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium min-w-8 text-center">
                                    {selectedProducts.find(p => p.id === product.id)?.quantity || 0}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateQuantity(product.id, (selectedProducts.find(p => p.id === product.id)?.quantity || 0) + 1)}
                                    disabled={!selectedProducts.find(p => p.id === product.id) || (selectedProducts.find(p => p.id === product.id)?.quantity || 0) >= product.stock}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddProduct(product)}
                                  disabled={isOutOfStock}
                                  className="flex-1"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {isOutOfStock ? 'Out of Stock' : 'Add to Order'}
                                </Button>
                              )}
                              
                              {isSelected && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="px-2"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>

                            {/* Stock Warning */}
                            {isLowStock && !isOutOfStock && (
                              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                                ⚠️ Only {product.stock} units remaining
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formData.representativeId !== "unassigned" ? t("task.taskWillBeAssigned") : t("task.taskWillBePending")}
              {selectedProducts.length > 0 && (
                <span className="block mt-1">
                  Total order value: {getTotalValue().toLocaleString()} IQD
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <div className="flex gap-2">
              {activeTab === "products" && (
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  ← Back to Details
                </Button>
              )}
            </div>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("task.creatingTask") : t("task.createTask")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
