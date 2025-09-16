"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Truck, AlertCircle, Upload, MapPin, Camera } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { addDriver } from "@/lib/supabase-utils"

interface AddRepresentativeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (representative: any) => void
}

export function AddRepresentativeModal({ isOpen, onClose, onAdd }: AddRepresentativeModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    emergencyContact: "",
    vehicle: "",
    status: "active",
    idImage: null as File | null,
    coverageAreas: [] as string[],
    id: "", // Added id field
    transportation: "foot" as "foot" | "vehicle", // Added transportation field
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = t("nameRequired")
    if (!formData.email.trim()) newErrors.email = t("emailRequired")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("invalidEmail")
    if (!formData.phone.trim()) newErrors.phone = t("phoneRequired")
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = t("licenseRequired")
    if (!formData.vehicle.trim()) newErrors.vehicle = t("vehicleRequired")
    if (!formData.id) newErrors.id = t("driverIdRequired") // Added validation for id
    if (!formData.idImage) newErrors.idImage = t("idImageRequired")
    if (formData.coverageAreas.length === 0) newErrors.coverageAreas = t("coverageRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const driverId = await generateDriverId();
    const newDriver = {
      id: driverId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      license_number: formData.licenseNumber,
      emergency_contact: formData.emergencyContact,
      vehicle: formData.vehicle,
      status: formData.status,
      coverage_areas: formData.coverageAreas,
      // Add other fields as needed
    };

    const { data, error } = await addDriver(newDriver);

    if (error) {
      console.error('Error adding driver:', error);
      // Handle error (e.g., show a notification)
    } else {
      onAdd(data);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        licenseNumber: "",
        emergencyContact: "",
        vehicle: "",
        status: "active",
        idImage: null,
        coverageAreas: [],
        id: "", // Reset id
        transportation: "foot", // Reset transportation
      });
      onClose();
    }

    setIsSubmitting(false);
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, idImage: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setIdImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverageAreaChange = (area: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      coverageAreas: checked
        ? [...prev.coverageAreas, area]
        : prev.coverageAreas.filter((a) => a !== area),
    }))
  }

  const coverageAreaOptions = [
    { key: "downtownDistrict", value: "Downtown District" },
    { key: "northZone", value: "North Zone" },
    { key: "southZone", value: "South Zone" },
    { key: "eastDistrict", value: "East District" },
    { key: "westZone", value: "West Zone" },
    { key: "industrialArea", value: "Industrial Area" },
    { key: "residentialSectorA", value: "Residential Sector A" },
    { key: "residentialSectorB", value: "Residential Sector B" },
    { key: "businessDistrict", value: "Business District" },
    { key: "airportZone", value: "Airport Zone" }
  ]

  const statusOptions = [
    { value: "available", label: t("available") },
    { value: "busy", label: t("busy") },
    { value: "offline", label: t("offline") },
    { value: "on_route", label: t("onRoute") }
  ]

  const generateDriverId = async () => {
    // This is a placeholder for a real ID generation logic.
    // In a real application, you would generate a unique ID here.
    // For demonstration, we'll return a dummy ID.
    return `DRV-${Math.floor(Math.random() * 1000000)}`;
  };

  const generateDriverIdHandler = async () => {
    const driverId = await generateDriverId();
    setFormData(prev => ({ ...prev, id: driverId }));
  }

  const addCoverageArea = () => {
    const newArea = prompt(t("enterAreaName"));
    if (newArea) {
      setFormData(prev => ({ ...prev, coverageAreas: [...prev.coverageAreas, newArea] }));
    }
  }

  const removeCoverageArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.filter((_, i) => i !== index)
    }));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <User className="h-5 w-5" />
            {t("addNewRepresentative")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("personalInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("fullName")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={t("enterFullName")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">{t("emailAddress")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="driver@company.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">{t("phoneNumber")} *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="address">{t("address")}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder={t("enterHomeAddress")}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t("workInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium">{t("transportationOption")}</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transportation"
                        value="foot"
                        onChange={() => handleInputChange("transportation", "foot")}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">{t("onFoot")}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transportation"
                        value="vehicle"
                        onChange={() => handleInputChange("transportation", "vehicle")}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">{t("withVehicle")}</span>
                    </label>
                  </div>
                </div>

                {formData.transportation === "vehicle" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="license" className="font-medium">{t("driversLicenseNumber")} *</Label>
                      <Input
                        id="license"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        placeholder={t("enterLicenseNumber")}
                        className={`mt-1 block w-full ${errors.licenseNumber ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="vehicle" className="font-medium">{t("assignedVehicle")} *</Label>
                      <Select value={formData.vehicle} onValueChange={(value) => handleInputChange("vehicle", value)}>
                        <SelectTrigger className={`mt-1 block w-full ${errors.vehicle ? "border-red-500" : "border-gray-300"}`}>
                          <SelectValue placeholder={t("selectVehicle")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VH-001">{t("vehicle1")}</SelectItem>
                          <SelectItem value="VH-002">{t("vehicle2")}</SelectItem>
                          <SelectItem value="VH-003">{t("vehicle3")}</SelectItem>
                          <SelectItem value="VH-004">{t("vehicle4")}</SelectItem>
                          <SelectItem value="VH-005">{t("vehicle5")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vehicle && <p className="text-sm text-red-600 mt-1">{errors.vehicle}</p>}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="emergency">{t("emergencyContact")}</Label>
                  <Input
                    id="emergency"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder={t("nameAndPhone")}
                  />
                </div>

                <div>
                  <Label htmlFor="status">{t("initialStatus")}</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add the driver ID input and generate button to the form layout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("driverInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driver_id">Driver ID *</Label>
                <div className="flex gap-2">
                  <Input
                    id="driver_id"
                    value={formData.id || ''}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    placeholder="Enter Driver ID"
                    className={errors.id ? 'border-red-500' : ''}
                  />
                  <Button type="button" variant="outline" onClick={generateDriverIdHandler}>
                    Generate
                  </Button>
                </div>
                {errors.id && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.id}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ID Upload and Coverage Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {t("idVerification")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="idUpload">{t("officialIdImage")} *</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="idUpload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="idUpload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      {idImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={idImagePreview}
                            alt="ID Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">{t("clickToUpload")}</span> {t("uploadId")}
                          </p>
                          <p className="text-xs text-gray-500">{t("fileFormats")}</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.idImage && <p className="text-sm text-red-600 mt-1">{errors.idImage}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("geographicCoverage")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t("selectCoverageAreas")} *</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {formData.coverageAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{area}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeCoverageArea(index)}>
                          {t("remove")}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addCoverageArea} className="mt-2">
                    {t("addArea")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("ensureAccuracy")}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("addingDriver") : t("addDriver")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
