"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Crosshair,
  Globe
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LocationPickerProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void
  initialLocation?: { latitude: number; longitude: number; address?: string }
  title?: string
}

export function LocationPicker({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  initialLocation,
  title 
}: LocationPickerProps) {
  const { t, isRTL } = useLanguage()
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(initialLocation || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([33.3152, 44.3661]) // Baghdad default
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      loadMap()
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.latitude, selectedLocation.longitude])
    }
  }, [selectedLocation])

  const loadMap = async () => {
    try {
      // Dynamically import Leaflet
      const L = (await import('leaflet')).default
      
      // Import Leaflet CSS
      await import('leaflet/dist/leaflet.css')

      // Fix default marker icons
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      })

      const SelectedIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      })

      L.Marker.prototype.options.icon = DefaultIcon

      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView(mapCenter, 13)
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map)

        mapInstanceRef.current = map

        // Add click event to map
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng
          
          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current)
          }
          
          // Add new marker
          markerRef.current = L.marker([lat, lng], { icon: SelectedIcon })
            .addTo(map)
          
          // Get address from coordinates (reverse geocoding)
          setIsLoading(true)
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              console.log('Reverse geocoding result:', data)
              let address = ''
              
              // Build address from available data
              const parts = []
              if (data.locality) parts.push(data.locality)
              if (data.principalSubdivision) parts.push(data.principalSubdivision)
              if (data.countryName) parts.push(data.countryName)
              
              if (parts.length > 0) {
                address = parts.join(', ')
              } else {
                address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              }
              
              setSelectedLocation({ latitude: lat, longitude: lng, address })
              
              // Update marker popup with address
              markerRef.current.bindPopup(`
                <div class="text-center">
                  <p class="font-semibold">${isRTL ? "الموقع المحدد" : "Selected Location"}</p>
                  <p class="text-sm text-gray-600">${address}</p>
                  <p class="text-xs text-gray-500">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                </div>
              `).openPopup()
              
              setIsLoading(false)
            })
            .catch((error) => {
              console.error('Reverse geocoding error:', error)
              // Fallback to coordinates if geocoding fails
              const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              setSelectedLocation({ latitude: lat, longitude: lng, address })
              
              markerRef.current.bindPopup(`
                <div class="text-center">
                  <p class="font-semibold">${isRTL ? "الموقع المحدد" : "Selected Location"}</p>
                  <p class="text-sm text-gray-600">${address}</p>
                </div>
              `).openPopup()
              
              setIsLoading(false)
            })
        })

        // Add initial marker if location is provided
        if (selectedLocation) {
          markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude], { icon: SelectedIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center">
                <p class="font-semibold">${isRTL ? "الموقع المحدد" : "Selected Location"}</p>
                <p class="text-sm text-gray-600">${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}</p>
              </div>
            `)
            .openPopup()
        }
      }
    } catch (error) {
      console.error('Error loading map:', error)
      setError('Failed to load map. Please try again.')
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(isRTL ? "الموقع الجغرافي غير مدعوم في هذا المتصفح" : "Geolocation is not supported by this browser.")
      return
    }

    setIsGettingLocation(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMapCenter([latitude, longitude])
        
        // Update map view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15)
          
          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current)
          }
          
          // Add new marker
          const L = require('leaflet')
          const SelectedIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
          })
          
          markerRef.current = L.marker([latitude, longitude], { icon: SelectedIcon })
            .addTo(mapInstanceRef.current)
        }
        
        // Get address from coordinates (reverse geocoding)
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            console.log('Current location geocoding result:', data)
            let address = ''
            
            // Build address from available data
            const parts = []
            if (data.locality) parts.push(data.locality)
            if (data.principalSubdivision) parts.push(data.principalSubdivision)
            if (data.countryName) parts.push(data.countryName)
            
            if (parts.length > 0) {
              address = parts.join(', ')
            } else {
              address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
            
            setSelectedLocation({ latitude, longitude, address })
            
            // Update marker popup with address
            if (markerRef.current) {
              markerRef.current.bindPopup(`
                <div class="text-center">
                  <p class="font-semibold">${isRTL ? "موقعك الحالي" : "Your Current Location"}</p>
                  <p class="text-sm text-gray-600">${address}</p>
                  <p class="text-xs text-gray-500">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                </div>
              `).openPopup()
            }
            
            setIsGettingLocation(false)
          })
          .catch((error) => {
            console.error('Current location geocoding error:', error)
            // Fallback to coordinates if geocoding fails
            const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setSelectedLocation({ latitude, longitude, address })
            
            if (markerRef.current) {
              markerRef.current.bindPopup(`
                <div class="text-center">
                  <p class="font-semibold">${isRTL ? "موقعك الحالي" : "Your Current Location"}</p>
                  <p class="text-sm text-gray-600">${address}</p>
                </div>
              `).openPopup()
            }
            
            setIsGettingLocation(false)
          })
      },
      (error) => {
        console.error("Error getting location:", error)
        let errorMessage = isRTL ? "تعذر الحصول على موقعك. يرجى تحديد الموقع يدوياً." : "Unable to retrieve your location. Please select location manually."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = isRTL ? "تم رفض إذن الموقع. يرجى السماح بالوصول إلى الموقع." : "Location access denied. Please allow location access."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = isRTL ? "معلومات الموقع غير متاحة." : "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = isRTL ? "انتهت مهلة طلب الموقع." : "Location request timed out."
            break
        }
        
        setError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const latitude = parseFloat(result.lat)
        const longitude = parseFloat(result.lon)
        
        setSelectedLocation({ 
          latitude, 
          longitude, 
          address: result.display_name 
        })
        setMapCenter([latitude, longitude])
        
        // Update map view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15)
          
          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current)
          }
          
          // Add new marker
          const L = require('leaflet')
          const SelectedIcon = L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
          })
          
          markerRef.current = L.marker([latitude, longitude], { icon: SelectedIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="text-center">
                <p class="font-semibold">${isRTL ? "الموقع المحدد" : "Selected Location"}</p>
                <p class="text-sm text-gray-600">${result.display_name}</p>
                <p class="text-xs text-gray-500">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
              </div>
            `)
            .openPopup()
        }
      } else {
        setError(isRTL ? "لم يتم العثور على الموقع المطلوب" : "Location not found")
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setError(isRTL ? "خطأ في البحث عن الموقع" : "Error searching for location")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      onClose()
    }
  }

  const handleClear = () => {
    setSelectedLocation(null)
    setSearchQuery("")
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title || (isRTL ? "تحديد الموقع" : "Select Location")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isRTL ? "البحث عن عنوان أو مكان..." : "Search for address or place..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={searchLocation}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isRTL ? "بحث" : "Search"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {isRTL ? "موقعي" : "My Location"}
            </Button>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef} 
              className="h-96 w-full rounded-lg border"
              style={{ minHeight: '400px' }}
            />
            
            {/* Map Instructions */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Crosshair className="h-4 w-4" />
                <span>{isRTL ? "انقر على الخريطة لتحديد الموقع" : "Click on the map to select location"}</span>
              </div>
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-green-800">
                        {isRTL ? "الموقع المحدد" : "Selected Location"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </div>
                      {selectedLocation.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedLocation.address}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {isRTL ? "كيفية تحديد الموقع:" : "How to select location:"}
                </p>
                <ul className="space-y-1 text-blue-700">
                  <li>• {isRTL ? "انقر على الخريطة لتحديد الموقع المطلوب" : "Click on the map to select desired location"}</li>
                  <li>• {isRTL ? "استخدم البحث للعثور على عنوان محدد" : "Use search to find a specific address"}</li>
                  <li>• {isRTL ? "استخدم زر 'موقعي' للحصول على موقعك الحالي" : "Use 'My Location' button to get your current location"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isRTL ? "إلغاء" : "Cancel"}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isRTL ? "تأكيد الموقع" : "Confirm Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

