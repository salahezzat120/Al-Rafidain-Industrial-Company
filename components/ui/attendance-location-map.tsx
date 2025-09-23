"use client"

import React, { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface AttendanceLocationMapProps {
  checkInLat?: number | null
  checkInLng?: number | null
  checkOutLat?: number | null
  checkOutLng?: number | null
  representativeName?: string
  className?: string
}

export function AttendanceLocationMap({
  checkInLat,
  checkInLng,
  checkOutLat,
  checkOutLng,
  representativeName,
  className = ""
}: AttendanceLocationMapProps) {
  const { isRTL } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  // Check if we have any location data
  const hasCheckInLocation = checkInLat && checkInLng
  const hasCheckOutLocation = checkOutLat && checkOutLng
  const hasAnyLocation = hasCheckInLocation || hasCheckOutLocation

  // Calculate map center
  const getMapCenter = () => {
    if (hasCheckInLocation) {
      return [checkInLat!, checkInLng!] as [number, number]
    }
    if (hasCheckOutLocation) {
      return [checkOutLat!, checkOutLng!] as [number, number]
    }
    // Default to Riyadh, Saudi Arabia
    return [24.7136, 46.6753] as [number, number]
  }

  const initializeMap = async () => {
    if (!mapRef.current || mapInstanceRef.current) return

    try {
      // Dynamically import Leaflet
      const L = (await import('leaflet')).default

      // Fix for default markers in React
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      console.log('Initializing map with center:', getMapCenter())

      const mapCenter = getMapCenter()
      
      // Ensure the map container has proper dimensions
      if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
        console.warn('Map container has no dimensions, setting default size')
        mapRef.current.style.width = '100%'
        mapRef.current.style.height = '256px'
      }
      
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: hasAnyLocation ? 15 : 10,
        zoomControl: true,
        preferCanvas: false
      })
      
      console.log('Map created successfully')

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)

      // Add markers for check-in and check-out locations
      if (hasCheckInLocation) {
        const checkInIcon = L.divIcon({
          html: `
            <div style="
              background-color: #10b981;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              IN
            </div>
          `,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })

        const checkInMarker = L.marker([checkInLat!, checkInLng!], { icon: checkInIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>${isRTL ? 'موقع الحضور' : 'Check In Location'}</strong><br/>
              <small>${representativeName || ''}</small><br/>
              <small>${checkInLat!.toFixed(6)}, ${checkInLng!.toFixed(6)}</small>
            </div>
          `)

        markersRef.current.push(checkInMarker)
      }

      if (hasCheckOutLocation) {
        const checkOutIcon = L.divIcon({
          html: `
            <div style="
              background-color: #ef4444;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              OUT
            </div>
          `,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })

        const checkOutMarker = L.marker([checkOutLat!, checkOutLng!], { icon: checkOutIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>${isRTL ? 'موقع المغادرة' : 'Check Out Location'}</strong><br/>
              <small>${representativeName || ''}</small><br/>
              <small>${checkOutLat!.toFixed(6)}, ${checkOutLng!.toFixed(6)}</small>
            </div>
          `)

        markersRef.current.push(checkOutMarker)
      }

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }

    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError(true)
      setMapLoaded(false)
    }
  }

  useEffect(() => {
    if (hasAnyLocation) {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        initializeMap()
      }, 100)
      
      return () => clearTimeout(timer)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [checkInLat, checkInLng, checkOutLat, checkOutLng])

  const openInGoogleMaps = () => {
    const center = getMapCenter()
    const url = `https://www.google.com/maps?q=${center[0]},${center[1]}`
    window.open(url, '_blank')
  }

  if (!hasAnyLocation) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">
            {isRTL ? 'لا توجد معلومات موقع متاحة' : 'No location information available'}
          </p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-500 mb-3">
            {isRTL ? 'خطأ في تحميل الخريطة' : 'Error loading map'}
          </p>
          <Button variant="outline" size="sm" onClick={initializeMap}>
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {isRTL ? 'موقع الحضور والانصراف' : 'Attendance Locations'}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openInGoogleMaps}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {isRTL ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
        </Button>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-gray-200"
          style={{ minHeight: '256px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                {isRTL ? 'جاري تحميل الخريطة...' : 'Loading map...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-sm">
        {hasCheckInLocation && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">
              {isRTL ? 'موقع الحضور' : 'Check In Location'}
            </span>
          </div>
        )}
        {hasCheckOutLocation && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">
              {isRTL ? 'موقع المغادرة' : 'Check Out Location'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
