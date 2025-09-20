<<<<<<< Updated upstream
import dynamic from "next/dynamic"

// Dynamically import the client-side map component to avoid SSR issues
const LiveMapClient = dynamic(() => import("./live-map-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh] bg-gray-50 rounded-md">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function LiveMapTab() {
  return <LiveMapClient />
=======
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

// Using Leaflet directly to avoid double-initialization issues in dev Strict Mode
// Fix default marker icons (Next.js bundlers don't auto-resolve Leaflet images)
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

// Online representative icon (green)
const OnlineIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

// Offline representative icon (red)
const OfflineIcon = L.icon({
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

export default function LiveMapTab() {
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
      // Try to fetch representative live locations first
      const { data: repData, error: repError } = await getRepresentativeLiveLocations()
      if (repError) {
        console.error('Error fetching representative live locations:', repError)
        // If representatives fail, try customers as fallback
        const { data: customerData, error: customerError } = await getCustomers()
        if (customerError) {
          throw new Error(repError)
        }
        console.log('Fetched customers as fallback:', customerData)
        setCustomers(customerData || [])
        setRepresentatives([])
      } else {
        console.log('Fetched representative live locations:', repData)
        setRepresentatives(repData || [])
        setCustomers([])
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
    
    // Add representative markers
    representatives.forEach((rep) => {
      if (rep.latitude && rep.longitude) {
        const marker = L.marker([Number(rep.latitude), Number(rep.longitude)], {
          icon: rep.is_online ? OnlineIcon : OfflineIcon
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
      }
    })
    
    // Add customer markers (fallback)
    customers.forEach((customer) => {
      if (customer.latitude && customer.longitude) {
        const marker = L.marker([Number(customer.latitude), Number(customer.longitude)], {
          icon: DefaultIcon
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
      }
    })
  }, [representatives, customers, isRTL])

  const onlineCount = representatives.filter(r => r.is_online).length
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
                <div className="text-sm text-gray-600">{isRTL ? "مندوبين متصلين" : "Online Representatives"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{customers.length}</div>
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
            {isRTL ? "تحديث تلقائي كل دقيقة - الأخضر = مندوبين متصلين، الأزرق = عملاء" : "Auto-refresh every minute - Green = Online Representatives, Blue = Customers"}
          </p>
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
>>>>>>> Stashed changes
}