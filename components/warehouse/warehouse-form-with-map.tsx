'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Map, MapPin, Navigation, Building2, User, Phone, Mail, Package, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { useLanguage } from '@/contexts/language-context';
import { toast } from '@/hooks/use-toast';
import type { CreateWarehouseData, Warehouse } from '@/types/warehouse';

interface WarehouseFormWithMapProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateWarehouseData) => Promise<void>;
  editingWarehouse?: Warehouse | null;
}

export function WarehouseFormWithMap({ isOpen, onClose, onSave, editingWarehouse }: WarehouseFormWithMapProps) {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState<CreateWarehouseData>({
    warehouse_name: '',
    warehouse_name_ar: '',
    location: '',
    location_ar: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    responsible_person: '',
    responsible_person_ar: '',
    warehouse_type: 'DISTRIBUTION',
    capacity: 0,
    contact_phone: '',
    contact_email: ''
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Scroll functionality state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingWarehouse) {
      setFormData({
        warehouse_name: editingWarehouse.warehouse_name || '',
        warehouse_name_ar: editingWarehouse.warehouse_name_ar || '',
        location: editingWarehouse.location || '',
        location_ar: editingWarehouse.location_ar || '',
        address: editingWarehouse.address || '',
        latitude: editingWarehouse.latitude,
        longitude: editingWarehouse.longitude,
        responsible_person: editingWarehouse.responsible_person || '',
        responsible_person_ar: editingWarehouse.responsible_person_ar || '',
        warehouse_type: editingWarehouse.warehouse_type || 'DISTRIBUTION',
        capacity: editingWarehouse.capacity || 0,
        contact_phone: editingWarehouse.contact_phone || '',
        contact_email: editingWarehouse.contact_email || ''
      });
      
      if (editingWarehouse.latitude && editingWarehouse.longitude) {
        setSelectedLocation({
          latitude: editingWarehouse.latitude,
          longitude: editingWarehouse.longitude,
          address: editingWarehouse.address
        });
      }
    } else {
      // Reset form for new warehouse
      setFormData({
        warehouse_name: '',
        warehouse_name_ar: '',
        location: '',
        location_ar: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        responsible_person: '',
        responsible_person_ar: '',
        warehouse_type: 'DISTRIBUTION',
        capacity: 0,
        contact_phone: '',
        contact_email: ''
      });
      setSelectedLocation(null);
    }
  }, [editingWarehouse, isOpen]);

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

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || prev.address
    }));
    setShowLocationPicker(false);
    toast({
      title: isRTL ? "نجح" : "Success",
      description: isRTL ? "تم تحديد الموقع بنجاح" : "Location selected successfully!",
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "المتصفح لا يدعم تحديد الموقع" : "Browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            const address = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '');
            handleLocationSelect({ address, latitude, longitude });
          })
          .catch(() => {
            handleLocationSelect({ 
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 
              latitude, 
              longitude 
            });
          });
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = isRTL ? "تعذر الحصول على موقعك. يرجى تحديد الموقع يدوياً." : "Unable to retrieve your location. Please select location manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = isRTL ? "تم رفض إذن الموقع. يرجى السماح بالوصول إلى الموقع." : "Location access denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = isRTL ? "معلومات الموقع غير متاحة." : "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = isRTL ? "انتهت مهلة طلب الموقع." : "Location request timed out.";
            break;
        }
        
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setFormData(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      address: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate that location is selected via map
    if (!selectedLocation || !formData.latitude || !formData.longitude) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى تحديد الموقع على الخريطة" : "Please select location on map",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حفظ المستودع" : "Failed to save warehouse",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          ref={dialogRef} 
          onKeyDown={handleKeyDown}
          className="max-w-6xl max-h-[95vh] overflow-hidden"
        >
          {/* Scroll progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-30 rounded-t-[20px]">
            <div 
              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-150 ease-out rounded-t-[20px]"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          
          <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {editingWarehouse ? (isRTL ? 'تعديل المستودع' : 'Edit Warehouse') : (isRTL ? 'إضافة مستودع جديد' : 'Add New Warehouse')}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {editingWarehouse 
                    ? (isRTL ? 'تحديث معلومات المستودع' : 'Update warehouse information')
                    : (isRTL ? 'إضافة مستودع جديد إلى النظام' : 'Add a new warehouse to the system')
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-6">
            <form onSubmit={handleSubmit} className="space-y-6 py-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'أدخل تفاصيل المستودع الأساسية' : 'Enter basic warehouse details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {isRTL ? 'اسم المستودع' : 'Warehouse Name'} 
                      <Badge variant="destructive" className="text-xs">*</Badge>
                    </Label>
                    <Input
                      id="warehouse_name"
                      value={formData.warehouse_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, warehouse_name: e.target.value }))}
                      placeholder={isRTL ? 'أدخل اسم المستودع' : 'Enter warehouse name'}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse_name_ar" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {isRTL ? 'اسم المستودع (عربي)' : 'Warehouse Name (Arabic)'}
                    </Label>
                    <Input
                      id="warehouse_name_ar"
                      value={formData.warehouse_name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, warehouse_name_ar: e.target.value }))}
                      placeholder={isRTL ? 'أدخل اسم المستودع بالعربية' : 'Enter warehouse name in Arabic'}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                  {isRTL ? 'معلومات الموقع' : 'Location Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'حدد موقع المستودع على الخريطة فقط' : 'Select warehouse location on map only'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Map Selection Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    {isRTL ? 'اختيار الموقع على الخريطة' : 'Select Location on Map'}
                    <Badge variant="destructive" className="text-xs ml-2">*</Badge>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLocationPicker(true)}
                      className="h-12 flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <Map className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">{isRTL ? "اختر على الخريطة" : "Select on Map"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="h-12 flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <Navigation className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{isRTL ? "موقعي الحالي" : "My Location"}</span>
                    </Button>
                  </div>
                </div>

                {/* Selected Location Display */}
                {selectedLocation ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-800 mb-1">
                            {isRTL ? "الموقع المحدد:" : "Selected Location:"}
                          </p>
                          <p className="text-sm text-green-700 mb-1">{selectedLocation.address}</p>
                          <p className="text-xs text-green-600 font-mono">
                            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearLocation}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isRTL ? "مسح" : "Clear"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-800">
                          {isRTL ? "لم يتم تحديد الموقع بعد" : "No location selected yet"}
                        </p>
                        <p className="text-sm text-orange-700">
                          {isRTL ? "يرجى تحديد موقع المستودع على الخريطة" : "Please select warehouse location on map"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Management Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  {isRTL ? 'معلومات الإدارة' : 'Management Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'حدد الشخص المسؤول وسعة المستودع' : 'Set responsible person and warehouse capacity'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_person" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isRTL ? 'الشخص المسؤول' : 'Responsible Person'}
                    </Label>
                    <Input
                      id="responsible_person"
                      value={formData.responsible_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsible_person: e.target.value }))}
                      placeholder={isRTL ? 'أدخل اسم الشخص المسؤول' : 'Enter responsible person name'}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsible_person_ar" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isRTL ? 'الشخص المسؤول (عربي)' : 'Responsible Person (Arabic)'}
                    </Label>
                    <Input
                      id="responsible_person_ar"
                      value={formData.responsible_person_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsible_person_ar: e.target.value }))}
                      placeholder={isRTL ? 'أدخل اسم الشخص المسؤول بالعربية' : 'Enter responsible person name in Arabic'}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {isRTL ? 'السعة' : 'Capacity'}
                    <Badge variant="outline" className="text-xs">
                      {isRTL ? 'وحدات' : 'units'}
                    </Badge>
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    placeholder={isRTL ? 'أدخل سعة المستودع' : 'Enter warehouse capacity'}
                    min="0"
                    step="0.01"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-orange-600" />
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'أدخل معلومات الاتصال للمستودع' : 'Enter warehouse contact details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    </Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto h-11"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {editingWarehouse ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
                  </div>
                )}
              </Button>
            </DialogFooter>
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
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 backdrop-blur-sm animate-in fade-in duration-300 z-30">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="font-medium">Scroll to explore</span>
            </div>
          )}
          
          {/* Scroll navigation buttons */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-40">
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

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation}
        title={isRTL ? 'اختر موقع المستودع' : 'Select Warehouse Location'}
      />
    </>
  );
}
