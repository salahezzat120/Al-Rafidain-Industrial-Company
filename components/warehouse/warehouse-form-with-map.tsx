'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Map, MapPin, Navigation, Building2, User, Phone, Mail, Package, AlertCircle } from 'lucide-react';
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
