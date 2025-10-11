'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  TruckIcon,
  Save,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { updateVehicle, UpdateVehicleData } from '@/lib/vehicle';
import type { Vehicle, VehicleFormData, VehicleType, VehicleStatus } from '@/types/vehicle';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (vehicle: Vehicle) => void;
  vehicle: Vehicle | null;
}

export function EditVehicleModal({ isOpen, onClose, onUpdate, vehicle }: EditVehicleModalProps) {
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
    fuel_consumption: 0
  });

  // Initialize form data when vehicle changes
  useEffect(() => {
    if (vehicle) {
      console.log('Initializing form data for vehicle:', vehicle);
      setFormData({
        vehicle_id: vehicle.vehicle_id || '',
        license_plate: vehicle.license_plate || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vehicle_type: vehicle.vehicle_type || 'Truck',
        engine_type: vehicle.engine_type || 'Diesel',
        fuel_type: vehicle.fuel_type || 'Diesel',
        capacity_kg: vehicle.capacity_kg || 1000,
        fuel_capacity_l: vehicle.fuel_capacity_l || 80,
        status: vehicle.status || 'active',
        fuel_level_percent: vehicle.fuel_level_percent || 85,
        mileage_km: vehicle.mileage_km || 0,
        current_location: vehicle.current_location || '',
        insurance_company: vehicle.insurance_company || '',
        purchase_price: vehicle.purchase_price || 0,
        service_interval_km: vehicle.service_interval_km || 10000,
        speed_limit_kmh: vehicle.speed_limit_kmh || 80,
        color: vehicle.color || '',
        fuel_consumption: vehicle.fuel_consumption || 0
      });
    }
  }, [vehicle]);

  const vehicleTypes: { value: VehicleType; label: string; icon: React.ReactNode }[] = [
    { value: 'Truck', label: 'Truck', icon: <TruckIcon className="h-4 w-4" /> },
    { value: 'Van', label: 'Van', icon: <Car className="h-4 w-4" /> },
    { value: 'Motorcycle', label: 'Motorcycle', icon: <Bike className="h-4 w-4" /> },
    { value: 'Bus', label: 'Bus', icon: <Bus className="h-4 w-4" /> }
  ];

  const statusOptions: { value: VehicleStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  const engineTypes = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const fuelTypes = ['Diesel', 'Gasoline', 'Electric', 'LPG', 'CNG'];

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
      newErrors.year = 'Please enter a valid year';
    }

    if (formData.capacity_kg <= 0) {
      newErrors.capacity_kg = 'Capacity must be greater than 0';
    }

    if (formData.fuel_capacity_l <= 0) {
      newErrors.fuel_capacity_l = 'Fuel capacity must be greater than 0';
    }

    if (formData.fuel_level_percent < 0 || formData.fuel_level_percent > 100) {
      newErrors.fuel_level_percent = 'Fuel level must be between 0 and 100';
    }

    if (formData.mileage_km < 0) {
      newErrors.mileage_km = 'Mileage cannot be negative';
    }

    if (formData.purchase_price < 0) {
      newErrors.purchase_price = 'Purchase price cannot be negative';
    }

    if (formData.service_interval_km <= 0) {
      newErrors.service_interval_km = 'Service interval must be greater than 0';
    }

    if (formData.speed_limit_kmh <= 0) {
      newErrors.speed_limit_kmh = 'Speed limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!validateForm() || !vehicle) {
      console.log('Form validation failed or no vehicle selected');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const updateData: UpdateVehicleData = {
        id: vehicle.id,
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

      // Here you would call your update API
      // const updatedVehicle = await updateVehicle(vehicle.id, updateData);
      
      // For now, create a mock updated vehicle
      const updatedVehicle: Vehicle = {
        ...vehicle,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      console.log('Calling onUpdate with:', updatedVehicle);
      onUpdate(updatedVehicle);
      onClose();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setErrors({ submit: 'Failed to update vehicle. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!vehicle) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
              <p className="text-gray-600">Update vehicle information</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Update the vehicle information below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {errors.submit && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_id">Vehicle ID *</Label>
                <Input
                  id="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                  className={errors.vehicle_id ? 'border-red-500' : ''}
                />
                {errors.vehicle_id && <p className="text-red-500 text-sm mt-1">{errors.vehicle_id}</p>}
              </div>

              <div>
                <Label htmlFor="license_plate">License Plate *</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => handleInputChange('license_plate', e.target.value)}
                  className={errors.license_plate ? 'border-red-500' : ''}
                />
                {errors.license_plate && <p className="text-red-500 text-sm mt-1">{errors.license_plate}</p>}
              </div>

              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className={errors.make ? 'border-red-500' : ''}
                />
                {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) => handleInputChange('vehicle_type', value)}
                >
                  <SelectTrigger className={errors.vehicle_type ? 'border-red-500' : ''}>
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
                {errors.vehicle_type && <p className="text-red-500 text-sm mt-1">{errors.vehicle_type}</p>}
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engine_type">Engine Type</Label>
                <Select
                  value={formData.engine_type}
                  onValueChange={(value) => handleInputChange('engine_type', value)}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => handleInputChange('fuel_type', value)}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="capacity_kg">Capacity (kg) *</Label>
                <Input
                  id="capacity_kg"
                  type="number"
                  value={formData.capacity_kg}
                  onChange={(e) => handleInputChange('capacity_kg', parseInt(e.target.value))}
                  className={errors.capacity_kg ? 'border-red-500' : ''}
                />
                {errors.capacity_kg && <p className="text-red-500 text-sm mt-1">{errors.capacity_kg}</p>}
              </div>

              <div>
                <Label htmlFor="fuel_capacity_l">Fuel Capacity (L) *</Label>
                <Input
                  id="fuel_capacity_l"
                  type="number"
                  value={formData.fuel_capacity_l}
                  onChange={(e) => handleInputChange('fuel_capacity_l', parseInt(e.target.value))}
                  className={errors.fuel_capacity_l ? 'border-red-500' : ''}
                />
                {errors.fuel_capacity_l && <p className="text-red-500 text-sm mt-1">{errors.fuel_capacity_l}</p>}
              </div>

              <div>
                <Label htmlFor="fuel_level_percent">Current Fuel Level (%) *</Label>
                <Input
                  id="fuel_level_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuel_level_percent}
                  onChange={(e) => handleInputChange('fuel_level_percent', parseInt(e.target.value))}
                  className={errors.fuel_level_percent ? 'border-red-500' : ''}
                />
                {errors.fuel_level_percent && <p className="text-red-500 text-sm mt-1">{errors.fuel_level_percent}</p>}
              </div>

              <div>
                <Label htmlFor="mileage_km">Current Mileage (km) *</Label>
                <Input
                  id="mileage_km"
                  type="number"
                  value={formData.mileage_km}
                  onChange={(e) => handleInputChange('mileage_km', parseInt(e.target.value))}
                  className={errors.mileage_km ? 'border-red-500' : ''}
                />
                {errors.mileage_km && <p className="text-red-500 text-sm mt-1">{errors.mileage_km}</p>}
              </div>

              <div>
                <Label htmlFor="fuel_consumption">Fuel Consumption (L/100km)</Label>
                <Input
                  id="fuel_consumption"
                  type="number"
                  step="0.1"
                  value={formData.fuel_consumption}
                  onChange={(e) => handleInputChange('fuel_consumption', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="speed_limit_kmh">Speed Limit (km/h) *</Label>
                <Input
                  id="speed_limit_kmh"
                  type="number"
                  value={formData.speed_limit_kmh}
                  onChange={(e) => handleInputChange('speed_limit_kmh', parseInt(e.target.value))}
                  className={errors.speed_limit_kmh ? 'border-red-500' : ''}
                />
                {errors.speed_limit_kmh && <p className="text-red-500 text-sm mt-1">{errors.speed_limit_kmh}</p>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_location">Current Location</Label>
                <Input
                  id="current_location"
                  value={formData.current_location}
                  onChange={(e) => handleInputChange('current_location', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="insurance_company">Insurance Company</Label>
                <Input
                  id="insurance_company"
                  value={formData.insurance_company}
                  onChange={(e) => handleInputChange('insurance_company', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="purchase_price">Purchase Price (ر.س)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                  className={errors.purchase_price ? 'border-red-500' : ''}
                />
                {errors.purchase_price && <p className="text-red-500 text-sm mt-1">{errors.purchase_price}</p>}
              </div>

              <div>
                <Label htmlFor="service_interval_km">Service Interval (km) *</Label>
                <Input
                  id="service_interval_km"
                  type="number"
                  value={formData.service_interval_km}
                  onChange={(e) => handleInputChange('service_interval_km', parseInt(e.target.value))}
                  className={errors.service_interval_km ? 'border-red-500' : ''}
                />
                {errors.service_interval_km && <p className="text-red-500 text-sm mt-1">{errors.service_interval_km}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
