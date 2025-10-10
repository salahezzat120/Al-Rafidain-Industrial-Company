import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Truck, MapPin, Sparkles, UserPlus, Shield, Clock, CheckCircle, AlertCircle, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { addRepresentative } from "@/lib/supabase-utils";

export function AddRepresentativeModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (representative: any) => void; }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    emergencyContact: "",
    vehicle: "",
    status: "active",
    coverageAreas: [] as string[],
    transportation: "foot" as "foot" | "vehicle",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (dialogRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = dialogRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const dialog = dialogRef.current;
    if (dialog) {
      dialog.addEventListener('scroll', handleScroll);
      return () => dialog.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  // Show scroll hint when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const scrollToTop = () => {
    if (dialogRef.current) {
      dialogRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (dialogRef.current) {
      dialogRef.current.scrollTo({ top: dialogRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToBottom();
      }
    }
  };

  const generateRepresentativeId = async () => {
    return `REP-${Math.floor(Math.random() * 1000000)}`;
  };

  const handleGenerateId = async () => {
    setIsGenerating(true);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    const newId = await generateRepresentativeId();
    setFormData(prev => ({ ...prev, id: newId }));
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched for validation
    const allFields = ['id', 'name', 'email', 'phone', 'licenseNumber', 'vehicle', 'coverageAreas'];
    const newTouched = { ...touched };
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    let isValid = true;
    allFields.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData] as string)) {
        isValid = false;
      }
    });

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    // Use the generated ID or generate a new one if not set
    const representativeId = formData.id || await generateRepresentativeId();
    const newRepresentative = {
      id: representativeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      license_number: formData.licenseNumber,
      emergency_contact: formData.emergencyContact,
      vehicle: formData.vehicle,
      status: formData.status,
      coverage_areas: formData.coverageAreas,
    };

    const { data, error } = await addRepresentative(newRepresentative);
    if (error) {
      console.error('Error adding representative:', error);
      setErrors({ submit: 'Failed to add representative. Please try again.' });
    } else {
      setSuccessMessage(`Representative added successfully! Login credentials: ID: ${representativeId}, Password: changeme123`);
      onAdd(data);
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({
          id: "",
          name: "",
          email: "",
          phone: "",
          address: "",
          licenseNumber: "",
          emergencyContact: "",
          vehicle: "",
          status: "active",
          coverageAreas: [],
          transportation: "foot",
        });
        setTouched({});
        setErrors({});
        setSuccessMessage("");
        onClose();
      }, 3000);
    }
    setIsSubmitting(false);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'id':
        if (!value.trim()) {
          newErrors.id = 'Representative ID is required';
        } else if (!/^REP-\d{6}$/.test(value)) {
          newErrors.id = 'ID must be in format REP-XXXXXX';
        } else {
          delete newErrors.id;
        }
        break;
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'licenseNumber':
        if (formData.transportation === 'vehicle' && !value.trim()) {
          newErrors.licenseNumber = 'License number is required for vehicle transportation';
        } else if (value.trim() && !/^[A-Z]{2}\d{6,9}$/.test(value.trim())) {
          newErrors.licenseNumber = 'License format: 2 letters followed by 6-9 digits';
        } else {
          delete newErrors.licenseNumber;
        }
        break;
      case 'vehicle':
        if (formData.transportation === 'vehicle' && !value.trim()) {
          newErrors.vehicle = 'Vehicle selection is required for vehicle transportation';
        } else {
          delete newErrors.vehicle;
        }
        break;
      case 'coverageAreas':
        if (formData.coverageAreas.length === 0) {
          newErrors.coverageAreas = 'At least one coverage area is required';
        } else {
          delete newErrors.coverageAreas;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate field if it's been touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData] as string);
  };

  const addCoverageArea = () => {
    const newArea = prompt(t("enterAreaName"));
    if (newArea && newArea.trim()) {
      const trimmedArea = newArea.trim();
      if (!formData.coverageAreas.includes(trimmedArea)) {
        setFormData(prev => ({ 
          ...prev, 
          coverageAreas: [...prev.coverageAreas, trimmedArea] 
        }));
        // Clear coverage areas error if we add an area
        if (errors.coverageAreas) {
          setErrors(prev => ({ ...prev, coverageAreas: "" }));
        }
      } else {
        alert("This area is already added!");
      }
    }
  };

  const removeCoverageArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.filter((_, i) => i !== index)
    }));
    // Validate coverage areas after removal
    setTimeout(() => {
      validateField('coverageAreas', '');
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={dialogRef} 
        onKeyDown={handleKeyDown}
        className="max-w-6xl max-h-[95vh] overflow-hidden"
      >
        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-20 rounded-t-[20px]">
          <div 
            className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-150 ease-out rounded-t-[20px]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        
        <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t("addNewRepresentative")}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Create a new team member profile</p>
              </div>
            </div>
            {successMessage && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg animate-in slide-in-from-right duration-300">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-6">
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold">{t("personalInformation")}</span>
                </CardTitle>
                <p className="text-sm text-gray-500 ml-11">Basic personal details and contact information</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    {t("representativeID")} *
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleInputChange("id", e.target.value.toUpperCase())}
                      onBlur={() => handleBlur("id")}
                      placeholder="REP-XXXXXX"
                      maxLength={10}
                      className={`transition-all duration-200 font-mono ${errors.id ? "border-red-500 focus:border-red-500 bg-red-50" : touched.id && !errors.id ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateId}
                      disabled={isGenerating}
                      className="whitespace-nowrap bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {t("generate")}
                        </>
                      )}
                    </Button>
                  </div>
                  {errors.id && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.id}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    {t("fullName")} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter full name (e.g., John Smith)"
                    maxLength={50}
                    className={`transition-all duration-200 capitalize ${errors.name ? "border-red-500 focus:border-red-500 bg-red-50" : touched.name && !errors.name ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                  />
                  {errors.name && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">@</span>
                    </div>
                    {t("emailAddress")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
                    onBlur={() => handleBlur("email")}
                    placeholder="representative@company.com"
                    maxLength={100}
                    className={`transition-all duration-200 ${errors.email ? "border-red-500 focus:border-red-500 bg-red-50" : touched.email && !errors.email ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📞</span>
                    </div>
                    {t("phoneNumber")} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
                      handleInputChange("phone", value);
                    }}
                    onBlur={() => handleBlur("phone")}
                    placeholder="+1 (555) 123-4567"
                    maxLength={20}
                    className={`transition-all duration-200 ${errors.phone ? "border-red-500 focus:border-red-500 bg-red-50" : touched.phone && !errors.phone ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {t("address")}
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    placeholder="Enter complete address (Street, City, State, ZIP)"
                    rows={3}
                    maxLength={200}
                    className="transition-all duration-200 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold">{t("workInformation")}</span>
                </CardTitle>
                <p className="text-sm text-gray-500 ml-11">Professional details and work preferences</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚗</span>
                    </div>
                    {t("transportationOption")}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.transportation === "foot" 
                        ? "border-green-500 bg-green-50 shadow-md" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="transportation"
                        value="foot"
                        checked={formData.transportation === "foot"}
                        onChange={(e) => handleInputChange("transportation", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.transportation === "foot" ? "border-green-500 bg-green-500" : "border-gray-300"
                        }`}>
                          {formData.transportation === "foot" && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-700">🚶 {t("onFoot")}</span>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.transportation === "vehicle" 
                        ? "border-blue-500 bg-blue-50 shadow-md" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="transportation"
                        value="vehicle"
                        checked={formData.transportation === "vehicle"}
                        onChange={(e) => handleInputChange("transportation", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.transportation === "vehicle" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}>
                          {formData.transportation === "vehicle" && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-700">🚛 {t("withVehicle")}</span>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.transportation === "vehicle" && (
                  <div className="space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="license" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">🆔</span>
                        </div>
                        {t("driversLicenseNumber")} *
                      </Label>
                      <Input
                        id="license"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value.toUpperCase())}
                        onBlur={() => handleBlur("licenseNumber")}
                        placeholder="DL123456789"
                        maxLength={12}
                        className={`transition-all duration-200 font-mono ${errors.licenseNumber ? "border-red-500 focus:border-red-500 bg-red-50" : touched.licenseNumber && !errors.licenseNumber ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"}`}
                      />
                      {errors.licenseNumber && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.licenseNumber}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-500" />
                        {t("assignedVehicle")} *
                      </Label>
                      <Select 
                        value={formData.vehicle} 
                        onValueChange={(value) => {
                          handleInputChange("vehicle", value);
                          handleBlur("vehicle");
                        }}
                      >
                        <SelectTrigger className={`transition-all duration-200 ${errors.vehicle ? "border-red-500 focus:border-red-500 bg-red-50" : touched.vehicle && !errors.vehicle ? "border-green-500 bg-green-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}>
                          <SelectValue placeholder={t("selectVehicle")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VH-001">🚐 VH-001 - Ford Transit</SelectItem>
                          <SelectItem value="VH-002">🚛 VH-002 - Mercedes Sprinter</SelectItem>
                          <SelectItem value="VH-003">🚚 VH-003 - Isuzu NPR</SelectItem>
                          <SelectItem value="VH-004">🚐 VH-004 - Ford Transit</SelectItem>
                          <SelectItem value="VH-005">🚛 VH-005 - Chevrolet Express</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vehicle && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.vehicle}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="emergency" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚨</span>
                    </div>
                    {t("emergencyContact")}
                  </Label>
                  <Input
                    id="emergency"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    onBlur={() => handleBlur("emergencyContact")}
                    placeholder="Emergency contact name and phone"
                    maxLength={100}
                    className="transition-all duration-200 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    {t("initialStatus")}
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => {
                      handleInputChange("status", value);
                      handleBlur("status");
                    }}
                  >
                        <SelectTrigger className="transition-all duration-200 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          <SelectValue />
                        </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">🟢 {t("active")}</SelectItem>
                      <SelectItem value="inactive">🔴 {t("inactive")}</SelectItem>
                      <SelectItem value="on-route">🚗 {t("onRoute")}</SelectItem>
                      <SelectItem value="offline">⚫ {t("offline")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographical Coverage Areas */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold">{t("geographicCoverage")}</span>
              </CardTitle>
              <p className="text-sm text-gray-500 ml-11">Define service areas and coverage zones</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📍</span>
                  </div>
                  {t("selectCoverageAreas")} *
                </Label>
                
                {formData.coverageAreas.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    {formData.coverageAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm animate-in slide-in-from-left duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-700">{area}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCoverageArea(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.coverageAreas && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.coverageAreas}
                  </div>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addCoverageArea} 
                  className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("addArea")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("addingRepresentative")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("addRepresentative")}
                </>
              )}
            </Button>
          </div>
          
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-bottom duration-300">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.submit}</span>
            </div>
          )}
          </form>
        </div>
        
        {/* Scroll hint overlay */}
        {showScrollHint && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-30 animate-in fade-in duration-500">
            <div className="bg-white/95 px-6 py-4 rounded-xl shadow-xl border border-gray-200 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="font-medium">Scroll down to see all form sections</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll indicator - only show when at top */}
        {scrollProgress < 10 && !showScrollHint && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="font-medium">Scroll to explore</span>
          </div>
        )}
        
        {/* Scroll navigation buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* Scroll to top - only show when scrolled down */}
          {scrollProgress > 5 && (
            <Button
              onClick={scrollToTop}
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
              title="Scroll to top (Ctrl+Home)"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          )}
          
          {/* Scroll to bottom - only show when not at bottom */}
          {scrollProgress < 95 && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 bg-white/95 hover:bg-white shadow-md border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-top active:scale-95"
              title="Scroll to bottom (Ctrl+End)"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
