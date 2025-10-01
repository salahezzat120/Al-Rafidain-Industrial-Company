// Quick fix: Add map functionality to existing warehouse form
// Replace the warehouse form section in warehouse-tab.tsx with this:

import { Map, MapPin, Navigation } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { toast } from '@/hooks/use-toast';

// Add these state variables to the WarehouseTab component:
const [showLocationPicker, setShowLocationPicker] = useState(false);
const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);

// Add these functions to the WarehouseTab component:
const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
  setSelectedLocation(location);
  setWarehouseForm(prev => ({
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
  setWarehouseForm(prev => ({
    ...prev,
    latitude: undefined,
    longitude: undefined,
    address: ''
  }));
};

// Replace the warehouse form section with this:
/*
<div className="space-y-4">
  <div>
    <Label htmlFor="warehouse_name">Warehouse Name</Label>
    <Input
      id="warehouse_name"
      value={warehouseForm.warehouse_name}
      onChange={(e) => setWarehouseForm(prev => ({ ...prev, warehouse_name: e.target.value }))}
      placeholder="Enter warehouse name"
    />
  </div>
  
  <div>
    <Label htmlFor="location">Location</Label>
    <Input
      id="location"
      value={warehouseForm.location}
      onChange={(e) => setWarehouseForm(prev => ({ ...prev, location: e.target.value }))}
      placeholder="Enter warehouse location"
    />
  </div>

  // Add these new fields:
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <MapPin className="h-4 w-4" />
      Location Information
    </Label>
    
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowLocationPicker(true)}
        className="h-10"
      >
        <Map className="h-4 w-4 mr-2" />
        Select on Map
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={getCurrentLocation}
        className="h-10"
      >
        <Navigation className="h-4 w-4 mr-2" />
        My Location
      </Button>
    </div>

    {selectedLocation && (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Selected Location:</p>
            <p className="text-sm text-green-700">{selectedLocation.address}</p>
            <p className="text-xs text-green-600">
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearLocation}
            className="text-red-600 hover:text-red-700"
          >
            Clear
          </Button>
        </div>
      </div>
    )}
  </div>
</div>

// Add this at the end of the component, before the closing </div>:
<LocationPicker
  isOpen={showLocationPicker}
  onClose={() => setShowLocationPicker(false)}
  onLocationSelect={handleLocationSelect}
  initialLocation={selectedLocation}
  title="Select Warehouse Location"
/>
*/
