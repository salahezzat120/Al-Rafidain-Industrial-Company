"use client"

import { useState } from "react"
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
import { User, Star, Package, Clock, MapPin, Save, X, DollarSign, TrendingUp } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  rating: number
  preferredDeliveryTime: string
  avatar?: string
  joinDate?: string
  notes?: string
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

  if (!customer || !editedCustomer) return null

  const handleSave = () => {
    onSave(editedCustomer)
    setIsEditing(false)
  }

  const recentOrders = [
    {
      id: "ORD001",
      date: "2024-01-15",
      items: "Electronics Package",
      amount: 299.99,
      status: "delivered",
      driver: "Mike Johnson",
    },
    {
      id: "ORD002",
      date: "2024-01-10",
      items: "Home Appliances",
      amount: 156.5,
      status: "delivered",
      driver: "Sarah Wilson",
    },
    {
      id: "ORD003",
      date: "2024-01-05",
      items: "Books & Stationery",
      amount: 89.25,
      status: "delivered",
      driver: "David Chen",
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
                <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                <AvatarFallback>
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <p className="text-sm text-gray-600">Customer ID: {customer.id}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
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
                      <Input
                        id="name"
                        value={editedCustomer.name}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedCustomer.email}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedCustomer.phone}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editedCustomer.address}
                        onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{customer.address}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedCustomer.status}
                        onValueChange={(value) => setEditedCustomer({ ...editedCustomer, status: value })}
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
                      <p className="text-2xl font-bold text-blue-600">{customer.totalOrders}</p>
                      <p className="text-sm text-blue-700">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${customer.totalSpent.toLocaleString()}</p>
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
                    <p className="text-sm font-medium mt-1">{customer.joinDate || "June 15, 2023"}</p>
                  </div>

                  <div>
                    <Label>Last Order</Label>
                    <p className="text-sm font-medium mt-1">{customer.lastOrder}</p>
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
                        <p className="text-xs text-gray-500">Driver: {order.driver}</p>
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
                      ${(customer.totalSpent / customer.totalOrders).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-700">Average Order Value</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">${(customer.totalSpent / 12).toFixed(2)}</p>
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
                      value={editedCustomer.preferredDeliveryTime}
                      onValueChange={(value) => setEditedCustomer({ ...editedCustomer, preferredDeliveryTime: value })}
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
                    <p className="text-sm font-medium mt-1">{customer.preferredDeliveryTime}</p>
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
