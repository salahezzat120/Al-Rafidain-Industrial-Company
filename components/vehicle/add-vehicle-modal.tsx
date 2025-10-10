'use client';

import React, { useState } from 'react';
import { ScrollableDialog } from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown,
  Car,
  Bike,
  Bus,
  TruckIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { createVehicle, CreateVehicleData } from '@/lib/vehicle';
import type { VehicleFormData, VehicleType, VehicleStatus } from '@/types/vehicle';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (vehicle: any) => void;
}

export function AddVehicleModal({ isOpen, onClose, onAdd }: AddVehicleModalProps) {
  const { t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_id: '',
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'Truck',
    engine_type: 'Diesel',
    fuel_type: 'Diesel',
    capacity_kg: 1000,
    fuel_capacity_l: 80,
    status: 'active',
    fuel_level_percent: 85,
    mileage_km: 0,
    current_location: '',
    insurance_company: '',
    purchase_price: 0,
    service_interval_km: 10000,
    speed_limit_kmh: 80,
    color: '',
    fuel_consumption: 8.0
  });

  const vehicleTypes: { value: VehicleType; label: string; icon: React.ReactNode }[] = [
    { value: 'Truck', label: 'Truck', icon: <Truck className="h-4 w-4" /> },
    { value: 'Van', label: 'Van', icon: <TruckIcon className="h-4 w-4" /> },
    { value: 'Car', label: 'Car', icon: <Car className="h-4 w-4" /> },
    { value: 'Motorcycle', label: 'Motorcycle', icon: <Bike className="h-4 w-4" /> },
    { value: 'Bus', label: 'Bus', icon: <Bus className="h-4 w-4" /> },
    { value: 'Trailer', label: 'Trailer', icon: <Truck className="h-4 w-4" /> }
  ];

  const engineTypes = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const fuelTypes = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const statuses: { value: VehicleStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'retired', label: 'Retired' }
  ];

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id.trim()) {
      newErrors.vehicle_id = 'Vehicle ID is required';
    }
    if (!formData.license_plate.trim()) {
      newErrors.license_plate = 'License plate is required';
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year';
    }
    if (formData.capacity_kg < 0) {
      newErrors.capacity_kg = 'Capacity must be positive';
    }
    if (formData.fuel_capacity_l < 0) {
      newErrors.fuel_capacity_l = 'Fuel capacity must be positive';
    }
    if (formData.fuel_level_percent < 0 || formData.fuel_level_percent > 100) {
      newErrors.fuel_level_percent = 'Fuel level must be between 0-100%';
    }
    if (formData.mileage_km < 0) {
      newErrors.mileage_km = 'Mileage must be positive';
    }
    if (formData.purchase_price < 0) {
      newErrors.purchase_price = 'Purchase price must be positive';
    }
    if (formData.service_interval_km < 0) {
      newErrors.service_interval_km = 'Service interval must be positive';
    }
    if (formData.speed_limit_kmh < 0) {
      newErrors.speed_limit_kmh = 'Speed limit must be positive';
    }
    if (formData.fuel_consumption < 0) {
      newErrors.fuel_consumption = 'Fuel consumption must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const vehicleData: CreateVehicleData = {
        vehicle_id: formData.vehicle_id,
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        vehicle_type: formData.vehicle_type,
        engine_type: formData.engine_type,
        fuel_type: formData.fuel_type,
        capacity_kg: formData.capacity_kg,
        fuel_capacity_l: formData.fuel_capacity_l,
        status: formData.status,
        fuel_level_percent: formData.fuel_level_percent,
        mileage_km: formData.mileage_km,
        current_location: formData.current_location,
        insurance_company: formData.insurance_company,
        purchase_price: formData.purchase_price,
        service_interval_km: formData.service_interval_km,
        speed_limit_kmh: formData.speed_limit_kmh,
        color: formData.color,
        fuel_consumption: formData.fuel_consumption
      };

      const newVehicle = await createVehicle(vehicleData);
      onAdd(newVehicle);
      onClose();
      
      // Reset form
      setFormData({
        vehicle_id: '',
        license_plate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: 'Truck',
        engine_type: 'Diesel',
        fuel_type: 'Diesel',
        capacity_kg: 1000,
        fuel_capacity_l: 80,
        status: 'active',
        fuel_level_percent: 85,
        mileage_km: 0,
        current_location: '',
        insurance_company: '',
        purchase_price: 0,
        service_interval_km: 10000,
        speed_limit_kmh: 80,
        color: '',
        fuel_consumption: 8.0
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      setErrors({ submit: 'Failed to create vehicle. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
    if (scrollContainer) {
      if (direction === 'down') {
        scrollContainer.scrollBy({ top: 300, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ top: -300, behavior: 'smooth' });
      }
    }
  };

  return (
    <ScrollableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vehicle"
      description="Add a new vehicle to the company fleet"
      maxWidth="max-w-6xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </Button>
        </div>
      }
    >
      <div className="space-y-8 py-4 overflow-y-auto flex-1 max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Vehicle Information</h2>
            <p className="text-base text-muted-foreground mt-2">Enter the vehicle details below</p>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id" className="text-sm font-medium text-gray-700">
                Vehicle ID *
              </Label>
              <Input
                id="vehicle_id"
                value={formData.vehicle_id}
                onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                placeholder="e.g., ABC-123"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.vehicle_id && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.vehicle_id}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate" className="text-sm font-medium text-gray-700">
                License Plate *
              </Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                onChange={(e) => handleInputChange('license_plate', e.target.value)}
                placeholder="License plate number"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.license_plate && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.license_plate}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="make" className="text-sm font-medium text-gray-700">
                Make *
              </Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                placeholder="e.g., Toyota"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.make && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.make}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                Model *
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., Hilux"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.model && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.model}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                Year *
              </Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.year && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.year}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_type" className="text-sm font-medium text-gray-700">
                Vehicle Type *
              </Label>
              <Select value={formData.vehicle_type} onValueChange={(value) => handleInputChange('vehicle_type', value as VehicleType)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="engine_type" className="text-sm font-medium text-gray-700">
                Engine Type
              </Label>
              <Select value={formData.engine_type} onValueChange={(value) => handleInputChange('engine_type', value)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {engineTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type" className="text-sm font-medium text-gray-700">
                Fuel Type
              </Label>
              <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange('fuel_type', value)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity_kg" className="text-sm font-medium text-gray-700">
                Capacity (kg)
              </Label>
              <Input
                id="capacity_kg"
                type="number"
                value={formData.capacity_kg}
                onChange={(e) => handleInputChange('capacity_kg', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.capacity_kg && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.capacity_kg}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_capacity_l" className="text-sm font-medium text-gray-700">
                Fuel Capacity (L)
              </Label>
              <Input
                id="fuel_capacity_l"
                type="number"
                value={formData.fuel_capacity_l}
                onChange={(e) => handleInputChange('fuel_capacity_l', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.fuel_capacity_l && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.fuel_capacity_l}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_interval_km" className="text-sm font-medium text-gray-700">
                Service Interval (km)
              </Label>
              <Input
                id="service_interval_km"
                type="number"
                value={formData.service_interval_km}
                onChange={(e) => handleInputChange('service_interval_km', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.service_interval_km && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.service_interval_km}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="speed_limit_kmh" className="text-sm font-medium text-gray-700">
                Speed Limit (km/h)
              </Label>
              <Input
                id="speed_limit_kmh"
                type="number"
                value={formData.speed_limit_kmh}
                onChange={(e) => handleInputChange('speed_limit_kmh', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.speed_limit_kmh && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.speed_limit_kmh}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-medium text-gray-700">
                Color
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="e.g., White, Blue, Red"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_consumption" className="text-sm font-medium text-gray-700">
                Fuel Consumption (L/100km)
              </Label>
              <Input
                id="fuel_consumption"
                type="number"
                step="0.1"
                value={formData.fuel_consumption}
                onChange={(e) => handleInputChange('fuel_consumption', parseFloat(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.fuel_consumption && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.fuel_consumption}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Status Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as VehicleStatus)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_level_percent" className="text-sm font-medium text-gray-700">
                Fuel Level (%)
              </Label>
              <Input
                id="fuel_level_percent"
                type="number"
                min="0"
                max="100"
                value={formData.fuel_level_percent}
                onChange={(e) => handleInputChange('fuel_level_percent', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.fuel_level_percent && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.fuel_level_percent}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage_km" className="text-sm font-medium text-gray-700">
                Mileage (km)
              </Label>
              <Input
                id="mileage_km"
                type="number"
                value={formData.mileage_km}
                onChange={(e) => handleInputChange('mileage_km', parseInt(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.mileage_km && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.mileage_km}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_location" className="text-sm font-medium text-gray-700">
                Current Location
              </Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => handleInputChange('current_location', e.target.value)}
                placeholder="Current location"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="insurance_company" className="text-sm font-medium text-gray-700">
                Insurance Company
              </Label>
              <Input
                id="insurance_company"
                value={formData.insurance_company}
                onChange={(e) => handleInputChange('insurance_company', e.target.value)}
                placeholder="Insurance company"
                className="h-11 border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-sm font-medium text-gray-700">
                Purchase Price
              </Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                className="h-11 border-gray-300 focus:border-blue-500"
              />
              {errors.purchase_price && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.purchase_price}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ScrollableDialog>
  );
}



