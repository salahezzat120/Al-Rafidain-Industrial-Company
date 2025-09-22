"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, X, Check, Navigation } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface MapPickerProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void
  initialLocation?: { address: string; latitude: number; longitude: number } | null
}

export function MapPicker({ isOpen, onClose, onLocationSelect, initialLocation }: MapPickerProps) {
  const { t, isRTL } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude: number
    longitude: number
  } | null>(initialLocation || null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 24.7136, lng: 46.6753 }) // Default to Riyadh
  const [mapZoom, setMapZoom] = useState(13)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)

  // Function to clear all markers from the map
  const clearAllMarkers = useCallback((mapInstance: any) => {
    if (mapInstance) {
      mapInstance.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L?.Marker) {
          mapInstance.removeLayer(layer)
        }
      })
    }
  }, [])

  // Load Leaflet dynamically
  useEffect(() => {
    if (isOpen && !map && mapRef.current) {
      const initializeMap = async () => {
        try {
          // Check if Leaflet is already loaded
          if (!(window as any).L) {
            // Load CSS
            const cssLink = document.createElement('link')
            cssLink.rel = 'stylesheet'
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
            cssLink.crossOrigin = ''
            document.head.appendChild(cssLink)

            // Load JS
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
            script.crossOrigin = ''
            
            await new Promise((resolve, reject) => {
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          }

          const L = (window as any).L
          
          if (mapRef.current && !map) {
            // Check if container already has a map
            if (mapRef.current._leaflet_id) {
              return
            }

            // Ensure container has proper dimensions
            if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
              console.warn('Map container has no dimensions, retrying...')
              setTimeout(() => initializeMap(), 200)
              return
            }

            const newMap = L.map(mapRef.current, {
              center: [mapCenter.lat, mapCenter.lng],
              zoom: mapZoom,
              zoomControl: true,
              preferCanvas: false
            })
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
              subdomains: ['a', 'b', 'c']
            }).addTo(newMap)

            // Add initial marker if location is provided
            if (initialLocation) {
              const newMarker = L.marker([initialLocation.latitude, initialLocation.longitude])
                .addTo(newMap)
                .bindPopup(initialLocation.address)
              setMarker(newMarker)
              newMap.setView([initialLocation.latitude, initialLocation.longitude], 15)
            }

            // Add click event to map
            newMap.on('click', (e: any) => {
              const { lat, lng } = e.latlng
              console.log('Map clicked at:', lat, lng)
              
              // Clear all existing markers from the map
              clearAllMarkers(newMap)
              setMarker(null)

              // Add new marker
              const newMarker = L.marker([lat, lng]).addTo(newMap)
              
              // Reverse geocoding to get address
              setIsLoading(true)
              fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
                .then(response => response.json())
                .then(data => {
                  console.log('Reverse geocoding result:', data)
                  const address = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '')
                  newMarker.bindPopup(address).openPopup()
                  setSelectedLocation({ address, latitude: lat, longitude: lng })
                  setMarker(newMarker)
                  console.log('Location selected:', { address, latitude: lat, longitude: lng })
                })
                .catch((error) => {
                  console.error('Reverse geocoding error:', error)
                  const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                  newMarker.bindPopup(address).openPopup()
                  setSelectedLocation({ address, latitude: lat, longitude: lng })
                  setMarker(newMarker)
                })
                .finally(() => {
                  setIsLoading(false)
                })
            })

            setMap(newMap)
            console.log('Map initialized successfully')
          }
        } catch (error) {
          console.error('Error initializing map:', error)
        }
      }

      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap()
      }, 100)
    }

    return () => {
      if (map) {
        map.remove()
        setMap(null)
        setMarker(null)
      }
    }
  }, [isOpen, clearAllMarkers])

  // Update map center when initial location changes
  useEffect(() => {
    if (initialLocation && map) {
      map.setView([initialLocation.latitude, initialLocation.longitude], 15)
    }
  }, [initialLocation, map])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('No search query provided')
      return
    }

    if (!map) {
      console.log('Map not initialized yet')
      return
    }

    setIsLoading(true)
    try {
      console.log('Searching for:', searchQuery)
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      )
      const data = await response.json()
      
      console.log('Search results:', data)
      
      if (data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)
        
        console.log('Found location:', lat, lon, result.display_name)
        
        // Clear all existing markers from the map
        clearAllMarkers(map)
        setMarker(null)

        // Add new marker
        const L = (window as any).L
        const newMarker = L.marker([lat, lon]).addTo(map)
        newMarker.bindPopup(result.display_name).openPopup()
        setMarker(newMarker)
        setSelectedLocation({ 
          address: result.display_name, 
          latitude: lat, 
          longitude: lon 
        })
        
        // Center map on result
        map.setView([lat, lon], 15)
        console.log('Map centered on search result')
      } else {
        // Show error message
        console.log('No results found for:', searchQuery)
        alert(isRTL ? 'لم يتم العثور على نتائج' : 'No results found')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert(isRTL ? 'خطأ في البحث' : 'Search error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // Clear all existing markers from the map
          if (map) {
            clearAllMarkers(map)
            setMarker(null)

            // Add new marker
            const L = (window as any).L
            const newMarker = L.marker([latitude, longitude]).addTo(map)
            
            // Reverse geocoding to get address
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
              .then(response => response.json())
              .then(data => {
                const address = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '')
                newMarker.bindPopup(address).openPopup()
                setSelectedLocation({ address, latitude, longitude })
                setMarker(newMarker)
                map.setView([latitude, longitude], 15)
              })
              .catch(() => {
                const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                newMarker.bindPopup(address).openPopup()
                setSelectedLocation({ address, latitude, longitude })
                setMarker(newMarker)
                map.setView([latitude, longitude], 15)
              })
          }
        },
        () => {
          console.error('Failed to get current location')
        }
      )
    }
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isRTL ? "اختر الموقع على الخريطة" : "Select Location on Map"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">{isRTL ? "البحث عن موقع" : "Search for location"}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "ابحث عن عنوان أو مكان..." : "Search for address or place..."}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={handleCurrentLocation} variant="outline">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef}
              className="w-full h-96 border rounded-lg"
              style={{ minHeight: '400px' }}
            />
            
            {/* Fallback iframe map if Leaflet fails */}
            {!map && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {isRTL ? "جاري تحميل الخريطة..." : "Loading map..."}
                  </p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    {isRTL ? "جاري البحث..." : "Searching..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Coordinate Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">
                {isRTL ? "خط العرض" : "Latitude"}
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={selectedLocation?.latitude || ''}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value)
                  if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                    setSelectedLocation(prev => prev ? { ...prev, latitude: lat } : { address: "", latitude: lat, longitude: 0 })
                    setMapCenter(prev => ({ ...prev, lat }))
                    // Update map if it exists
                    if (map && selectedLocation?.longitude) {
                      const L = (window as any).L
                      clearAllMarkers(map)
                      const newMarker = L.marker([lat, selectedLocation.longitude]).addTo(map)
                      setMarker(newMarker)
                      map.setView([lat, selectedLocation.longitude], 15)
                    }
                  }
                }}
                placeholder="e.g., 24.7136"
              />
            </div>
            <div>
              <Label htmlFor="longitude">
                {isRTL ? "خط الطول" : "Longitude"}
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={selectedLocation?.longitude || ''}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value)
                  if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                    setSelectedLocation(prev => prev ? { ...prev, longitude: lng } : { address: "", latitude: 0, longitude: lng })
                    setMapCenter(prev => ({ ...prev, lng }))
                    // Update map if it exists
                    if (map && selectedLocation?.latitude) {
                      const L = (window as any).L
                      clearAllMarkers(map)
                      const newMarker = L.marker([selectedLocation.latitude, lng]).addTo(map)
                      setMarker(newMarker)
                      map.setView([selectedLocation.latitude, lng], 15)
                    }
                  }
                }}
                placeholder="e.g., 46.6753"
              />
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">
                  {isRTL ? "الموقع المحدد:" : "Selected Location:"}
                </span>
              </div>
              <p className="text-sm text-green-700 mb-1">{selectedLocation.address}</p>
              <p className="text-xs text-green-600">
                {isRTL ? "الإحداثيات:" : "Coordinates:"} {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="mb-1">
              {isRTL ? "• اسحب الخريطة بالماوس للتنقل" : "• Drag the map with your mouse to navigate"}
            </p>
            <p className="mb-1">
              {isRTL ? "• انقر مباشرة على الخريطة لتحديد الموقع" : "• Click directly on the map to select a location"}
            </p>
            <p className="mb-1">
              {isRTL ? "• استخدم شريط البحث للعثور على عنوان محدد" : "• Use the search bar to find a specific address"}
            </p>
            <p className="mb-1">
              {isRTL ? "• استخدم زر الموقع الحالي للحصول على موقعك" : "• Use the current location button to get your position"}
            </p>
            <p className="mb-1">
              {isRTL ? "• أدخل الإحداثيات يدوياً في الحقول أعلاه" : "• Enter coordinates manually in the fields above"}
            </p>
            <p>
              {isRTL ? "• سيتم عرض العنوان والإحداثيات تلقائياً" : "• Address and coordinates will be displayed automatically"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedLocation}
            >
              <Check className="h-4 w-4 mr-2" />
              {isRTL ? "تأكيد الموقع" : "Confirm Location"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
