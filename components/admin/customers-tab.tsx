"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Package, Filter, Download, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CustomerProfileModal } from "./customer-profile-modal"
import { AddCustomerModal } from "./add-customer-modal"
import { useLanguage } from "@/contexts/language-context"

const mockCustomers = [
  {
    id: "C001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Downtown, City 12345",
    status: "active",
    totalOrders: 45,
    totalSpent: 2340.5,
    lastOrder: "2024-01-15",
    rating: 4.8,
    preferredDeliveryTime: "Morning (9-12 PM)",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-06-15",
    notes: "Prefers contactless delivery",
  },
  {
    id: "C002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, North Zone, City 12345",
    status: "active",
    totalOrders: 78,
    totalSpent: 4567.25,
    lastOrder: "2024-01-14",
    rating: 4.9,
    preferredDeliveryTime: "Afternoon (1-5 PM)",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-03-22",
    notes: "Regular customer, always tips well",
  },
  {
    id: "C003",
    name: "Bob Johnson",
    email: "bob.johnson@email.com",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Rd, East District, City 12345",
    status: "inactive",
    totalOrders: 12,
    totalSpent: 890.75,
    lastOrder: "2023-11-20",
    rating: 4.2,
    preferredDeliveryTime: "Evening (5-8 PM)",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2023-08-10",
    notes: "Moved to new address",
  },
  {
    id: "C004",
    name: "Alice Brown",
    email: "alice.brown@email.com",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, West Zone, City 12345",
    status: "vip",
    totalOrders: 156,
    totalSpent: 8920.0,
    lastOrder: "2024-01-16",
    rating: 5.0,
    preferredDeliveryTime: "Flexible",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2022-12-05",
    notes: "VIP customer, priority handling",
  },
]

export function CustomersTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { t } = useLanguage()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "vip":
        return "bg-purple-100 text-purple-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewProfile = (customer: any) => {
    setSelectedCustomer(customer)
    setIsProfileModalOpen(true)
  }

  const handleSaveCustomer = (updatedCustomer: any) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setIsProfileModalOpen(false)
  }

  const handleAddCustomer = (newCustomer: any) => {
    setCustomers((prev) => [...prev, newCustomer])
  }

  const getCustomerStats = () => {
    const active = customers.filter((c) => c.status === "active").length
    const vip = customers.filter((c) => c.status === "vip").length
    const inactive = customers.filter((c) => c.status === "inactive").length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

    return { active, vip, inactive, totalRevenue }
  }

  const stats = getCustomerStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("customerManagement")}</h2>
          <p className="text-gray-600">{t("manageCustomerRelationships")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("activeCustomers")}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("vipCustomers")}</p>
                <p className="text-xl font-bold">{stats.vip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("totalRevenue")}</p>
                <p className="text-xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("inactive")}</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchCustomers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t("filter")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                  <AvatarFallback>
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">ID: {customer.id}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{customer.address.split(",")[0]}</span>
                    </div>
                    <Badge className={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">{customer.totalOrders} orders</p>
                    <p className="text-sm text-gray-600">${customer.totalSpent.toLocaleString()}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{customer.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">Last: {customer.lastOrder}</p>
                  </div>

                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(customer)}>
                          {t("viewProfile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>{t("createOrder")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("sendMessage")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">{t("deactivate")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CustomerProfileModal
        customer={selectedCustomer}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCustomer} />
    </div>
  )
}
