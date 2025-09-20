"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, RefreshCw, Users, Wifi, WifiOff, Battery, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getRepresentativeLiveLocations, RepresentativeWithLocation } from "@/lib/representative-live-locations"
import { getCustomers, Customer } from "@/lib/customers"
import { toast } from "sonner"

// Custom marker icons using Font Awesome icons as base64 data URLs
const createCustomIcon = (icon: string, color: string, size: number = 32) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size
  canvas.height = size

  // Draw circle background
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI)
  ctx.fill()

  // Draw white border
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw icon (simplified text-based icons)
  ctx.fillStyle = 'white'
  ctx.font = `${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, size / 2, size / 2)

  return canvas.toDataURL()
}

// Customer icon (blue with user icon)
const CustomerIcon = L.icon({
  iconUrl: createCustomIcon('👤', '#3B82F6', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Online representative icon (green with person icon)
const OnlineRepresentativeIcon = L.icon({
  iconUrl: createCustomIcon('👨‍💼', '#10B981', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Offline representative icon (red with person icon)
const OfflineRepresentativeIcon = L.icon({
  iconUrl: createCustomIcon('👨‍💼', '#EF4444', 32),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [16, -8],
})

// Default icon for fallback
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

L.Marker.prototype.options.icon = DefaultIcon

export default function LiveMapClient() {
  const { isRTL } = useLanguage()
  const [representatives, setRepresentatives] = useState<RepresentativeWithLocation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mapKey] = useState(() => `map-${Date.now()}`)
  const mapRef = useRef<L.Map | null>(null)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch both representatives and customers simultaneously
      const [repResult, customerResult] = await Promise.all([
        getRepresentativeLiveLocations(),
        getCustomers()
      ])
      
      console.log('Representative data:', repResult.data, 'Error:', repResult.error)
      console.log('Customer data:', customerResult.data, 'Error:', customerResult.error)
      
      // Set both datasets regardless of individual errors
      setRepresentatives(repResult.data || [])
      setCustomers(customerResult.data || [])
      
      // Only show error if both fail completely
      if (repResult.error && customerResult.error) {
        throw new Error('Failed to load both representatives and customers')
      }
      
      // Show warnings for partial failures
      if (repResult.error) {
        console.warn('Representative data failed to load:', repResult.error)
        toast.warning('Representative locations could not be loaded')
      }
      if (customerResult.error) {
        console.warn('Customer data failed to load:', customerResult.error)
        toast.warning('Customer locations could not be loaded')
      }
      
      setLastUpdated(new Date())
    } catch (e: any) {
      console.error('Error in fetchData:', e)
      setError(e?.message || "Failed to load data")
      toast.error(e?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
    // Update every minute (60 seconds)
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const center = useMemo(() => {
    if (representatives.length > 0) {
      const first = representatives.find(r => r.latitude && r.longitude)
      if (first) return [Number(first.latitude), Number(first.longitude)] as [number, number]
    }
    if (customers.length > 0) {
      const first = customers.find(c => c.latitude && c.longitude)
      if (first) return [Number(first.latitude), Number(first.longitude)] as [number, number]
    }
    return [33.3152, 44.3661] as [number, number] // Baghdad fallback
  }, [representatives, customers])

  // Initialize Leaflet map once after mount
  useEffect(() => {
    if (!mounted) return
    if (mapRef.current || !mapDivRef.current) return
    const map = L.map(mapDivRef.current).setView(center, 11)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    markersLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [mounted])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center)
    }
  }, [center])

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return
    const layer = markersLayerRef.current
    layer.clearLayers()
    
    console.log('Updating markers - Representatives:', representatives.length, 'Customers:', customers.length)
    
    // Add representative markers
    representatives.forEach((rep, index) => {
      console.log(`Representative ${index}:`, rep)
      // Show marker for all reps, even if coordinates are 0/null/undefined
      let lat = typeof rep.latitude === 'number' ? rep.latitude : 0;
      let lng = typeof rep.longitude === 'number' ? rep.longitude : 0;
      const marker = L.marker([lat, lng], {
        icon: rep.is_online ? OnlineRepresentativeIcon : OfflineRepresentativeIcon
      })
      
      const lastSeen = new Date(rep.last_seen || rep.timestamp)
      const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60))
      
      const html = `<div style="line-height:1.3; min-width: 200px;">
        <div style="font-weight:600; font-size:14px; margin-bottom:4px;">
          ${rep.representative_name || 'Unknown Representative'}
        </div>
        <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
          📞 ${rep.representative_phone || 'N/A'}
        </div>
        <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
          🆔 ${rep.representative_id}
        </div>
        <div style="display:flex; align-items:center; gap:4px; margin-bottom:2px;">
          ${rep.is_online ? 
            '<span style="color:#10b981; font-size:12px;">🟢 Online</span>' : 
            '<span style="color:#ef4444; font-size:12px;">🔴 Offline</span>'
          }
        </div>
        <div style="font-size:11px; color:#6b7280;">
          ${isRTL ? 'آخر ظهور:' : 'Last seen:'} ${minutesAgo} ${isRTL ? 'دقيقة' : 'min'} ago
        </div>
        ${rep.battery_level !== null ? `
          <div style="font-size:11px; color:#6b7280; display:flex; align-items:center; gap:2px;">
            🔋 ${rep.battery_level}% ${rep.is_charging ? '(Charging)' : ''}
          </div>
        ` : ''}
        ${rep.speed !== null ? `
          <div style="font-size:11px; color:#6b7280;">
            🚗 ${rep.speed} km/h
          </div>
        ` : ''}
      </div>`
      
      marker.bindPopup(html)
      marker.addTo(layer)
      console.log(`Added representative marker at: ${lat}, ${lng}`)
    })
    
    // Add customer markers (fallback)
    customers.forEach((customer, index) => {
      console.log(`Customer ${index}:`, customer)
      if (customer.latitude && customer.longitude) {
        const marker = L.marker([Number(customer.latitude), Number(customer.longitude)], {
          icon: CustomerIcon
        })
        
        const html = `<div style="line-height:1.3; min-width: 200px;">
          <div style="font-weight:600; font-size:14px; margin-bottom:4px;">
            ${customer.name}
          </div>
          <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
            📞 ${customer.phone || 'N/A'}
          </div>
          <div style="font-size:12px; color:#4b5563; margin-bottom:2px;">
            🆔 ${customer.customer_id}
          </div>
          <div style="font-size:11px; color:#6b7280;">
            ${isRTL ? 'الحالة:' : 'Status:'} ${customer.status}
          </div>
          <div style="font-size:11px; color:#6b7280;">
            ${isRTL ? 'العنوان:' : 'Address:'} ${customer.address || 'N/A'}
          </div>
        </div>`
        
        marker.bindPopup(html)
        marker.addTo(layer)
        console.log(`Added customer marker at: ${customer.latitude}, ${customer.longitude}`)
      } else {
        console.log(`Customer ${index} missing coordinates:`, customer.latitude, customer.longitude)
      }
    })
    
    console.log(`Total markers added: ${layer.getLayers().length}`)
  }, [representatives, customers, isRTL])

  const onlineRepCount = representatives.filter(r => r.is_online).length
  const offlineRepCount = representatives.filter(r => !r.is_online).length
  const customerCount = customers.length
  const totalCount = representatives.length + customers.length

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          {isRTL ? "الخريطة المباشرة" : "Live Map"}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isRTL ? "آخر تحديث:" : "Last updated:"} {lastUpdated.toLocaleTimeString(isRTL ? 'ar-IQ' : undefined)}
            </span>
          )}
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "إجمالي النقاط" : "Total Locations"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{onlineRepCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "مندوبين متصلين" : "Online Reps"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{offlineRepCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "مندوبين غير متصلين" : "Offline Reps"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{customerCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "عملاء" : "Customers"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isRTL ? "الخريطة المباشرة" : "Live Map"}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isRTL ? "تحديث تلقائي كل دقيقة" : "Auto-refresh every minute"}
          </p>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                👨‍💼
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "مندوبين متصلين" : "Online Representatives"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                👨‍💼
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "مندوبين غير متصلين" : "Offline Representatives"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                👤
              </div>
              <span className="text-sm text-gray-700">
                {isRTL ? "عملاء" : "Customers"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 text-red-600 text-sm">{error}</div>
          )}
          <div key={mapKey} className="h-[70vh] w-full rounded-md overflow-hidden border">
            {mounted && (
              <div ref={mapDivRef} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
