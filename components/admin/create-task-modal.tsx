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
import { getWarehouses } from "@/lib/warehouse"
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

const mockProducts = [
  {
    id: 1,
    product_name: "Industrial Steel Pipes",
    product_code: "ISP-001",
    main_group: { group_name: "Steel Products" },
    unit_of_measurement: { unit_name: "meters" },
    currentStock: 150,
    currentPrice: 25000,
    currency: "IQD",
    warehouses: [
      { id: 1, name: "Main Warehouse", stock: 100, location: "Baghdad Central" },
      { id: 2, name: "North Warehouse", stock: 50, location: "Mosul" }
    ]
  },
  {
    id: 2,
    product_name: "Aluminum Sheets",
    product_code: "ALS-002",
    main_group: { group_name: "Aluminum Products" },
    unit_of_measurement: { unit_name: "sheets" },
    currentStock: 75,
    currentPrice: 18000,
    currency: "IQD",
    warehouses: [
      { id: 1, name: "Main Warehouse", stock: 45, location: "Baghdad Central" },
      { id: 3, name: "South Warehouse", stock: 30, location: "Basra" }
    ]
  },
  {
    id: 3,
    product_name: "Copper Wire",
    product_code: "CW-003",
    main_group: { group_name: "Electrical Components" },
    unit_of_measurement: { unit_name: "meters" },
    currentStock: 200,
    currentPrice: 12000,
    currency: "IQD",
    warehouses: [
      { id: 1, name: "Main Warehouse", stock: 120, location: "Baghdad Central" },
      { id: 4, name: "East Warehouse", stock: 80, location: "Erbil" }
    ]
  },
  {
    id: 4,
    product_name: "Industrial Valves",
    product_code: "IV-004",
    main_group: { group_name: "Mechanical Parts" },
    unit_of_measurement: { unit_name: "pieces" },
    currentStock: 45,
    currentPrice: 35000,
    currency: "IQD",
    warehouses: [
      { id: 2, name: "North Warehouse", stock: 25, location: "Mosul" },
      { id: 3, name: "South Warehouse", stock: 20, location: "Basra" }
    ]
  },
  {
    id: 5,
    product_name: "Steel Beams",
    product_code: "SB-005",
    main_group: { group_name: "Steel Products" },
    unit_of_measurement: { unit_name: "pieces" },
    currentStock: 30,
    currentPrice: 45000,
    currency: "IQD",
    warehouses: [
      { id: 1, name: "Main Warehouse", stock: 20, location: "Baghdad Central" },
      { id: 2, name: "North Warehouse", stock: 10, location: "Mosul" }
    ]
  },
  {
    id: 6,
    product_name: "Electrical Cables",
    product_code: "EC-006",
    main_group: { group_name: "Electrical Components" },
    unit_of_measurement: { unit_name: "meters" },
    currentStock: 0,
    currentPrice: 8000,
    currency: "IQD",
    warehouses: []
  },
  {
    id: 7,
    product_name: "Aluminum Frames",
    product_code: "AF-007",
    main_group: { group_name: "Aluminum Products" },
    unit_of_measurement: { unit_name: "pieces" },
    currentStock: 60,
    currentPrice: 22000,
    currency: "IQD",
    warehouses: [
      { id: 3, name: "South Warehouse", stock: 35, location: "Basra" },
      { id: 4, name: "East Warehouse", stock: 25, location: "Erbil" }
    ]
  },
  {
    id: 8,
    product_name: "Steel Plates",
    product_code: "SP-008",
    main_group: { group_name: "Steel Products" },
    unit_of_measurement: { unit_name: "pieces" },
    currentStock: 90,
    currentPrice: 28000,
    currency: "IQD",
    warehouses: [
      { id: 1, name: "Main Warehouse", stock: 50, location: "Baghdad Central" },
      { id: 2, name: "North Warehouse", stock: 25, location: "Mosul" },
      { id: 4, name: "East Warehouse", stock: 15, location: "Erbil" }
    ]
  }
]

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
    items: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Product selection state
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"details" | "products">("details")
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false)

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

  // Load warehouses when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWarehouses()
    }
  }, [isOpen, loadWarehouses])

  // Filter products based on search term and warehouse
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.product_code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.main_group?.group_name?.toLowerCase().includes(productSearchTerm.toLowerCase())
    
    const matchesWarehouse = !selectedWarehouse || selectedWarehouse === "all" || 
      product.warehouses.some(w => w.id.toString() === selectedWarehouse)
    
    return matchesSearch && matchesWarehouse
  })

  // Handle product selection
  const handleAddProduct = (product: any) => {
    const warehouse = product.warehouses?.[0] // Use first available warehouse
    if (!warehouse || warehouse.stock <= 0) {
      toast({
        title: "No Stock Available",
        description: "This product is not available in any warehouse",
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
        price: product.currentPrice || 0,
        currency: product.currency || 'IQD',
        unit: product.unit_of_measurement?.unit_name || 'pcs',
        warehouse: warehouse.name,
        availableStock: warehouse.stock
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
    if (!formData.items.trim()) newErrors.items = t("task.itemsRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const selectedCustomer = mockCustomers.find((c) => c.id === formData.customerId)
      const selectedRepresentative = formData.representativeId ? mockRepresentatives.find((r) => r.id === formData.representativeId) : null

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
      const taskItems: CreateTaskItemData[] = selectedProducts.map(product => ({
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: product.quantity,
        unit_price: product.price,
        total_price: product.price * product.quantity,
        unit_of_measurement: product.unit,
        warehouse_id: 1, // Default warehouse ID
        warehouse_name: product.warehouse
      }))

      // If no products selected, create items from the text input
      if (taskItems.length === 0 && formData.items.trim()) {
        const textItems = formData.items.split(",").map((item) => item.trim())
        textItems.forEach((item, index) => {
          taskItems.push({
            product_id: 999 + index, // Dummy product ID for text items
            product_name: item,
            product_code: `TEXT-${index + 1}`,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            unit_of_measurement: 'pcs',
            warehouse_id: 1,
            warehouse_name: 'Main Warehouse'
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
        items: "",
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

  const availableRepresentatives = mockRepresentatives.filter((representative) => representative.status === "available")

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

                  <div>
                    <Label htmlFor="items">{t("task.items")} (Optional - use Products tab instead)</Label>
                    <Textarea
                      id="items"
                      value={formData.items}
                      onChange={(e) => handleInputChange("items", e.target.value)}
                      placeholder={t("task.itemsPlaceholder")}
                      rows={3}
                    />
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
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Product Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Warehouse Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="productSearch">Search Products</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="productSearch"
                          placeholder="Search by name, code, or category..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                        <div className="w-48">
                          <Label htmlFor="warehouseFilter">Filter by Warehouse</Label>
                          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={isLoadingWarehouses}>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingWarehouses ? "Loading..." : "All Warehouses"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Warehouses</SelectItem>
                              {warehouses
                                .filter(warehouse => warehouse.status === 'ACTIVE')
                                .map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                  {warehouse.warehouse_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No products found</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{product.product_name}</h3>
                              <p className="text-xs text-gray-500">{product.product_code}</p>
                              <p className="text-xs text-gray-500">{product.main_group?.group_name}</p>
                            </div>
                            <Badge variant={product.currentStock > 0 ? "default" : "destructive"}>
                              {product.currentStock} {product.unit_of_measurement?.unit_name || 'pcs'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{product.currentPrice.toLocaleString()} {product.currency}</div>
                              <div className="text-xs text-gray-500">per {product.unit_of_measurement?.unit_name || 'pcs'}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              disabled={product.currentStock <= 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
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
