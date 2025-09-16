"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Star, Package, Clock, MapPin, Save, X, DollarSign, TrendingUp, Navigation, CheckCircle, XCircle, Calendar, Loader2, AlertCircle } from "lucide-react"
import { updateCustomer, Customer as SupabaseCustomer } from "@/lib/customers"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  customer_id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'vip' | 'inactive'
  total_orders: number
  total_spent: number
  last_order_date?: string
  rating: number
  preferred_delivery_time: string
  avatar_url?: string
  join_date?: string
  notes?: string
  // GPS/Geolocation fields
  latitude?: number
  longitude?: number
  // Visit tracking fields
  visit_status: 'visited' | 'not_visited'
  last_visit_date?: string
  visit_notes?: string
  created_at?: string
  updated_at?: string
}

interface CustomerProfileModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Customer) => void
}

export function CustomerProfileModal({ customer, isOpen, onClose, onSave }: CustomerProfileModalProps) {
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(customer)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Update editedCustomer when customer prop changes
  useEffect(() => {
    if (customer) {
      setEditedCustomer(customer)
    }
  }, [customer])

  if (!customer || !editedCustomer) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!editedCustomer.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!editedCustomer.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedCustomer.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!editedCustomer.phone.trim()) {
      newErrors.phone = "Phone is required"
    }
    if (!editedCustomer.address.trim()) {
      newErrors.address = "Address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const updateData = {
        id: editedCustomer.id,
        name: editedCustomer.name,
        email: editedCustomer.email,
        phone: editedCustomer.phone,
        address: editedCustomer.address,
        status: editedCustomer.status,
        preferred_delivery_time: editedCustomer.preferred_delivery_time,
        notes: editedCustomer.notes,
        latitude: editedCustomer.latitude || undefined,
        longitude: editedCustomer.longitude || undefined,
        visit_status: editedCustomer.visit_status,
        last_visit_date: editedCustomer.last_visit_date || undefined,
        visit_notes: editedCustomer.visit_notes,
      }

      const { data, error } = await updateCustomer(updateData)

      if (error) {
        toast({
          title: "Error",
          description: `Failed to update customer: ${error}`,
          variant: "destructive",
        })
        return
      }

      if (data) {
        // Update the local state with the returned data
        const updatedCustomer = data as Customer
        setEditedCustomer(updatedCustomer)
        onSave(updatedCustomer)
        setIsEditing(false)
        setErrors({})
        toast({
          title: "Success",
          description: "Customer updated successfully!",
        })
      }
    } catch (err) {
      console.error('Unexpected error updating customer:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
    setErrors({})
  }

  const recentOrders = [
    {
      id: "ORD001",
      date: "2024-01-15",
      items: "Electronics Package",
      amount: 299.99,
      status: "delivered",
      representative: "Mike Johnson",
    },
    {
      id: "ORD002",
      date: "2024-01-10",
      items: "Home Appliances",
      amount: 156.5,
      status: "delivered",
      representative: "Sarah Wilson",
    },
    {
      id: "ORD003",
      date: "2024-01-05",
      items: "Books & Stationery",
      amount: 89.25,
      status: "delivered",
      representative: "David Chen",
    },
  ]

  const monthlyStats = [
    { month: "Jan", orders: 8, spent: 1240.5 },
    { month: "Dec", orders: 12, spent: 1890.75 },
    { month: "Nov", orders: 6, spent: 780.25 },
    { month: "Oct", orders: 10, spent: 1456.0 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={customer.avatar_url || "/placeholder.svg"} alt={customer.name} />
                <AvatarFallback>
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <p className="text-sm text-gray-600">Customer ID: {customer.customer_id}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm" disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="name"
                          value={editedCustomer.name}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.name}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="email"
                          type="email"
                          value={editedCustomer.email}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="phone"
                          value={editedCustomer.phone}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.phone}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <>
                        <Textarea
                          id="address"
                          value={editedCustomer.address}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                          className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.address}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">GPS Latitude</Label>
                      {isEditing ? (
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={editedCustomer.latitude || ""}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, latitude: parseFloat(e.target.value) || undefined })}
                          placeholder="e.g., 33.3152"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{customer.latitude || "Not set"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="longitude">GPS Longitude</Label>
                      {isEditing ? (
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={editedCustomer.longitude || ""}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, longitude: parseFloat(e.target.value) || undefined })}
                          placeholder="e.g., 44.3661"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{customer.longitude || "Not set"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedCustomer.status}
                        onValueChange={(value) => setEditedCustomer({ ...editedCustomer, status: value as 'active' | 'vip' | 'inactive' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className="mt-1">{customer.status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Customer Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{customer.total_orders}</p>
                      <p className="text-sm text-blue-700">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${customer.total_spent.toLocaleString()}</p>
                      <p className="text-sm text-green-700">Total Spent</p>
                    </div>
                  </div>

                  <div>
                    <Label>Customer Rating</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{customer.rating}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Join Date</Label>
                    <p className="text-sm font-medium mt-1">{customer.join_date || "June 15, 2023"}</p>
                  </div>

                  <div>
                    <Label>Last Order</Label>
                    <p className="text-sm font-medium mt-1">{customer.last_order_date || "Never"}</p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={editedCustomer.notes || ""}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                        placeholder="Add customer notes..."
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.notes || "No notes"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">#{order.id}</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.items}</p>
                        <p className="text-xs text-gray-500">Representative: {order.representative}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${order.amount}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Visit Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {customer.visit_status === "visited" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge className={customer.visit_status === "visited" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {customer.visit_status === "visited" ? "Visited" : "Not Visited"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Last Visit Date</Label>
                    <p className="text-sm font-medium mt-1">
                      {customer.last_visit_date || "No visits recorded"}
                    </p>
                  </div>

                  <div>
                    <Label>Visit Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedCustomer.visit_notes || ""}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, visit_notes: e.target.value })}
                        placeholder="Add visit notes..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {customer.visit_notes || "No visit notes"}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="visitStatus">Update Status</Label>
                        <Select
                          value={editedCustomer.visit_status || "not_visited"}
                          onValueChange={(value) => setEditedCustomer({ ...editedCustomer, visit_status: value as 'visited' | 'not_visited' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_visited">Not Visited</SelectItem>
                            <SelectItem value="visited">Visited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="lastVisitDate">Last Visit Date</Label>
                        <Input
                          id="lastVisitDate"
                          type="date"
                          value={editedCustomer.last_visit_date || ""}
                          onChange={(e) => setEditedCustomer({ ...editedCustomer, last_visit_date: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>GPS Coordinates</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-mono">
                        {customer.latitude && customer.longitude 
                          ? `${customer.latitude}, ${customer.longitude}`
                          : "No GPS coordinates available"
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <p className="text-sm font-medium mt-1">{customer.address}</p>
                  </div>

                  {customer.latitude && customer.longitude && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Map Link:</strong> 
                        <a 
                          href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline"
                        >
                          View on Google Maps
                        </a>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyStats.map((stat) => (
                      <div key={stat.month} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{stat.month}</span>
                        <div className="text-right">
                          <p className="text-sm font-medium">{stat.orders} orders</p>
                          <p className="text-xs text-gray-600">${stat.spent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Customer Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ${customer.total_orders > 0 ? (customer.total_spent / customer.total_orders).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-sm text-purple-700">Average Order Value</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">${(customer.total_spent / 12).toFixed(2)}</p>
                    <p className="text-sm text-orange-700">Monthly Average</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryTime">Preferred Delivery Time</Label>
                  {isEditing ? (
                    <Select
                      value={editedCustomer.preferred_delivery_time}
                      onValueChange={(value) => setEditedCustomer({ ...editedCustomer, preferred_delivery_time: value })}
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
                  ) : (
                    <p className="text-sm font-medium mt-1">{customer.preferred_delivery_time}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Contactless Delivery</p>
                    <p className="text-xs text-gray-600">Preferred</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-xs text-gray-600">Enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
