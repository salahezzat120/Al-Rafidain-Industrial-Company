"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Star, Truck, Filter, Download, Navigation } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DriverProfileModal } from "./driver-profile-modal"
import { AddDriverModal } from "./add-driver-modal"
import { LiveTrackingModal } from "./live-tracking-modal"
import { useLanguage } from "@/contexts/language-context"
import { getDrivers } from "@/lib/supabase-utils"
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertCircle } from "@/components/ui/alert"
import { generateDriverId } from "@/lib/supabase-utils";
import { DatePicker } from '@/components/ui/date-picker';

export function RepresentativesTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [representatives, setRepresentatives] = useState<any[]>([])
  const [selectedRepresentative, setSelectedRepresentative] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [formData, setFormData] = useState({ id: '' });
  const [errors, setErrors] = useState({ id: '' });

  const { t } = useLanguage()

  useEffect(() => {
    const fetchRepresentatives = async () => {
      const { data, error } = await getDrivers()
      if (error) {
        console.error('Error fetching representatives:', error)
      } else {
        setRepresentatives(data || [])
      }
    }

    fetchRepresentatives()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on-route":
        return "bg-blue-100 text-blue-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRepresentatives = representatives.filter(
    (representative) =>
      representative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      representative.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewProfile = (representative: any) => {
    setSelectedRepresentative(representative)
    setIsProfileModalOpen(true)
  }

  const handleLiveTracking = (representative: any) => {
    setSelectedRepresentative(representative)
    setIsTrackingModalOpen(true)
  }

  const handleSaveRepresentative = (updatedRepresentative: any) => {
    setRepresentatives((prev) => prev.map((d) => (d.id === updatedRepresentative.id ? updatedRepresentative : d)))
    setIsProfileModalOpen(false)
  }

  const handleAddRepresentative = (newRepresentative: any) => {
    setRepresentatives((prev) => [...prev, newRepresentative])
  }

  const getStatusStats = () => {
    const active = representatives.filter((d) => d.status === "active").length
    const onRoute = representatives.filter((d) => d.status === "on-route").length
    const offline = representatives.filter((d) => d.status === "offline").length
    const avgRating = representatives.reduce((sum, d) => sum + d.rating, 0) / representatives.length

    return { active, onRoute, offline, avgRating: avgRating.toFixed(1) }
  }

  const stats = getStatusStats()

  const exportToExcel = (representatives) => {
    const worksheet = XLSX.utils.json_to_sheet(representatives);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Representatives');
    XLSX.writeFile(workbook, 'representatives.xlsx');
  };

  const generateRepresentativeIdHandler = async () => {
    const representativeId = await generateDriverId();
    setFormData(prev => ({ ...prev, id: representativeId }));
  }

  const handleDateRangeChange = (dateRange) => {
    // Logic to filter reports based on selected date range
    console.log('Selected date range:', dateRange);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("representativeManagement")}</h2>
          <p className="text-gray-600">{t("manageDeliveryTeam")}</p>
        </div>
        <div className="flex gap-2">
          <DatePicker
            onChange={(dateRange) => handleDateRangeChange(dateRange)}
            placeholderText={t("selectDateRange")}
            className="border rounded-md"
          />
          <Button variant="outline" onClick={() => exportToExcel(representatives)}>
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("representative")}
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
                <p className="text-sm text-gray-600">{t("activeRepresentatives")}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("onRoute")}</p>
                <p className="text-xl font-bold">{stats.onRoute}</p>
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
                <p className="text-sm text-gray-600">{t("offline")}</p>
                <p className="text-xl font-bold">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("avgRating")}</p>
                <p className="text-xl font-bold">{stats.avgRating}</p>
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
                placeholder={t("searchDrivers")}
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
            {filteredRepresentatives.map((representative) => (
              <div key={representative.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={representative.avatar || "/placeholder.svg"} alt={representative.name} />
                  <AvatarFallback>
                    {representative.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{representative.name}</p>
                    <p className="text-sm text-gray-500">ID: {representative.id}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Mail className="h-3 w-3" />
                      {representative.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {representative.phone}
                    </div>
                  </div>

                  <div>
                    <Badge className={getStatusColor(representative.status)}>
                      {representative.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {representative.location}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{representative.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {representative.deliveries} {t("deliveries")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {t("vehicle")}: {representative.vehicle}
                      </p>
                      {representative.coverageAreas && representative.coverageAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {representative.coverageAreas.slice(0, 2).map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                            >
                              {area}
                            </span>
                          ))}
                          {representative.coverageAreas.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{representative.coverageAreas.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLiveTracking(representative)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProfile(representative)}>
                            {t("viewProfile")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLiveTracking(representative)}>
                            <Navigation className="h-4 w-4 mr-2" />
                            Live Tracking
                          </DropdownMenuItem>
                          <DropdownMenuItem>{t("assignTask")}</DropdownMenuItem>
                          <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
                          <DropdownMenuItem>{t("sendMessage")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">{t("suspend")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <DriverProfileModal
        driver={selectedRepresentative}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveRepresentative}
      />

      <AddDriverModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddRepresentative} />

      <LiveTrackingModal
        driver={selectedRepresentative}
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
    </div>
  )
}